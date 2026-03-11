const path = require("path");
const fs = require("fs/promises");
const express = require("express");
const fetch = require("node-fetch");
const { HttpsProxyAgent } = require("https-proxy-agent");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const { Pool } = require("pg");
const nodemailer = require("nodemailer");
const Stripe = require("stripe");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const pgSessionFactory = require("connect-pg-simple");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "127.0.0.1";
const PUBLIC_URL =
  process.env.PUBLIC_URL || `http://${process.env.HOST || "127.0.0.1"}:${PORT}`;
const isProduction =
  process.env.NODE_ENV === "production" ||
  (process.env.PUBLIC_URL || "").startsWith("https://");
const API_TOKEN = process.env.CR_API_TOKEN;
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret";
const DATABASE_URL = process.env.DATABASE_URL;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const STRIPE_CONNECT_REFRESH_URL =
  process.env.STRIPE_CONNECT_REFRESH_URL ||
  `${PUBLIC_URL}/?shop=cashout-refresh`;
const STRIPE_CONNECT_RETURN_URL =
  process.env.STRIPE_CONNECT_RETURN_URL || `${PUBLIC_URL}/?shop=cashout-return`;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER || "no-reply@betroyale.win";
const CR_API_PROXY_URL_RAW =
  process.env.CR_API_PROXY_URL || process.env.QUOTAGUARDSTATIC_URL || "";

function resolveProxyConfig(rawProxyValue) {
  const trimmed = String(rawProxyValue || "").trim();
  if (!trimmed) {
    return { url: "", agent: null };
  }

  const candidate = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `http://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    if (!parsed.hostname) {
      throw new Error("missing hostname");
    }
    return {
      url: candidate,
      agent: new HttpsProxyAgent(candidate),
    };
  } catch (err) {
    console.warn(
      `Ignoring invalid CR API proxy value. Check CR_API_PROXY_URL/QUOTAGUARDSTATIC_URL. Value: "${trimmed}"`
    );
    return { url: "", agent: null };
  }
}

const { url: CR_API_PROXY_URL, agent: crApiAgent } = resolveProxyConfig(
  CR_API_PROXY_URL_RAW
);

const STORE_PATH =
  process.env.STORE_PATH || path.join(__dirname, "data", "store.json");
function resolveDatabaseSslOption(databaseUrl) {
  if (!databaseUrl) return false;
  const explicitSsl = String(
    process.env.DATABASE_SSL || process.env.DB_SSL || process.env.PGSSLMODE || ""
  )
    .trim()
    .toLowerCase();

  if (explicitSsl) {
    if (
      explicitSsl === "disable" ||
      explicitSsl === "false" ||
      explicitSsl === "0" ||
      explicitSsl === "off" ||
      explicitSsl === "no"
    ) {
      return false;
    }
    return { rejectUnauthorized: false };
  }

  try {
    const hostname = new URL(databaseUrl).hostname || "";
    const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";
    const isRenderInternalHost =
      hostname.startsWith("dpg-") && !hostname.includes(".");
    if (isLocalHost || isRenderInternalHost) {
      return false;
    }
  } catch (err) {
    // Fall back to SSL enabled for non-parseable URLs.
  }
  return { rejectUnauthorized: false };
}

const DATABASE_SSL_OPTION = resolveDatabaseSslOption(DATABASE_URL);
let pool = DATABASE_URL
  ? new Pool({
      connectionString: DATABASE_URL,
      ssl: DATABASE_SSL_OPTION,
    })
  : null;
if (pool) {
  console.log(
    `Database configured (${DATABASE_SSL_OPTION ? "SSL enabled" : "SSL disabled"})`
  );
}
const PgSession = pgSessionFactory(session);
const sessionStore = pool
  ? new PgSession({
      pool,
      tableName: "user_sessions",
      createTableIfMissing: true,
    })
  : null;

function disablePool(err) {
  console.warn(
    "Database unreachable — falling back to file storage.",
    err?.message || ""
  );
  pool = null;
}
const mailTransport =
  EMAIL_USER && EMAIL_PASS
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS,
        },
      })
    : null;
const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" })
  : null;
const ADMIN_SECRET = process.env.ADMIN_SECRET || "";
const QUEUE_TTL_MS = 1000 * 60 * 30;
const MATCH_TTL_MS = 1000 * 60 * 60 * 6;
const MATCH_LOCK_MS = 1000 * 60 * 2;
const STARTING_CREDITS = 1000;
const WINNER_PCT = 0.9; // winner receives 90% of total pot; 10% is the house cut
const REFERRAL_BONUS_CREDITS    = 1500;  // coins both users earn on a qualifying referral
const REFERRAL_MIN_DEPOSIT_CENTS = 1500; // $15 minimum first deposit to trigger bonus
const VERIFICATION_TTL_MS = 1000 * 60 * 30;
const MIN_GEM_PURCHASE_CENTS = 1000;
const MAX_GEM_PURCHASE_CENTS = 100000;
const MIN_CASHOUT_CENTS = 1000;
const MAX_CASHOUT_CENTS = 100000;
const MAX_WAGER_GEMS   = 500;  // maximum per-match gem wager
const MAX_WAGER_COINS  = 500;  // maximum per-match coin wager
const WEEKLY_DEPOSIT_WINDOW_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const GEM_LEADERBOARD_MONTHLY_PRIZES = [1500, 1250, 1000, 750, 500];
const COIN_TO_GEM_COINS = Number.parseInt(
  process.env.COIN_GEM_EXCHANGE_COINS || "1000",
  10
);
const COIN_TO_GEM_GEMS = Number.parseInt(
  process.env.COIN_GEM_EXCHANGE_GEMS || "100",
  10
);
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;
const waitingQueue = [];
const tickets = new Map();
const matches = new Map();

let store = {
  users: [],
  recordedMatches: {},
  activeMatches: {},
  migrations: {},
  leaderboardRewards: {},
  purchases: {},
  cashouts: {},
};

let writeChain = Promise.resolve();

function parseJsonValue(value, fallback = null) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "object") return value;
  if (typeof value !== "string") return fallback;
  try {
    return JSON.parse(value);
  } catch (err) {
    return fallback;
  }
}

async function ensureDatabaseSchema() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      tag TEXT,
      friend_link TEXT,
      credits INTEGER,
      gems INTEGER,
      stats JSONB,
      active_match_id TEXT,
      active_match_until BIGINT,
      player_profile JSONB,
      is_verified BOOLEAN,
      verification_code TEXT,
      verification_expires_at BIGINT,
      created_at BIGINT,
      updated_at BIGINT
    )
  `);
  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS stripe_connect_account_id TEXT
  `);
  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS stripe_connect_ready BOOLEAN DEFAULT FALSE
  `);
  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS referral_code TEXT
  `);
  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS referred_by TEXT
  `);
  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS referral_reward_paid BOOLEAN DEFAULT FALSE
  `);
  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0
  `);
  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS referral_completed_count INTEGER DEFAULT 0
  `);
  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS self_excluded BOOLEAN DEFAULT FALSE
  `);
  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS dob TEXT
  `);
  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS deposit_limit_weekly INTEGER
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS recorded_matches (
      match_key TEXT PRIMARY KEY,
      match_id TEXT,
      tag_a TEXT,
      tag_b TEXT,
      wager_a INTEGER,
      wager_b INTEGER,
      currency_a TEXT,
      currency_b TEXT,
      recorded_at TEXT
    )
  `);
  await pool.query(`
    ALTER TABLE recorded_matches
    ADD COLUMN IF NOT EXISTS details JSONB
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value JSONB
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS purchases (
      session_id TEXT PRIMARY KEY,
      user_id TEXT,
      amount_cents INTEGER,
      gems INTEGER,
      created_at BIGINT
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cashouts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      stripe_transfer_id TEXT,
      stripe_account_id TEXT,
      gems INTEGER NOT NULL,
      amount_cents INTEGER NOT NULL,
      status TEXT NOT NULL,
      error TEXT,
      created_at BIGINT,
      updated_at BIGINT
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS active_matches (
      id TEXT PRIMARY KEY,
      data JSONB,
      created_at BIGINT,
      expires_at BIGINT
    )
  `);
}

if (!API_TOKEN) {
  console.warn("Missing CR_API_TOKEN in .env");
}
if (CR_API_PROXY_URL) {
  console.log("Using CR_API_PROXY_URL for Clash Royale API requests.");
}
if (!mailTransport) {
  console.warn("Missing EMAIL_USER/EMAIL_PASS; verification emails disabled.");
}
if (!stripe) {
  console.warn("Missing STRIPE_SECRET_KEY; shop checkout disabled.");
}
if (!STRIPE_WEBHOOK_SECRET) {
  console.warn("Missing STRIPE_WEBHOOK_SECRET; Stripe webhooks disabled.");
}

function normalizeOrigin(origin) {
  try {
    const parsed = new URL(origin);
    return parsed.origin;
  } catch (err) {
    return null;
  }
}

function collectAllowedOrigins() {
  const envOrigins = String(process.env.CORS_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const defaults = [PUBLIC_URL, "http://localhost:3000", "http://127.0.0.1:3000"];
  const origins = [...defaults, ...envOrigins]
    .map(normalizeOrigin)
    .filter(Boolean);
  return new Set(origins);
}

const allowedOrigins = collectAllowedOrigins();
const corsOriginsConfigured = String(process.env.CORS_ORIGINS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean).length > 0;
const authRateLimiter = rateLimit({
  windowMs: 1000 * 60 * 15,
  limit: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many auth attempts. Please try again soon." },
});
const queueRateLimiter = rateLimit({
  windowMs: 1000 * 60,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many queue requests. Please slow down." },
});
const financeRateLimiter = rateLimit({
  windowMs: 1000 * 60 * 5,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many payment requests. Please try again shortly." },
});

app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    if (!stripe || !STRIPE_WEBHOOK_SECRET) {
      console.warn("Stripe webhook received but Stripe is not fully configured.");
      return res.status(400).send("Stripe not configured.");
    }
    const signature = req.headers["stripe-signature"];
    let event = null;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Stripe webhook signature verification failed:", err.message);
      return res.status(400).send("Invalid signature.");
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (session.payment_status === "paid") {
        const sessionId = session.id;
        const userId = session.metadata?.userId;
        const gems = Number(session.metadata?.gems) || 0;
        const amountCents = Number(session.amount_total) || 0;

        if (userId && gems > 0) {
          const wasRecorded = await recordPurchase(
            sessionId,
            userId,
            amountCents,
            gems
          );
          if (!wasRecorded) {
            return res.json({ received: true });
          }
          const user = findUserById(userId);
          if (user) {
            user.gems = Math.max(0, (user.gems || 0) + gems);
            user.updatedAt = Date.now();

            // Referral bonus: first deposit ≥ $15 by a referred user
            if (
              !user.referralRewardPaid &&
              user.referredBy &&
              amountCents >= REFERRAL_MIN_DEPOSIT_CENTS
            ) {
              const referrer = findUserById(user.referredBy);
              if (referrer) {
                referrer.credits = Math.max(0, (referrer.credits || 0) + REFERRAL_BONUS_CREDITS);
                referrer.referralCompletedCount = (referrer.referralCompletedCount || 0) + 1;
                referrer.updatedAt = Date.now();
              }
              user.credits = Math.max(0, (user.credits || 0) + REFERRAL_BONUS_CREDITS);
              user.referralRewardPaid = true;
            }

            await saveStore();
          }
        }
      }
    }

    return res.json({ received: true });
  }
);

app.set("trust proxy", 1);
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  })
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (!corsOriginsConfigured) {
        callback(null, true);
        return;
      }
      const normalized = normalizeOrigin(origin);
      if (normalized && allowedOrigins.has(normalized)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
const sessionConfig = {
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    maxAge: SESSION_MAX_AGE_MS,
  },
};
if (sessionStore) {
  sessionConfig.store = sessionStore;
}
app.use(
  session(sessionConfig)
);
// Serve .well-known (dotfiles) for Digital Asset Links (TWA / Play Store)
app.use(
  "/.well-known",
  express.static(path.join(__dirname, "public/.well-known"), { dotfiles: "allow" })
);
app.use(express.static(path.join(__dirname, "public")));
app.use((err, req, res, next) => {
  if (err && String(err.message || "").startsWith("Not allowed by CORS")) {
    return res.status(403).json({ error: "Origin not allowed." });
  }
  return next(err);
});

async function loadStore() {
  try {
    if (pool) {
      await ensureDatabaseSchema();
      const [userResult, matchResult, metaResult, cashoutResult, activeMatchResult] =
        await Promise.all([
        pool.query("SELECT * FROM users"),
        pool.query("SELECT * FROM recorded_matches"),
        pool.query("SELECT key, value FROM app_meta"),
        pool.query("SELECT * FROM cashouts"),
        pool.query("SELECT * FROM active_matches WHERE expires_at > $1", [Date.now()]),
      ]);
      const metaByKey = Object.fromEntries(
        metaResult.rows.map((row) => [row.key, parseJsonValue(row.value, null)])
      );

      store = {
        users: userResult.rows.map((row) => ({
          id: row.id,
          email: row.email,
          passwordHash: row.password_hash,
          username: row.username,
          tag: row.tag || "",
          friendLink: row.friend_link || "",
          credits:
            typeof row.credits === "number" ? row.credits : STARTING_CREDITS,
          gems: typeof row.gems === "number" ? row.gems : 0,
          stats: parseJsonValue(row.stats, null),
          activeMatchId: row.active_match_id,
          activeMatchUntil: row.active_match_until,
          playerProfile: parseJsonValue(row.player_profile, null),
          isVerified:
            typeof row.is_verified === "boolean" ? row.is_verified : true,
          verificationCode: row.verification_code,
          verificationExpiresAt: row.verification_expires_at,
          stripeConnectAccountId: row.stripe_connect_account_id || null,
          stripeConnectReady: Boolean(row.stripe_connect_ready),
          referralCode: row.referral_code || null,
          referredBy: row.referred_by || null,
          referralRewardPaid: Boolean(row.referral_reward_paid),
          referralCount:
            typeof row.referral_count === "number" ? row.referral_count : 0,
          referralCompletedCount:
            typeof row.referral_completed_count === "number"
              ? row.referral_completed_count
              : 0,
          selfExcluded: Boolean(row.self_excluded),
          dob: row.dob || null,
          depositLimitWeekly:
            typeof row.deposit_limit_weekly === "number"
              ? row.deposit_limit_weekly
              : null,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        })),
        recordedMatches: {},
        activeMatches: {},
        migrations: metaByKey.migrations || {},
        leaderboardRewards: metaByKey.leaderboard_rewards || {},
        purchases: {},
        cashouts: {},
      };

      activeMatchResult.rows.forEach((row) => {
        const data = parseJsonValue(row.data, null);
        if (data && data.id) {
          store.activeMatches[data.id] = data;
        }
      });

      matchResult.rows.forEach((row) => {
        const details = parseJsonValue(row.details, {});
        store.recordedMatches[row.match_key] = {
          matchId: row.match_id,
          tagA: row.tag_a,
          tagB: row.tag_b,
          userIdA: details?.userIdA || null,
          userIdB: details?.userIdB || null,
          usernameA: details?.usernameA || "",
          usernameB: details?.usernameB || "",
          wagerA: row.wager_a,
          wagerB: row.wager_b,
          currencyA: row.currency_a,
          currencyB: row.currency_b,
          recordedAt: row.recorded_at,
          battleTime: details?.battleTime || null,
          battleType: details?.battleType || "",
          gameModeName: details?.gameModeName || "",
          teamCrowns:
            typeof details?.teamCrowns === "number" ? details.teamCrowns : null,
          opponentCrowns:
            typeof details?.opponentCrowns === "number"
              ? details.opponentCrowns
              : null,
          resultByTag:
            details?.resultByTag && typeof details.resultByTag === "object"
              ? details.resultByTag
              : {},
          battleSummary:
            details?.battleSummary && typeof details.battleSummary === "object"
              ? details.battleSummary
              : null,
        };
      });

      cashoutResult.rows.forEach((row) => {
        store.cashouts[row.id] = {
          id: row.id,
          userId: row.user_id,
          stripeTransferId: row.stripe_transfer_id,
          stripeAccountId: row.stripe_account_id,
          gems: row.gems,
          amountCents: row.amount_cents,
          status: row.status,
          error: row.error,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      });
    } else {
      const raw = await fs.readFile(STORE_PATH, "utf8");
      const parsed = JSON.parse(raw);
      store = {
        users: Array.isArray(parsed.users) ? parsed.users : [],
        recordedMatches:
          parsed.recordedMatches && typeof parsed.recordedMatches === "object"
            ? parsed.recordedMatches
            : {},
        activeMatches:
          parsed.activeMatches && typeof parsed.activeMatches === "object"
            ? parsed.activeMatches
            : {},
        migrations:
          parsed.migrations && typeof parsed.migrations === "object"
            ? parsed.migrations
            : {},
        leaderboardRewards:
          parsed.leaderboardRewards &&
          typeof parsed.leaderboardRewards === "object"
            ? parsed.leaderboardRewards
            : {},
        purchases:
          parsed.purchases && typeof parsed.purchases === "object"
            ? parsed.purchases
            : {},
        cashouts:
          parsed.cashouts && typeof parsed.cashouts === "object"
            ? parsed.cashouts
            : {},
      };
    }
    // Restore persisted active matches into the in-memory Map
    for (const [matchId, match] of Object.entries(store.activeMatches || {})) {
      if (Date.now() - (match.createdAt || 0) <= MATCH_TTL_MS) {
        matches.set(matchId, match);
      } else {
        delete store.activeMatches[matchId];
      }
    }

    let changed = false;
    store.users.forEach((user) => {
      if (ensureUserDefaults(user)) {
        changed = true;
      }
    });
    if (!store.migrations.creditsSeeded) {
      store.users.forEach((user) => {
        if (
          typeof user.credits !== "number" ||
          !Number.isFinite(user.credits) ||
          user.credits < STARTING_CREDITS
        ) {
          user.credits = STARTING_CREDITS;
          user.updatedAt = Date.now();
          changed = true;
        }
      });
      store.migrations.creditsSeeded = true;
      changed = true;
    }
    if (changed) {
      await saveStore();
    }
  } catch (err) {
    if (pool) {
      // Database connection failed — disable pool and retry with file storage
      disablePool(err);
      return loadStore();
    }
    if (err.code !== "ENOENT") {
      throw err;
    }
    await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
    await saveStore();
  }
}

function saveStore() {
  writeChain = writeChain.then(async () => {
    if (!pool) {
      await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2));
      return;
    }
    let client;
    try {
      await ensureDatabaseSchema();
      client = await pool.connect();
    } catch (err) {
      disablePool(err);
      await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2));
      return;
    }
    try {
      await client.query("BEGIN");
      await client.query(
        `
        INSERT INTO app_meta (key, value)
        VALUES ($1, $2)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
        `,
        ["migrations", store.migrations || {}]
      );
      await client.query(
        `
        INSERT INTO app_meta (key, value)
        VALUES ($1, $2)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
        `,
        ["leaderboard_rewards", store.leaderboardRewards || {}]
      );

      for (const user of store.users) {
        await client.query(
          `
          INSERT INTO users (
            id,
            email,
            password_hash,
            username,
            tag,
            friend_link,
            credits,
            gems,
            stats,
            active_match_id,
            active_match_until,
            player_profile,
            is_verified,
            verification_code,
            verification_expires_at,
            stripe_connect_account_id,
            stripe_connect_ready,
            referral_code,
            referred_by,
            referral_reward_paid,
            referral_count,
            referral_completed_count,
            self_excluded,
            dob,
            deposit_limit_weekly,
            created_at,
            updated_at
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9,
            $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
            $20, $21, $22, $23, $24, $25, $26, $27
          )
          ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            password_hash = EXCLUDED.password_hash,
            username = EXCLUDED.username,
            tag = EXCLUDED.tag,
            friend_link = EXCLUDED.friend_link,
            credits = EXCLUDED.credits,
            gems = EXCLUDED.gems,
            stats = EXCLUDED.stats,
            active_match_id = EXCLUDED.active_match_id,
            active_match_until = EXCLUDED.active_match_until,
            player_profile = EXCLUDED.player_profile,
            is_verified = EXCLUDED.is_verified,
            verification_code = EXCLUDED.verification_code,
            verification_expires_at = EXCLUDED.verification_expires_at,
            stripe_connect_account_id = EXCLUDED.stripe_connect_account_id,
            stripe_connect_ready = EXCLUDED.stripe_connect_ready,
            referral_code = EXCLUDED.referral_code,
            referred_by = EXCLUDED.referred_by,
            referral_reward_paid = EXCLUDED.referral_reward_paid,
            referral_count = EXCLUDED.referral_count,
            referral_completed_count = EXCLUDED.referral_completed_count,
            self_excluded = EXCLUDED.self_excluded,
            dob = EXCLUDED.dob,
            deposit_limit_weekly = EXCLUDED.deposit_limit_weekly,
            created_at = EXCLUDED.created_at,
            updated_at = EXCLUDED.updated_at
          `,
          [
            user.id,
            user.email,
            user.passwordHash,
            user.username,
            user.tag || "",
            user.friendLink || "",
            Number.isFinite(user.credits) ? user.credits : STARTING_CREDITS,
            Number.isFinite(user.gems) ? user.gems : 0,
            user.stats || {},
            user.activeMatchId || null,
            user.activeMatchUntil || null,
            user.playerProfile || null,
            Boolean(user.isVerified),
            user.verificationCode || null,
            user.verificationExpiresAt || null,
            user.stripeConnectAccountId || null,
            Boolean(user.stripeConnectReady),
            user.referralCode || null,
            user.referredBy || null,
            Boolean(user.referralRewardPaid),
            Number.isFinite(user.referralCount) ? user.referralCount : 0,
            Number.isFinite(user.referralCompletedCount)
              ? user.referralCompletedCount
              : 0,
            Boolean(user.selfExcluded),
            user.dob || null,
            Number.isFinite(user.depositLimitWeekly) ? user.depositLimitWeekly : null,
            user.createdAt || null,
            user.updatedAt || null,
          ]
        );
      }

      for (const [matchKey, record] of Object.entries(
        store.recordedMatches || {}
      )) {
        await client.query(
          `
          INSERT INTO recorded_matches (
            match_key,
            match_id,
            tag_a,
            tag_b,
            wager_a,
            wager_b,
            currency_a,
            currency_b,
            recorded_at,
            details
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (match_key) DO UPDATE SET
            match_id = EXCLUDED.match_id,
            tag_a = EXCLUDED.tag_a,
            tag_b = EXCLUDED.tag_b,
            wager_a = EXCLUDED.wager_a,
            wager_b = EXCLUDED.wager_b,
            currency_a = EXCLUDED.currency_a,
            currency_b = EXCLUDED.currency_b,
            recorded_at = EXCLUDED.recorded_at,
            details = EXCLUDED.details
          `,
          [
            matchKey,
            record.matchId || null,
            record.tagA || null,
            record.tagB || null,
            Number.isFinite(record.wagerA) ? record.wagerA : 0,
            Number.isFinite(record.wagerB) ? record.wagerB : 0,
            record.currencyA || null,
            record.currencyB || null,
            record.recordedAt || null,
            {
              userIdA: record.userIdA || null,
              userIdB: record.userIdB || null,
              usernameA: record.usernameA || "",
              usernameB: record.usernameB || "",
              battleTime: record.battleTime || null,
              battleType: record.battleType || "",
              gameModeName: record.gameModeName || "",
              teamCrowns:
                typeof record.teamCrowns === "number" ? record.teamCrowns : null,
              opponentCrowns:
                typeof record.opponentCrowns === "number"
                  ? record.opponentCrowns
                  : null,
              resultByTag:
                record.resultByTag && typeof record.resultByTag === "object"
                  ? record.resultByTag
                  : {},
              battleSummary:
                record.battleSummary && typeof record.battleSummary === "object"
                  ? record.battleSummary
                  : null,
            },
          ]
        );
      }

      // Sync active matches — delete expired/removed, upsert current ones
      const activeIds = Object.keys(store.activeMatches || {});
      if (activeIds.length === 0) {
        await client.query("DELETE FROM active_matches");
      } else {
        await client.query(
          "DELETE FROM active_matches WHERE id != ALL($1::text[])",
          [activeIds]
        );
        for (const match of Object.values(store.activeMatches)) {
          const expiresAt = (match.createdAt || Date.now()) + MATCH_TTL_MS;
          await client.query(
            `INSERT INTO active_matches (id, data, created_at, expires_at)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, expires_at = EXCLUDED.expires_at`,
            [match.id, match, match.createdAt || Date.now(), expiresAt]
          );
        }
      }

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  });
  return writeChain;
}

async function recordPurchase(sessionId, userId, amountCents, gems) {
  if (!sessionId) return false;
  if (pool) {
    try {
      const result = await pool.query(
        `
        INSERT INTO purchases (session_id, user_id, amount_cents, gems, created_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (session_id) DO NOTHING
        `,
        [sessionId, userId || null, amountCents || 0, gems || 0, Date.now()]
      );
      return result.rowCount > 0;
    } catch (err) {
      disablePool(err);
    }
  }

  if (store.purchases?.[sessionId]) {
    return false;
  }
  if (!store.purchases) store.purchases = {};
  store.purchases[sessionId] = {
    sessionId,
    userId,
    amountCents,
    gems,
    createdAt: Date.now(),
  };
  await saveStore();
  return true;
}

async function recordCashout(cashout) {
  if (!cashout?.id) return;
  if (pool) {
    try {
      await pool.query(
        `
        INSERT INTO cashouts (
          id,
          user_id,
          stripe_transfer_id,
          stripe_account_id,
          gems,
          amount_cents,
          status,
          error,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          stripe_transfer_id = EXCLUDED.stripe_transfer_id,
          stripe_account_id = EXCLUDED.stripe_account_id,
          gems = EXCLUDED.gems,
          amount_cents = EXCLUDED.amount_cents,
          status = EXCLUDED.status,
          error = EXCLUDED.error,
          updated_at = EXCLUDED.updated_at
        `,
        [
          cashout.id,
          cashout.userId,
          cashout.stripeTransferId || null,
          cashout.stripeAccountId || null,
          Number.isFinite(cashout.gems) ? cashout.gems : 0,
          Number.isFinite(cashout.amountCents) ? cashout.amountCents : 0,
          cashout.status || "pending",
          cashout.error || null,
          cashout.createdAt || Date.now(),
          cashout.updatedAt || Date.now(),
        ]
      );
      return;
    } catch (err) {
      disablePool(err);
    }
  }

  if (!store.cashouts || typeof store.cashouts !== "object") {
    store.cashouts = {};
  }
  store.cashouts[cashout.id] = cashout;
  await saveStore();
}

async function listCashoutsForUser(userId, limit = 10) {
  if (!userId) return [];
  const safeLimit = Math.max(1, Math.min(Number(limit) || 10, 50));
  if (pool) {
    try {
      const result = await pool.query(
        `
        SELECT id, user_id, stripe_transfer_id, stripe_account_id, gems, amount_cents, status, error, created_at, updated_at
        FROM cashouts
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2
        `,
        [userId, safeLimit]
      );
      return result.rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        stripeTransferId: row.stripe_transfer_id,
        stripeAccountId: row.stripe_account_id,
        gems: row.gems,
        amountCents: row.amount_cents,
        status: row.status,
        error: row.error,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (err) {
      disablePool(err);
    }
  }

  return Object.values(store.cashouts || {})
    .filter((entry) => entry.userId === userId)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, safeLimit);
}

async function sendVerificationEmail({ email, username, code }) {
  if (!mailTransport) {
    throw new Error("Email transport is not configured.");
  }
  const safeName = username ? ` ${username}` : "";
  const subject = "BetRoyale verification code";
  const text = `Hi${safeName},\n\nYour BetRoyale verification code is: ${code}\n\nEnter this code to verify your account.\n\nIf you did not request this, you can ignore this email.`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #111;">
      <h2 style="margin: 0 0 12px;">BetRoyale verification</h2>
      <p>Hi${safeName},</p>
      <p>Your verification code is:</p>
      <div style="font-size: 22px; font-weight: bold; letter-spacing: 3px; margin: 12px 0;">
        ${code}
      </div>
      <p>Enter this code in the app to verify your account.</p>
      <p style="color: #666;">If you did not request this, you can ignore this email.</p>
    </div>
  `;

  await mailTransport.sendMail({
    from: EMAIL_FROM,
    to: email,
    subject,
    text,
    html,
  });
}

function sanitizeTag(tag) {
  if (!tag) return "";
  const cleaned = tag.trim().toUpperCase().replace(/[^0-9A-Z]/g, "");
  if (!cleaned) return "";
  return `#${cleaned}`;
}

function normalizeTagValue(tag) {
  if (!tag) return "";
  const cleaned = tag.trim().toUpperCase();
  if (!cleaned) return "";
  return cleaned.startsWith("#") ? cleaned : `#${cleaned}`;
}

function sanitizeFriendLink(link) {
  if (!link) return "";
  const trimmed = link.trim();
  if (!trimmed) return "";
  const urlMatch = trimmed.match(/https?:\/\/[^\s<>"']+/i);
  const candidate = urlMatch ? urlMatch[0] : trimmed;
  const cleaned = candidate.replace(/[),.;!?]+$/, "");
  return cleaned;
}

function sanitizeUsername(username) {
  if (!username) return "";
  const cleaned = username.trim().replace(/[^a-zA-Z0-9_-]/g, "");
  if (cleaned.length < 3) return "";
  return cleaned.slice(0, 24);
}

function isUsernameTaken(username, excludeUserId = null) {
  const lower = username.toLowerCase();
  return store.users.some((user) => {
    if (excludeUserId && user.id === excludeUserId) {
      return false;
    }
    return (user.username || "").toLowerCase() === lower;
  });
}

function parseWager(value) {
  if (value === undefined || value === null) return null;
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return null;
  const wager = Math.floor(numberValue);
  if (wager < 0) return null;
  return wager;
}

function parseWagerCurrency(value) {
  const normalized = String(value || "coins").trim().toLowerCase();
  if (normalized === "coins" || normalized === "coin") return "coins";
  if (normalized === "gems" || normalized === "gem") return "gems";
  return null;
}

function normalizeEmail(email) {
  if (!email) return "";
  return email.trim().toLowerCase();
}

function createId(size) {
  return crypto.randomBytes(size).toString("hex").toUpperCase();
}

function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Referral code helpers
const REFERRAL_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // omit 0/O/1/I
function generateReferralCode() {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += REFERRAL_CHARS[Math.floor(Math.random() * REFERRAL_CHARS.length)];
  }
  // Ensure uniqueness (retry on collision — vanishingly rare)
  if (store.users?.some((u) => u.referralCode === code)) return generateReferralCode();
  return code;
}
function findUserByReferralCode(code) {
  if (!code) return null;
  return store.users.find((u) => u.referralCode === code.toUpperCase());
}

function ensureUserDefaults(user) {
  let changed = false;
  if (!user.stats || typeof user.stats !== "object") {
    user.stats = {
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      lastResult: null,
      lastMatchAt: null,
    };
    changed = true;
  } else {
    if (typeof user.stats.matchesPlayed !== "number") {
      user.stats.matchesPlayed = 0;
      changed = true;
    }
    if (typeof user.stats.wins !== "number") {
      user.stats.wins = 0;
      changed = true;
    }
    if (typeof user.stats.losses !== "number") {
      user.stats.losses = 0;
      changed = true;
    }
    if (typeof user.stats.draws !== "number") {
      user.stats.draws = 0;
      changed = true;
    }
    if (!("lastResult" in user.stats)) {
      user.stats.lastResult = null;
      changed = true;
    }
    if (!("lastMatchAt" in user.stats)) {
      user.stats.lastMatchAt = null;
      changed = true;
    }
  }

  if (!user.tag) {
    user.tag = "";
    changed = true;
  }
  if (!user.friendLink) {
    user.friendLink = "";
    changed = true;
  }
  if (!user.username) {
    const base = user.email ? user.email.split("@")[0] : "";
    user.username = sanitizeUsername(base) || `player-${user.id.slice(0, 4)}`;
    changed = true;
  }
  if (typeof user.credits !== "number" || !Number.isFinite(user.credits)) {
    user.credits = STARTING_CREDITS;
    changed = true;
  }
  if (typeof user.gems !== "number" || !Number.isFinite(user.gems)) {
    user.gems = 0;
    changed = true;
  }
  if (!("activeMatchId" in user)) {
    user.activeMatchId = null;
    changed = true;
  }
  if (!("activeMatchUntil" in user)) {
    user.activeMatchUntil = null;
    changed = true;
  }
  if (!user.playerProfile || typeof user.playerProfile !== "object") {
    user.playerProfile = null;
    changed = true;
  }
  if (typeof user.isVerified !== "boolean") {
    user.isVerified = true;
    changed = true;
  }
  if (!("verificationCode" in user)) {
    user.verificationCode = null;
    changed = true;
  }
  if (!("verificationExpiresAt" in user)) {
    user.verificationExpiresAt = null;
    changed = true;
  }
  if (!("stripeConnectAccountId" in user)) {
    user.stripeConnectAccountId = null;
    changed = true;
  }
  if (typeof user.stripeConnectReady !== "boolean") {
    user.stripeConnectReady = false;
    changed = true;
  }
  // Referral fields — backfill existing accounts
  if (!user.referralCode) {
    user.referralCode = generateReferralCode();
    changed = true;
  }
  if (!("referredBy" in user)) {
    user.referredBy = null;
    changed = true;
  }
  if (typeof user.referralRewardPaid !== "boolean") {
    user.referralRewardPaid = false;
    changed = true;
  }
  if (typeof user.referralCount !== "number") {
    user.referralCount = 0;
    changed = true;
  }
  if (typeof user.referralCompletedCount !== "number") {
    user.referralCompletedCount = 0;
    changed = true;
  }
  if (typeof user.selfExcluded !== "boolean") {
    user.selfExcluded = false;
    changed = true;
  }
  if (!("dob" in user)) {
    user.dob = null;
    changed = true;
  }
  if (!("depositLimitWeekly" in user)) {
    user.depositLimitWeekly = null;
    changed = true;
  }
  return changed;
}

function createUser(email, passwordHash) {
  const now = Date.now();
  const verificationCode = generateVerificationCode();
  return {
    id: createId(6),
    email,
    passwordHash,
    username: "",
    tag: "",
    friendLink: "",
    credits: STARTING_CREDITS,
    gems: 0,
    stats: {
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      lastResult: null,
      lastMatchAt: null,
    },
    activeMatchId: null,
    activeMatchUntil: null,
    playerProfile: null,
    isVerified: false,
    verificationCode,
    verificationExpiresAt: now + VERIFICATION_TTL_MS,
    stripeConnectAccountId: null,
    stripeConnectReady: false,
    // KYC / compliance fields
    kycStatus: "none",            // none | submitted | verified | failed
    kycData: null,                // { firstName, lastName, dob, address, city, state, zip, phone }
    idVerificationStatus: "none", // none | pending | verified | failed
    taxData: null,                // { ssn4 } — stored hashed
    consentData: null,            // { tos, privacy, rwp, stateConfirm, depositLimit, timestamp }
    depositLimitWeekly: null,     // USD cents; null = no limit
    // Referral
    referralCode: generateReferralCode(),
    referredBy: null,             // userId of the referrer
    referralRewardPaid: false,    // true once the $15 bonus has been credited
    referralCount: 0,             // people who signed up with this user's code
    referralCompletedCount: 0,    // of those, how many triggered the bonus
    createdAt: now,
    updatedAt: now,
  };
}

function findUserByEmail(email) {
  return store.users.find((user) => user.email === email);
}

function findUserById(id) {
  return store.users.find((user) => user.id === id);
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    tag: user.tag,
    friendLink: user.friendLink,
    credits: user.credits,
    coins: user.credits,
    gems: user.gems,
    stats: user.stats,
    playerProfile: user.playerProfile,
    isVerified: user.isVerified,
    kycStatus: user.kycStatus || "none",
    idVerificationStatus: user.idVerificationStatus || "none",
    depositLimitWeekly: user.depositLimitWeekly ?? null,
    stripeConnectAccountId: user.stripeConnectAccountId || null,
    stripeConnectReady: Boolean(user.stripeConnectReady),
    referralCode: user.referralCode || null,
    referralCount: user.referralCount || 0,
    referralCompletedCount: user.referralCompletedCount || 0,
    selfExcluded: Boolean(user.selfExcluded),
    dob: user.dob || null,
  };
}

async function addGemsToUser({ username, email, amount }) {
  const cleanUsername = String(username || "").trim();
  const cleanEmail = normalizeEmail(email || "");
  const delta = Number(amount);
  if (!Number.isFinite(delta) || delta === 0) {
    throw new Error("Amount must be a non-zero number.");
  }
  if (!cleanUsername && !cleanEmail) {
    throw new Error("Username or email is required.");
  }

  if (pool) {
    const updateResult = await pool.query(
      `
      UPDATE users
      SET gems = COALESCE(gems, 0) + $1, updated_at = $2
      WHERE ($3 <> '' AND username = $3) OR ($4 <> '' AND email = $4)
      RETURNING id, username, email, gems
      `,
      [delta, Date.now(), cleanUsername, cleanEmail]
    );
    const row = updateResult.rows?.[0];
    if (!row) return null;
    const localUser = store.users.find((u) => u.id === row.id);
    if (localUser) {
      localUser.gems = row.gems;
      localUser.updatedAt = Date.now();
    }
    return row;
  }

  const user = store.users.find((u) => {
    if (cleanUsername && u.username === cleanUsername) return true;
    if (cleanEmail && normalizeEmail(u.email) === cleanEmail) return true;
    return false;
  });
  if (!user) return null;
  user.gems = Math.max(0, (user.gems || 0) + delta);
  user.updatedAt = Date.now();
  await saveStore();
  return { id: user.id, username: user.username, email: user.email, gems: user.gems };
}

function requireAuth(req, res) {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: "Please log in." });
    return null;
  }
  const user = findUserById(userId);
  if (!user) {
    res.status(401).json({ error: "Account not found." });
    return null;
  }
  return user;
}

async function getCashoutStatus(user) {
  if (!stripe) {
    return {
      enabled: false,
      connected: false,
      ready: false,
      accountId: null,
    };
  }

  if (!user?.stripeConnectAccountId) {
    return {
      enabled: true,
      connected: false,
      ready: false,
      accountId: null,
    };
  }

  let account;
  try {
    account = await stripe.accounts.retrieve(user.stripeConnectAccountId);
  } catch (err) {
    // If the connected account was deleted/invalid, reset local linkage.
    if (err?.type === "StripeInvalidRequestError") {
      return {
        enabled: true,
        connected: false,
        ready: false,
        accountId: null,
        resetAccount: true,
      };
    }
    throw err;
  }
  const ready = Boolean(account?.details_submitted && account?.payouts_enabled);
  const connected = true;
  const accountId = user.stripeConnectAccountId;
  return {
    enabled: true,
    connected,
    ready,
    accountId,
    payoutsEnabled: Boolean(account?.payouts_enabled),
    detailsSubmitted: Boolean(account?.details_submitted),
    chargesEnabled: Boolean(account?.charges_enabled),
  };
}

function isTicketExpired(ticket) {
  return Date.now() - ticket.createdAt > QUEUE_TTL_MS;
}

function isMatchExpired(match) {
  return Date.now() - match.createdAt > MATCH_TTL_MS;
}

function removeFromQueue(ticketId) {
  const index = waitingQueue.indexOf(ticketId);
  if (index >= 0) {
    waitingQueue.splice(index, 1);
  }
}

function cleanupQueues() {
  const now = Date.now();

  for (let i = waitingQueue.length - 1; i >= 0; i -= 1) {
    const ticketId = waitingQueue[i];
    const ticket = tickets.get(ticketId);
    if (!ticket || ticket.matchId || now - ticket.createdAt > QUEUE_TTL_MS) {
      waitingQueue.splice(i, 1);
    }
  }

  for (const [id, ticket] of tickets.entries()) {
    if (!ticket.matchId && now - ticket.createdAt > QUEUE_TTL_MS) {
      tickets.delete(id);
    }
  }

  let matchExpired = false;
  for (const [id, match] of matches.entries()) {
    if (isMatchExpired(match)) {
      matches.delete(id);
      delete store.activeMatches[id];
      matchExpired = true;
    }
  }
  if (matchExpired) {
    saveStore().catch((err) => console.error("Failed to clean up expired matches:", err));
  }
}

function findExistingTicket(userId) {
  for (const ticket of tickets.values()) {
    if (ticket.userId === userId && !ticket.matchId && !isTicketExpired(ticket)) {
      return ticket;
    }
  }
  return null;
}

function dequeueOpponent(currentUserId, currency) {
  for (let i = 0; i < waitingQueue.length; i += 1) {
    const ticketId = waitingQueue[i];
    const ticket = tickets.get(ticketId);
    if (!ticket || ticket.matchId || isTicketExpired(ticket)) {
      waitingQueue.splice(i, 1);
      i -= 1;
      continue;
    }
    if (ticket.userId === currentUserId) {
      continue;
    }
    if (currency && ticket.currency && ticket.currency !== currency) {
      continue;
    }
    waitingQueue.splice(i, 1);
    return ticket;
  }
  return null;
}

function createTicket(user, wager, currency) {
  const ticket = {
    id: createId(4),
    userId: user.id,
    tag: user.tag,
    friendLink: user.friendLink,
    wager,
    currency,
    profile: user.playerProfile,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    matchId: null,
  };
  tickets.set(ticket.id, ticket);
  return ticket;
}

function createMatch(ticketA, ticketB) {
  removeFromQueue(ticketA.id);
  removeFromQueue(ticketB.id);
  const lockUntil = Date.now() + MATCH_LOCK_MS;
  const currency =
    ticketA.currency && ticketA.currency === ticketB.currency
      ? ticketA.currency
      : "coins";

  const match = {
    id: createId(4),
    players: [
      {
        userId: ticketA.userId,
        tag: ticketA.tag,
        ticketId: ticketA.id,
        friendLink: ticketA.friendLink,
        wager: ticketA.wager,
        wagerCurrency: ticketA.currency || "coins",
        profile: ticketA.profile,
      },
      {
        userId: ticketB.userId,
        tag: ticketB.tag,
        ticketId: ticketB.id,
        friendLink: ticketB.friendLink,
        wager: ticketB.wager,
        wagerCurrency: ticketB.currency || "coins",
        profile: ticketB.profile,
      },
    ],
    currency,
    lockUntil,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  ticketA.matchId = match.id;
  ticketB.matchId = match.id;
  ticketA.updatedAt = Date.now();
  ticketB.updatedAt = Date.now();

  const userA = findUserById(ticketA.userId);
  const userB = findUserById(ticketB.userId);
  if (userA) {
    userA.activeMatchId = match.id;
    userA.activeMatchUntil = lockUntil;
  }
  if (userB) {
    userB.activeMatchId = match.id;
    userB.activeMatchUntil = lockUntil;
  }

  matches.set(match.id, match);
  store.activeMatches[match.id] = match;
  saveStore().catch((err) => console.error("Failed to persist active match:", err));
  return match;
}

async function fetchBattlelog(tag) {
  if (!API_TOKEN) {
    throw new Error("Server is missing CR_API_TOKEN.");
  }

  const encodedTag = encodeURIComponent(tag);
  const url = `https://api.clashroyale.com/v1/players/${encodedTag}/battlelog`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      Accept: "application/json",
    },
    agent: crApiAgent || undefined,
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data?.message || "Failed to fetch battle log.");
    error.status = response.status;
    error.reason = data?.reason;
    throw error;
  }
  return data;
}

async function fetchPlayerProfile(tag) {
  if (!API_TOKEN) {
    throw new Error("Server is missing CR_API_TOKEN.");
  }

  const encodedTag = encodeURIComponent(tag);
  const url = `https://api.clashroyale.com/v1/players/${encodedTag}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      Accept: "application/json",
    },
    agent: crApiAgent || undefined,
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data?.message || "Failed to fetch player profile.");
    error.status = response.status;
    error.reason = data?.reason;
    throw error;
  }

  const pathCandidates = [
    data?.bestPathOfLegendSeasonResult,
    data?.currentPathOfLegendSeasonResult,
    data?.lastPathOfLegendSeasonResult,
    data?.leagueStatistics?.currentSeason,
    data?.leagueStatistics?.previousSeason,
    data?.leagueStatistics?.bestSeason,
  ].filter(Boolean);

  const normalizeLeagueNumber = (value) => {
    const numberValue = Number(value);
    if (Number.isFinite(numberValue)) return numberValue;
    return 0;
  };

  const extractLeagueNumber = (entry) =>
    normalizeLeagueNumber(
      entry?.leagueNumber ||
        entry?.league?.number ||
        entry?.league?.id ||
        entry?.bestLeagueNumber ||
        0
    );

  const extractMedals = (entry) => {
    const candidates = [
      entry?.medals,
      entry?.trophies,
      entry?.leagueTrophies,
      entry?.bestTrophies,
      entry?.rankedTrophies,
      entry?.value,
    ];
    for (const candidate of candidates) {
      const parsed = Number(candidate);
      if (Number.isFinite(parsed) && parsed > 0) {
        return Math.floor(parsed);
      }
    }
    return 0;
  };

  // Post-June 2025: Challenger I-III removed, 7 leagues remain.
  // API may return old numbering (1-10) or new numbering (1-7).
  const leagueNameByNumberOld = {
    1: "Master I",   // Was Challenger I, now obsolete
    2: "Master I",   // Was Challenger II, now obsolete
    3: "Master I",   // Was Challenger III, now obsolete
    4: "Master I",
    5: "Master II",
    6: "Master III",
    7: "Champion",
    8: "Grand Champion",
    9: "Royal Champion",
    10: "Ultimate Champion",
  };

  const leagueNameByNumberNew = {
    1: "Master I",
    2: "Master II",
    3: "Master III",
    4: "Champion",
    5: "Grand Champion",
    6: "Royal Champion",
    7: "Ultimate Champion",
  };

  const resolveLeagueByNumber = (leagueNumber) => {
    if (leagueNumber >= 10) return "Ultimate Champion";  // pre-2025 top tier was 10
    if (leagueNumber >= 8)  return leagueNameByNumberOld[leagueNumber] || ""; // 8=Grand, 9=Royal (old)
    // Post-June 2025 the league was compressed to 7 tiers (1–7), where 7 = Ultimate Champion.
    // Always prefer the new mapping for 1–7 so league 7 is never misread as "Champion".
    return leagueNameByNumberNew[leagueNumber] || leagueNameByNumberOld[leagueNumber] || "";
  };

  const VALID_LEAGUE_NAMES = new Set([
    "Master I", "Master II", "Master III",
    "Champion", "Grand Champion", "Royal Champion", "Ultimate Champion",
  ]);

  const normalizeLeagueName = (leagueName, leagueNumber = 0) => {
    const raw = String(leagueName || "").trim();
    if (!raw) {
      return resolveLeagueByNumber(leagueNumber);
    }
    const lower = raw.toLowerCase();
    // Fix common API typos
    if (
      lower === "chamption" ||
      lower.includes("ultimate chamption") ||
      lower.includes("ultimate champion")
    ) {
      return "Ultimate Champion";
    }
    // In the new 7-tier system league 7 is Ultimate Champion; if the API name
    // looks like any "champ" variant for number 7 or 10+, force the correct name.
    if ((leagueNumber >= 10 || leagueNumber === 7) && lower.includes("champ")) {
      return "Ultimate Champion";
    }
    // Map old Challenger names to Master I
    if (lower.startsWith("challenger")) {
      return "Master I";
    }
    // If the API name is a recognized league, use it directly
    if (VALID_LEAGUE_NAMES.has(raw)) {
      return raw;
    }
    return raw;
  };

  let highestLeagueNumber = 0;
  let highestLeagueName = "";

  let ultimateChampionReached = false;
  let ultimateChampionMedals = 0;

  pathCandidates.forEach((entry) => {
    const leagueNumber = extractLeagueNumber(entry);
    const leagueNameRaw = normalizeLeagueName(entry?.league?.name, leagueNumber);
    if (leagueNumber > highestLeagueNumber) {
      highestLeagueNumber = leagueNumber;
      highestLeagueName = leagueNameRaw || resolveLeagueByNumber(leagueNumber) || "";
    } else if (
      leagueNumber === highestLeagueNumber &&
      !highestLeagueName &&
      leagueNameRaw
    ) {
      highestLeagueName = leagueNameRaw;
    }
    const leagueName = normalizeLeagueName(entry?.league?.name, leagueNumber).toLowerCase();
    // league number 7 in the post-June 2025 system IS Ultimate Champion
    if (leagueNumber >= 10 || leagueNumber === 7 || leagueName.includes("ultimate champion")) {
      ultimateChampionReached = true;
      ultimateChampionMedals = Math.max(
        ultimateChampionMedals,
        extractMedals(entry)
      );
    }
  });

  if (!ultimateChampionReached && Array.isArray(data?.badges)) {
    const championBadge = data.badges.find((badge) =>
      String(badge?.name || "")
        .toLowerCase()
        .includes("ultimate champion")
    );
    if (championBadge) {
      ultimateChampionReached = true;
      const badgeLevel = Number(championBadge.level);
      if (Number.isFinite(badgeLevel) && badgeLevel > 0) {
        ultimateChampionMedals = Math.max(
          ultimateChampionMedals,
          Math.floor(badgeLevel)
        );
      }
    }
  }

  // If Ultimate Champion was detected (via badge or league data), force the name
  const resolvedLeagueName = ultimateChampionReached
    ? "Ultimate Champion"
    : normalizeLeagueName(highestLeagueName, highestLeagueNumber) ||
      resolveLeagueByNumber(highestLeagueNumber) ||
      "";

  return {
    name: data?.name || "Unknown",
    trophies: Number(data?.trophies) || 0,
    bestTrophies: Number(data?.bestTrophies) || 0,
    expLevel: Number(data?.expLevel) || 0,
    arena: data?.arena?.name || "",
    highestLeagueNumber,
    highestLeagueName: resolvedLeagueName,
    isUltimateChampion: ultimateChampionReached,
    ultimateChampionMedals,
    updatedAt: new Date().toISOString(),
  };
}

function sumCrowns(players) {
  if (!Array.isArray(players)) return 0;
  return players.reduce((sum, player) => sum + (player.crowns || 0), 0);
}

function summarizeBattlePlayers(players) {
  if (!Array.isArray(players)) return [];
  return players.map((player) => ({
    tag: normalizeTagValue(player?.tag),
    name: player?.name || "",
    crowns: Number(player?.crowns) || 0,
    cards: Array.isArray(player?.cards)
      ? player.cards.map((card) => ({ name: card?.name || "" }))
      : [],
  }));
}

function getRecordTimestamp(record) {
  if (!record) return 0;
  if (record.battleTime) {
    const fromBattle = getBattleTimestamp({ battleTime: record.battleTime });
    if (fromBattle) return fromBattle;
  }
  const parsed = Date.parse(record.recordedAt || "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function getSimplePlayerFromTag(tag) {
  const normalized = normalizeTagValue(tag);
  return {
    tag: normalized,
    name: normalized || "Unknown",
    crowns: 0,
    cards: [],
  };
}

function buildBattleFromRecord(record, referenceTag) {
  const reference = normalizeTagValue(referenceTag);
  const tagA = normalizeTagValue(record?.tagA);
  const tagB = normalizeTagValue(record?.tagB);
  const summaryTeam = Array.isArray(record?.battleSummary?.team)
    ? record.battleSummary.team
    : null;
  const summaryOpponent = Array.isArray(record?.battleSummary?.opponent)
    ? record.battleSummary.opponent
    : null;
  const resultByTag =
    record?.resultByTag && typeof record.resultByTag === "object"
      ? record.resultByTag
      : {};
  const teamCrowns =
    typeof record?.teamCrowns === "number" ? record.teamCrowns : null;
  const opponentCrowns =
    typeof record?.opponentCrowns === "number" ? record.opponentCrowns : null;

  let team =
    summaryTeam && summaryTeam.length
      ? summaryTeam
      : [getSimplePlayerFromTag(tagA || reference)];
  let opponent =
    summaryOpponent && summaryOpponent.length
      ? summaryOpponent
      : [getSimplePlayerFromTag(tagB)];
  let localTeamCrowns = teamCrowns;
  let localOpponentCrowns = opponentCrowns;

  const teamHasReference = team.some(
    (player) => normalizeTagValue(player?.tag) === reference
  );
  const opponentHasReference = opponent.some(
    (player) => normalizeTagValue(player?.tag) === reference
  );
  if (!teamHasReference && opponentHasReference) {
    [team, opponent] = [opponent, team];
    [localTeamCrowns, localOpponentCrowns] = [
      localOpponentCrowns,
      localTeamCrowns,
    ];
  }

  return {
    type: record?.battleType || "Friendly",
    gameMode: {
      name: record?.gameModeName || "Friendly Battle",
    },
    battleTime: record?.battleTime || record?.recordedAt || null,
    team,
    opponent,
    teamCrowns: localTeamCrowns,
    opponentCrowns: localOpponentCrowns,
    result: resultByTag[reference] || null,
    isBetRoyaleMatch: true,
    matchId: record?.matchId || null,
    wagerA: Number.isFinite(record?.wagerA) ? record.wagerA : 0,
    wagerB: Number.isFinite(record?.wagerB) ? record.wagerB : 0,
    currencyA: record?.currencyA || "coins",
    currencyB: record?.currencyB || "coins",
  };
}

function battleHasTags(battle, tagA, tagB) {
  const tags = new Set();
  const allPlayers = []
    .concat(battle.team || [])
    .concat(battle.opponent || []);
  allPlayers.forEach((player) => {
    const normalized = normalizeTagValue(player.tag);
    if (normalized) tags.add(normalized);
  });
  return tags.has(tagA) && tags.has(tagB);
}

function isFriendlyBattle(battle) {
  const type = battle.type || "";
  const mode = battle.gameMode?.name || "";
  const label = `${type} ${mode}`.toLowerCase();
  return label.includes("friendly");
}

function isNormal1v1Friendly(battle) {
  if (!isFriendlyBattle(battle)) return false;

  const team = battle.team || [];
  const opponent = battle.opponent || [];
  if (team.length !== 1 || opponent.length !== 1) return false;

  const modeLabel = `${battle.type || ""} ${battle.gameMode?.name || ""}`
    .toLowerCase()
    .replace(/[\s_-]/g, "");
  const blockedModes = [
    "2v2",
    "tripleelixir",
    "doubleelixir",
    "rage",
    "rampup",
    "draft",
    "mirror",
    "touchdown",
    "heist",
    "suddendeath",
    "capturethe",
  ];
  if (blockedModes.some((token) => modeLabel.includes(token))) return false;

  const deckSelection = (battle.deckSelection || "").toLowerCase();
  if (deckSelection && deckSelection !== "collection") return false;

  return true;
}

function getBattleTimestamp(battle) {
  const raw = battle?.battleTime;
  if (!raw) return 0;
  const parsed = new Date(raw);
  const time = parsed.getTime();
  if (!Number.isNaN(time)) return time;

  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(?:\.(\d+))?Z?$/.exec(
    raw
  );
  if (!match) return 0;
  const [, year, month, day, hour, minute, second, ms = "0"] = match;
  return Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
    Number(ms.slice(0, 3))
  );
}

function findFriendlyMatch(battles, tagA, tagB) {
  if (!Array.isArray(battles)) return null;
  let latest = null;
  let latestTime = 0;
  battles.forEach((battle) => {
    if (!isFriendlyBattle(battle) || !battleHasTags(battle, tagA, tagB)) {
      return;
    }
    const time = getBattleTimestamp(battle);
    if (!latest || time > latestTime) {
      latest = battle;
      latestTime = time;
    }
  });
  return latest;
}

function getRecordedMatchForMatchId(matchId) {
  const records = Object.values(store.recordedMatches || {}).filter(
    (record) => record?.matchId === matchId
  );
  if (!records.length) return null;
  records.sort((a, b) => getRecordTimestamp(a) - getRecordTimestamp(b));
  return records[0];
}

function getTrackWindowStart(match) {
  const ticketTimes = (match?.players || [])
    .map((player) => tickets.get(player.ticketId)?.createdAt || 0)
    .filter((time) => Number.isFinite(time) && time > 0);
  const matchCreatedAt =
    Number.isFinite(match?.createdAt) && match.createdAt > 0
      ? match.createdAt
      : 0;
  const baseTime = Math.min(matchCreatedAt || Infinity, ...ticketTimes);
  if (!Number.isFinite(baseTime)) return 0;
  return Math.max(0, baseTime - 15_000);
}

function collectTrackCandidates(battles, tagA, tagB, minTimestamp) {
  if (!Array.isArray(battles)) return [];
  const candidates = [];
  battles.forEach((battle) => {
    if (!isFriendlyBattle(battle) || !battleHasTags(battle, tagA, tagB)) {
      return;
    }
    const time = getBattleTimestamp(battle);
    if (minTimestamp && (!time || time < minTimestamp)) {
      return;
    }
    candidates.push(battle);
  });
  return candidates;
}

function dedupeBattles(battles) {
  const seen = new Set();
  const unique = [];
  battles.forEach((battle) => {
    const players = []
      .concat(battle?.team || [])
      .concat(battle?.opponent || [])
      .map((player) => normalizeTagValue(player?.tag))
      .filter(Boolean)
      .sort()
      .join("|");
    const key = [
      getBattleTimestamp(battle),
      players,
      (battle?.type || "").toLowerCase(),
      (battle?.gameMode?.name || "").toLowerCase(),
    ].join(":");
    if (seen.has(key)) return;
    seen.add(key);
    unique.push(battle);
  });
  unique.sort((a, b) => getBattleTimestamp(a) - getBattleTimestamp(b));
  return unique;
}

function pickBattleForMatch(battles, tagA, tagB, minTimestamp) {
  const candidates = dedupeBattles(
    battles.flatMap((battleList) =>
      collectTrackCandidates(battleList, tagA, tagB, minTimestamp)
    )
  );
  const firstValid = candidates.find((battle) => isNormal1v1Friendly(battle));
  if (firstValid) {
    return { status: "matched", battle: firstValid };
  }
  if (candidates.length) {
    return { status: "invalid", battle: candidates[0] };
  }
  return { status: "pending", battle: null };
}

function selectLatestBattle(battleA, battleB) {
  if (!battleA) return battleB;
  if (!battleB) return battleA;
  const timeA = getBattleTimestamp(battleA);
  const timeB = getBattleTimestamp(battleB);
  if (timeA === timeB) {
    return battleA;
  }
  return timeA > timeB ? battleA : battleB;
}

function getActiveMatchForUser(user) {
  if (!user.activeMatchId || !user.activeMatchUntil) return null;
  if (Date.now() > user.activeMatchUntil) {
    user.activeMatchId = null;
    user.activeMatchUntil = null;
    return null;
  }
  const match = matches.get(user.activeMatchId);
  if (!match) {
    user.activeMatchId = null;
    user.activeMatchUntil = null;
    return null;
  }
  return match;
}

function getResultForTag(battle, tag) {
  const normalizedTag = normalizeTagValue(tag);
  const team = battle.team || [];
  const opponent = battle.opponent || [];
  const teamHas = team.some(
    (player) => normalizeTagValue(player.tag) === normalizedTag
  );
  const opponentHas = opponent.some(
    (player) => normalizeTagValue(player.tag) === normalizedTag
  );

  if (!teamHas && !opponentHas) {
    return null;
  }

  const teamCrowns = sumCrowns(team);
  const opponentCrowns = sumCrowns(opponent);

  if (teamHas) {
    if (teamCrowns > opponentCrowns) return "win";
    if (teamCrowns < opponentCrowns) return "loss";
    return "draw";
  }

  if (opponentCrowns > teamCrowns) return "win";
  if (opponentCrowns < teamCrowns) return "loss";
  return "draw";
}

function updateStatsForUser(user, result, matchTime) {
  user.stats.matchesPlayed += 1;
  if (result === "win") user.stats.wins += 1;
  if (result === "loss") user.stats.losses += 1;
  if (result === "draw") user.stats.draws += 1;
  user.stats.lastResult = result;
  user.stats.lastMatchAt = matchTime || new Date().toISOString();
  user.updatedAt = Date.now();
}

function createMatchKey(battle, tagA, tagB) {
  const timeKey = battle.battleTime || new Date().toISOString();
  const tags = [normalizeTagValue(tagA), normalizeTagValue(tagB)]
    .filter(Boolean)
    .sort()
    .join("|");
  return `${timeKey}:${tags}`;
}

function findUserByNormalizedTag(tag) {
  const normalized = normalizeTagValue(tag);
  if (!normalized) return null;
  return (
    store.users.find(
      (user) => normalizeTagValue(user?.tag || "") === normalized
    ) || null
  );
}

function getPeriodWindow(period = "month", now = Date.now()) {
  const current = new Date(now);
  if (period === "week") {
    return { from: now - 7 * 24 * 60 * 60 * 1000, to: now, label: "Last 7 days" };
  }
  if (period === "year") {
    return {
      from: Date.UTC(current.getUTCFullYear(), 0, 1, 0, 0, 0, 0),
      to: now,
      label: `${current.getUTCFullYear()}`,
    };
  }
  if (period === "all") {
    return { from: 0, to: now, label: "All time" };
  }
  return {
    from: Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), 1, 0, 0, 0, 0),
    to: now,
    label: current.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }),
  };
}

function getMonthKeyFromTimestamp(timestamp) {
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
}

function getMonthWindowFromKey(monthKey) {
  const match = /^(\d{4})-(\d{2})$/.exec(String(monthKey || ""));
  if (!match) return null;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const from = Date.UTC(year, monthIndex, 1, 0, 0, 0, 0);
  const to = Date.UTC(year, monthIndex + 1, 1, 0, 0, 0, 0) - 1;
  return {
    from,
    to,
    label: new Date(from).toLocaleString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }),
  };
}

function getMonthlyPrizeSchedule() {
  return GEM_LEADERBOARD_MONTHLY_PRIZES.map((amount, index) => ({
    rank: index + 1,
    gems: amount,
  }));
}

function getWinningGainForRecord(record, normalizedTag, targetCurrency) {
  if (!record || !normalizedTag || !targetCurrency) return 0;
  const tagA = normalizeTagValue(record.tagA);
  const tagB = normalizeTagValue(record.tagB);
  const resultA = record?.resultByTag?.[tagA] || null;
  const resultB = record?.resultByTag?.[tagB] || null;
  const wagerA = Math.max(0, Math.floor(record?.wagerA || 0));
  const wagerB = Math.max(0, Math.floor(record?.wagerB || 0));
  const currencyA = record?.currencyA || "coins";
  const currencyB = record?.currencyB || "coins";

  if (normalizedTag === tagA && resultA === "win" && resultB === "loss") {
    if (currencyA === currencyB) {
      if (currencyA !== targetCurrency) return 0;
      return Math.max(0, Math.floor((wagerA + wagerB) * WINNER_PCT) - wagerA);
    }
    if (currencyB !== targetCurrency) return 0;
    return Math.max(0, Math.floor(wagerB * WINNER_PCT));
  }

  if (normalizedTag === tagB && resultB === "win" && resultA === "loss") {
    if (currencyA === currencyB) {
      if (currencyB !== targetCurrency) return 0;
      return Math.max(0, Math.floor((wagerA + wagerB) * WINNER_PCT) - wagerB);
    }
    if (currencyA !== targetCurrency) return 0;
    return Math.max(0, Math.floor(wagerA * WINNER_PCT));
  }

  return 0;
}

function buildLeaderboardEntries(currency = "coins", period = "month", options = {}) {
  const normalizedCurrency = currency === "gems" ? "gems" : "coins";
  const window = options.window || getPeriodWindow(period);
  const totals = new Map();

  Object.values(store.recordedMatches || {}).forEach((record) => {
    const timestamp = getRecordTimestamp(record);
    if (!timestamp || timestamp < window.from || timestamp > window.to) return;

    [record?.tagA, record?.tagB].forEach((tag) => {
      const normalizedTag = normalizeTagValue(tag);
      if (!normalizedTag) return;
      const gain = getWinningGainForRecord(
        record,
        normalizedTag,
        normalizedCurrency
      );
      if (gain <= 0) return;

      const user =
        (normalizedTag === normalizeTagValue(record?.tagA) &&
          record?.userIdA &&
          findUserById(record.userIdA)) ||
        (normalizedTag === normalizeTagValue(record?.tagB) &&
          record?.userIdB &&
          findUserById(record.userIdB)) ||
        findUserByNormalizedTag(normalizedTag);
      if (!user) return;

      const existing = totals.get(user.id) || {
        userId: user.id,
        username: user.username || user.email || normalizedTag,
        tag: normalizedTag,
        winnings: 0,
        wins: 0,
      };
      existing.winnings += gain;
      existing.wins += 1;
      existing.username = user.username || existing.username;
      existing.tag = normalizeTagValue(user.tag || existing.tag);
      totals.set(user.id, existing);
    });
  });

  return Array.from(totals.values())
    .sort((a, b) => {
      if (b.winnings !== a.winnings) return b.winnings - a.winnings;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.username.localeCompare(b.username);
    })
    .map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      username: entry.username,
      tag: entry.tag,
      winnings: entry.winnings,
      wins: entry.wins,
      currency: normalizedCurrency,
    }));
}

async function processMonthlyGemLeaderboardRewards() {
  const rewards = store.leaderboardRewards || {};
  const currentMonthStart = getPeriodWindow("month").from;
  let changed = false;

  const monthKeys = new Set();
  Object.values(store.recordedMatches || {}).forEach((record) => {
    const timestamp = getRecordTimestamp(record);
    if (!timestamp || timestamp >= currentMonthStart) return;
    monthKeys.add(getMonthKeyFromTimestamp(timestamp));
  });

  Array.from(monthKeys)
    .sort()
    .forEach((monthKey) => {
      if (rewards[monthKey]) return;
      const monthWindow = getMonthWindowFromKey(monthKey);
      if (!monthWindow) return;
      const entries = buildLeaderboardEntries("gems", "month", {
        window: monthWindow,
      });
      const winners = [];
      GEM_LEADERBOARD_MONTHLY_PRIZES.forEach((prize, index) => {
        const entry = entries[index];
        if (!entry) return;
        const user = findUserById(entry.userId);
        if (!user) return;
        user.gems = Math.max(0, (user.gems || 0) + prize);
        user.updatedAt = Date.now();
        winners.push({
          rank: index + 1,
          userId: user.id,
          username: user.username || user.email || user.id,
          gems: prize,
          winnings: entry.winnings,
        });
        changed = true;
      });
      rewards[monthKey] = {
        monthKey,
        processedAt: new Date().toISOString(),
        winners,
      };
      changed = true;
    });

  store.leaderboardRewards = rewards;
  if (changed) {
    await saveStore();
  }
}

app.use("/api/auth", authRateLimiter);
app.use("/api/queue", queueRateLimiter);
app.use("/api/shop", financeRateLimiter);

app.get("/api/auth/session", (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.json({ user: null });
  }
  const user = findUserById(userId);
  if (!user) {
    return res.json({ user: null });
  }
  return res.json({ user: publicUser(user) });
});

app.post("/api/auth/register", async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password || "";
  const usernameInput = req.body?.username || "";
  const username = sanitizeUsername(usernameInput);
  const referralCodeInput = (req.body?.referralCode || "").trim().toUpperCase();

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Enter a valid email address." });
  }
  if (!password || password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters." });
  }
  if (!username) {
    return res
      .status(400)
      .json({ error: "Username must be at least 3 characters." });
  }
  if (findUserByEmail(email)) {
    return res.status(400).json({ error: "Email already registered." });
  }
  if (isUsernameTaken(username)) {
    return res.status(400).json({ error: "Username is already taken." });
  }

  // Referral code validation
  let referrer = null;
  if (referralCodeInput) {
    referrer = findUserByReferralCode(referralCodeInput);
    if (!referrer) {
      return res.status(400).json({ error: "Referral code not found." });
    }
    if (referrer.email === email) {
      return res.status(400).json({ error: "You cannot use your own referral code." });
    }
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = createUser(email, passwordHash);
    user.username = username;
    if (referrer) {
      user.referredBy = referrer.id;
      referrer.referralCount = (referrer.referralCount || 0) + 1;
      referrer.updatedAt = Date.now();
    }
    store.users.push(user);
    await saveStore();
    let verificationWarning = null;
    if (user.verificationCode) {
      try {
        await sendVerificationEmail({
          email: user.email,
          username: user.username,
          code: user.verificationCode,
        });
      } catch (mailErr) {
        console.error("Verification email failed:", mailErr);
        verificationWarning =
          "Account created, but verification email could not be sent.";
      }
    }
    req.session.userId = user.id;
    return res.status(201).json({
      user: publicUser(user),
      verificationCode: mailTransport ? null : user.verificationCode,
      verificationExpiresAt: user.verificationExpiresAt,
      warning: verificationWarning,
    });
  } catch (err) {
    return res.status(500).json({ error: "Unable to create account." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const identifier = (req.body?.identifier || req.body?.email || "").trim();
  const password = req.body?.password || "";

  if (!identifier || !password) {
    return res
      .status(400)
      .json({ error: "Username/email and password required." });
  }

  let user = null;
  if (identifier.includes("@")) {
    user = findUserByEmail(normalizeEmail(identifier));
  } else {
    const normalized = sanitizeUsername(identifier);
    user = store.users.find(
      (candidate) =>
        (candidate.username || "").toLowerCase() === normalized.toLowerCase()
    );
  }

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  req.session.userId = user.id;
  return res.json({ user: publicUser(user) });
});

app.post("/api/auth/verify", async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;

  if (user.isVerified) {
    return res.json({ user: publicUser(user) });
  }

  const codeInput = String(req.body?.code || "").trim();
  if (!codeInput) {
    return res.status(400).json({ error: "Enter the verification code." });
  }

  if (!user.verificationCode || !user.verificationExpiresAt) {
    return res.status(400).json({ error: "No active verification code." });
  }

  if (Date.now() > user.verificationExpiresAt) {
    return res.status(400).json({ error: "Verification code expired." });
  }

  if (codeInput !== user.verificationCode) {
    return res.status(400).json({ error: "Invalid verification code." });
  }

  user.isVerified = true;
  user.verificationCode = null;
  user.verificationExpiresAt = null;
  user.updatedAt = Date.now();
  await saveStore();
  return res.json({ user: publicUser(user) });
});

app.post("/api/auth/resend", async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;

  if (user.isVerified) {
    return res.status(400).json({ error: "Account already verified." });
  }

  if (user.verificationExpiresAt && Date.now() <= user.verificationExpiresAt) {
    return res
      .status(400)
      .json({ error: "Current verification code is still valid." });
  }

  const previousCode = user.verificationCode;
  const previousExpiry = user.verificationExpiresAt;
  const nextCode = generateVerificationCode();
  const nextExpiry = Date.now() + VERIFICATION_TTL_MS;
  user.verificationCode = nextCode;
  user.verificationExpiresAt = nextExpiry;

  if (mailTransport) {
    try {
      await sendVerificationEmail({
        email: user.email,
        username: user.username,
        code: nextCode,
      });
    } catch (err) {
      user.verificationCode = previousCode;
      user.verificationExpiresAt = previousExpiry;
      await saveStore();
      return res
        .status(500)
        .json({ error: "Unable to send verification email." });
    }
  }

  user.updatedAt = Date.now();
  await saveStore();
  return res.json({
    ok: true,
    verificationCode: mailTransport ? null : user.verificationCode,
    verificationExpiresAt: user.verificationExpiresAt,
  });
});

// ── KYC: personal identity ────────────────────────────────────────────────
app.post("/api/auth/kyc", async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const { firstName, lastName, dob, address, city, state, zip, phone } = req.body || {};
  if (!firstName || !lastName || !dob || !address || !city || !state || !zip || !phone) {
    return res.status(400).json({ error: "All identity fields are required." });
  }
  const age = (Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  if (age < 18) return res.status(400).json({ error: "You must be 18 or older." });
  user.kycData = { firstName, lastName, dob, address, city, state, zip, phone };
  user.kycStatus = "submitted";
  user.updatedAt = Date.now();
  await saveStore();
  return res.json({ user: publicUser(user) });
});

// ── Tax: SSN last 4 ───────────────────────────────────────────────────────
app.post("/api/auth/tax", async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const { ssn4 } = req.body || {};
  if (!/^\d{4}$/.test(ssn4 || "")) {
    return res.status(400).json({ error: "Provide the last 4 digits of your SSN." });
  }
  const hash = await bcrypt.hash(ssn4, 10);
  user.taxData = { ssn4Hash: hash, submittedAt: Date.now() };
  user.updatedAt = Date.now();
  await saveStore();
  return res.json({ ok: true });
});

// ── Consent + responsible gaming + CR profile ─────────────────────────────
app.post("/api/auth/consent", async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const { tos, privacy, rwp, stateConfirm, depositLimit, tag, friendLink, dob } = req.body || {};
  if (!tos || !privacy || !rwp || !stateConfirm) {
    return res.status(400).json({ error: "All consent fields are required." });
  }
  user.consentData = { tos, privacy, rwp, stateConfirm, depositLimit, timestamp: Date.now() };
  user.depositLimitWeekly = depositLimit > 0 ? Math.round(depositLimit * 100) : null;
  if (dob) user.dob = String(dob).trim();
  if (tag) user.tag = sanitizeTag(tag);
  if (friendLink) user.friendLink = friendLink.trim();
  user.updatedAt = Date.now();
  await saveStore();
  return res.json({ user: publicUser(user) });
});

app.post("/api/auth/self-exclude", async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  user.selfExcluded = true;
  user.updatedAt = Date.now();
  await saveStore();
  return res.json({ ok: true, message: "Self-exclusion applied. Contact support@betroyale.win after 30 days to request reinstatement." });
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

app.get("/api/profile", (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  return res.json({ user: publicUser(user) });
});

app.put("/api/profile", async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;

  const tagInput = req.body?.tag;
  const friendLinkInput = req.body?.friendLink;
  const usernameInput = req.body?.username;

  if (tagInput !== undefined) {
    const tag = sanitizeTag(tagInput);
    if (!tag && tagInput) {
      return res.status(400).json({ error: "Enter a valid player tag." });
    }
    user.tag = tag;
  }

  if (friendLinkInput !== undefined) {
    user.friendLink = sanitizeFriendLink(friendLinkInput);
  }

  if (usernameInput !== undefined) {
    const username = sanitizeUsername(usernameInput);
    if (!username) {
      return res
        .status(400)
        .json({ error: "Username must be at least 3 characters." });
    }
    if (isUsernameTaken(username, user.id)) {
      return res.status(400).json({ error: "Username is already taken." });
    }
    user.username = username;
  }

  user.updatedAt = Date.now();
  await saveStore();
  return res.json({ user: publicUser(user) });
});

app.post("/api/shop/checkout", async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;

  if (!stripe) {
    return res.status(400).json({ error: "Stripe is not configured." });
  }

  const amountCents = Number(req.body?.amountCents);
  if (!Number.isFinite(amountCents) || amountCents % 1 !== 0) {
    return res.status(400).json({ error: "Enter a valid USD amount." });
  }
  if (
    amountCents < MIN_GEM_PURCHASE_CENTS ||
    amountCents > MAX_GEM_PURCHASE_CENTS
  ) {
    return res.status(400).json({
      error: `Amount must be between $${(
        MIN_GEM_PURCHASE_CENTS / 100
      ).toFixed(2)} and $${(MAX_GEM_PURCHASE_CENTS / 100).toFixed(2)}.`,
    });
  }

  // Enforce weekly deposit limit
  if (Number.isFinite(user.depositLimitWeekly) && user.depositLimitWeekly > 0) {
    const windowStart = Date.now() - WEEKLY_DEPOSIT_WINDOW_MS;
    const weeklySpent = Object.values(store.purchases || {})
      .filter((p) => p.userId === user.id && (p.createdAt || 0) >= windowStart)
      .reduce((sum, p) => sum + (p.amountCents || 0), 0);
    if (weeklySpent + amountCents > user.depositLimitWeekly) {
      const remaining = Math.max(0, user.depositLimitWeekly - weeklySpent);
      return res.status(400).json({
        error: `This deposit would exceed your weekly limit of $${(user.depositLimitWeekly / 100).toFixed(2)}. You have $${(remaining / 100).toFixed(2)} remaining this week.`,
      });
    }
  }

  const gems = amountCents;
  const idempotencyKey = `checkout:${user.id}:${amountCents}:${Math.floor(
    Date.now() / 30000
  )}`;
  try {
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: user.email,
        metadata: {
          userId: user.id,
          gems: String(gems),
        },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: amountCents,
              product_data: {
                name: `${gems} Gems`,
                description: "BetRoyale gem purchase",
              },
            },
          },
        ],
        success_url: `${PUBLIC_URL}/?shop=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${PUBLIC_URL}/?shop=cancel`,
      },
      { idempotencyKey }
    );

    return res.json({ url: session.url });
  } catch (err) {
    return res.status(400).json({
      error:
        err?.raw?.message || err.message || "Unable to start checkout session.",
    });
  }
});

app.post("/api/shop/confirm", async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;

  if (!stripe) {
    return res.status(400).json({ error: "Stripe is not configured." });
  }

  const sessionId = String(req.body?.sessionId || "").trim();
  if (!sessionId) {
    return res.status(400).json({ error: "Missing checkout session id." });
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    if (!checkoutSession || checkoutSession.mode !== "payment") {
      return res.status(400).json({ error: "Invalid checkout session." });
    }
    if (checkoutSession.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment has not completed yet." });
    }

    const metadataUserId = String(checkoutSession.metadata?.userId || "").trim();
    const sessionEmail = normalizeEmail(checkoutSession.customer_email || "");
    if (metadataUserId && metadataUserId !== user.id) {
      return res.status(403).json({ error: "Checkout session does not belong to this user." });
    }
    if (!metadataUserId && sessionEmail && sessionEmail !== user.email) {
      return res.status(403).json({ error: "Checkout session does not belong to this email." });
    }

    const amountCents = Number(checkoutSession.amount_total) || 0;
    const gems = Number(checkoutSession.metadata?.gems) || amountCents;
    if (!Number.isFinite(gems) || gems <= 0) {
      return res.status(400).json({ error: "This checkout session has no gem amount." });
    }

    const inserted = await recordPurchase(sessionId, user.id, amountCents, gems);
    if (!inserted) {
      return res.json({
        ok: true,
        credited: false,
        user: publicUser(user),
        message: "Purchase already synced.",
      });
    }

    user.gems = Math.max(0, (user.gems || 0) + gems);
    user.updatedAt = Date.now();

    // Referral bonus: first deposit ≥ $15 by a referred user
    if (
      !user.referralRewardPaid &&
      user.referredBy &&
      amountCents >= REFERRAL_MIN_DEPOSIT_CENTS
    ) {
      const referrer = findUserById(user.referredBy);
      if (referrer) {
        referrer.credits = Math.max(0, (referrer.credits || 0) + REFERRAL_BONUS_CREDITS);
        referrer.referralCompletedCount = (referrer.referralCompletedCount || 0) + 1;
        referrer.updatedAt = Date.now();
      }
      user.credits = Math.max(0, (user.credits || 0) + REFERRAL_BONUS_CREDITS);
      user.referralRewardPaid = true;
    }

    await saveStore();
    return res.json({
      ok: true,
      credited: true,
      user: publicUser(user),
      message: `${gems} gems were added to your account.`,
    });
  } catch (err) {
    return res.status(400).json({
      error: err?.raw?.message || err.message || "Unable to confirm checkout session.",
    });
  }
});

app.get("/api/shop/exchange/rate", (req, res) => {
  return res.json({
    coins: Number.isFinite(COIN_TO_GEM_COINS) && COIN_TO_GEM_COINS > 0 ? COIN_TO_GEM_COINS : 1000,
    gems: Number.isFinite(COIN_TO_GEM_GEMS) && COIN_TO_GEM_GEMS > 0 ? COIN_TO_GEM_GEMS : 100,
  });
});

app.post("/api/shop/exchange", async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;

  const rateCoins =
    Number.isFinite(COIN_TO_GEM_COINS) && COIN_TO_GEM_COINS > 0 ? COIN_TO_GEM_COINS : 1000;
  const rateGems =
    Number.isFinite(COIN_TO_GEM_GEMS) && COIN_TO_GEM_GEMS > 0 ? COIN_TO_GEM_GEMS : 100;

  const coins = Number(user.credits) || 0;
  if (coins < rateCoins) {
    return res.status(400).json({
      error: `You need at least ${rateCoins} coins to trade for gems.`,
    });
  }

  user.credits = Math.max(0, coins - rateCoins);
  user.gems = Math.max(0, (user.gems || 0) + rateGems);
  user.updatedAt = Date.now();
  await saveStore();

  return res.json({
    ok: true,
    user: publicUser(user),
    message: `Traded ${rateCoins} coins for ${rateGems} gems.`,
  });
});

app.post("/api/admin/gems", async (req, res) => {
  const secret = String(req.headers["x-admin-secret"] || "");
  if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
    return res.status(403).json({ error: "Forbidden." });
  }
  try {
    const { username, email, amount } = req.body || {};
    const updated = await addGemsToUser({ username, email, amount });
    if (!updated) {
      return res.status(404).json({ error: "User not found." });
    }
    return res.json({ ok: true, user: updated });
  } catch (err) {
    return res.status(400).json({ error: err.message || "Unable to update gems." });
  }
});

app.get("/api/shop/cashout/status", async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;

  try {
    const status = await getCashoutStatus(user);
    if (status.resetAccount) {
      user.stripeConnectAccountId = null;
      user.stripeConnectReady = false;
      user.updatedAt = Date.now();
      await saveStore();
    }
    if (typeof status.ready === "boolean" && user.stripeConnectReady !== status.ready) {
      user.stripeConnectReady = status.ready;
      user.updatedAt = Date.now();
      await saveStore();
    }
    const recentCashouts = await listCashoutsForUser(user.id, 6);
    return res.json({
      ...status,
      minimumUsd: MIN_CASHOUT_CENTS / 100,
      maximumUsd: MAX_CASHOUT_CENTS / 100,
      recentCashouts,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Unable to load cash out status.",
      reason: err.message,
    });
  }
});

app.post("/api/shop/cashout/connect", async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;

  if (!stripe) {
    return res.status(400).json({ error: "Stripe is not configured." });
  }

  try {
    let accountId = user.stripeConnectAccountId;
    if (accountId) {
      try {
        await stripe.accounts.retrieve(accountId);
      } catch (err) {
        if (err?.type === "StripeInvalidRequestError") {
          accountId = null;
          user.stripeConnectAccountId = null;
          user.stripeConnectReady = false;
        } else {
          throw err;
        }
      }
    }
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "US",
        email: user.email,
        business_type: "individual",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          userId: user.id,
        },
      });
      accountId = account.id;
      user.stripeConnectAccountId = accountId;
      user.stripeConnectReady = false;
      user.updatedAt = Date.now();
      await saveStore();
    }

    const link = await stripe.accountLinks.create({
      account: accountId,
      type: "account_onboarding",
      refresh_url: STRIPE_CONNECT_REFRESH_URL,
      return_url: STRIPE_CONNECT_RETURN_URL,
    });

    return res.json({ url: link.url });
  } catch (err) {
    console.error("Payout connect error:", err.message);
    return res.status(500).json({
      error: err?.raw?.message || err.message || "Unable to start payout setup.",
    });
  }
});

app.post("/api/shop/cashout", async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;

  if (!stripe) {
    return res.status(400).json({ error: "Stripe is not configured." });
  }

  const amountCents = Number(req.body?.amountCents);
  if (!Number.isFinite(amountCents) || amountCents % 1 !== 0) {
    return res.status(400).json({ error: "Enter a valid USD amount." });
  }
  if (amountCents < MIN_CASHOUT_CENTS || amountCents > MAX_CASHOUT_CENTS) {
    return res.status(400).json({
      error: `Cash out must be between $${(MIN_CASHOUT_CENTS / 100).toFixed(
        2
      )} and $${(MAX_CASHOUT_CENTS / 100).toFixed(2)}.`,
    });
  }

  const gemsRequired = amountCents;
  if ((user.gems || 0) < gemsRequired) {
    return res.status(400).json({
      error: "Not enough gems for that cash out amount.",
    });
  }
  if (!user.stripeConnectAccountId) {
    return res.status(400).json({
      error: "Connect your payout account before cashing out.",
    });
  }

  try {
    const status = await getCashoutStatus(user);
    if (!status.ready) {
      return res.status(400).json({
        error: "Finish Stripe payout onboarding before cashing out.",
      });
    }

    const idempotencyKey = `cashout:${user.id}:${amountCents}:${Math.floor(
      Date.now() / 30000
    )}`;
    const transfer = await stripe.transfers.create(
      {
        amount: amountCents,
        currency: "usd",
        destination: user.stripeConnectAccountId,
        description: `BetRoyale cash out (${gemsRequired} gems)`,
        metadata: {
          userId: user.id,
          gems: String(gemsRequired),
        },
      },
      { idempotencyKey }
    );

    user.gems = Math.max(0, (user.gems || 0) - gemsRequired);
    user.updatedAt = Date.now();
    await saveStore();

    const now = Date.now();
    const cashoutRecord = {
      id: createId(8),
      userId: user.id,
      stripeTransferId: transfer.id,
      stripeAccountId: user.stripeConnectAccountId,
      gems: gemsRequired,
      amountCents,
      status: "sent",
      error: null,
      createdAt: now,
      updatedAt: now,
    };
    await recordCashout(cashoutRecord);

    return res.json({
      ok: true,
      user: publicUser(user),
      cashout: cashoutRecord,
      message: "Cash out sent to your Stripe payout account.",
    });
  } catch (err) {
    return res.status(400).json({
      error: err?.raw?.message || err.message || "Unable to process cash out.",
    });
  }
});

app.get("/api/battlelog", async (req, res) => {
  if (!requireAuth(req, res)) return;

  const tagInput = req.query.tag;
  const tag = sanitizeTag(tagInput);

  if (!tag) {
    return res.status(400).json({ error: "Enter a valid player tag." });
  }

  try {
    const battles = await fetchBattlelog(tag);
    return res.json({ tag, battles });
  } catch (err) {
    return res.status(err.status || 500).json({
      error: err.message || "Unexpected server error.",
      reason: err.reason,
    });
  }
});

app.get("/api/results", async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;

  const referenceTag = sanitizeTag(user.tag);
  if (!referenceTag) {
    return res.status(400).json({ error: "Add your player tag first." });
  }

  const requestedLimit = Number.parseInt(String(req.query.limit || "25"), 10);
  const limit = Number.isFinite(requestedLimit)
    ? Math.max(1, Math.min(requestedLimit, 500))
    : 250;

  const normalizedTag = normalizeTagValue(referenceTag);
  const battles = Object.values(store.recordedMatches || {})
    .filter((record) => {
      const tagA = normalizeTagValue(record?.tagA);
      const tagB = normalizeTagValue(record?.tagB);
      return tagA === normalizedTag || tagB === normalizedTag;
    })
    .sort((a, b) => getRecordTimestamp(b) - getRecordTimestamp(a))
    .slice(0, limit)
    .map((record) => buildBattleFromRecord(record, normalizedTag));

  return res.json({
    tag: referenceTag,
    referenceTag: normalizedTag,
    battles,
  });
});

app.get("/api/leaderboards", async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;

  const currency = req.query.currency === "gems" ? "gems" : "coins";
  const requestedPeriod = String(req.query.period || "month").trim().toLowerCase();
  const period = ["week", "month", "year", "all"].includes(requestedPeriod)
    ? requestedPeriod
    : "month";

  await processMonthlyGemLeaderboardRewards();

  const window = getPeriodWindow(period);
  const entries = buildLeaderboardEntries(currency, period, { window }).slice(0, 25);
  const lastRewardMonthKey = Object.keys(store.leaderboardRewards || {})
    .sort()
    .slice(-1)[0] || null;

  return res.json({
    currency,
    period,
    label: window.label,
    entries,
    prizeSchedule: currency === "gems" ? getMonthlyPrizeSchedule() : [],
    lastRewardMonthKey,
  });
});

app.post("/api/queue/join", (req, res) => {
  cleanupQueues();

  const user = requireAuth(req, res);
  if (!user) return;

  const activeMatch = getActiveMatchForUser(user);
  if (activeMatch) {
    return res.json({
      status: "matched",
      ticketId: null,
      match: activeMatch,
    });
  }

  if (!user.tag) {
    return res.status(400).json({ error: "Add your player tag first." });
  }

  if (!user.friendLink) {
    return res.status(400).json({ error: "Add your friend link first." });
  }

  if (!user.isVerified) {
    return res
      .status(400)
      .json({ error: "Verify your account before joining the queue." });
  }

  if (user.selfExcluded) {
    return res
      .status(403)
      .json({ error: "Your account is self-excluded. Contact support@betroyale.win to lift the exclusion after a mandatory 30-day cooling-off period." });
  }

  const wager = parseWager(req.body?.wager);
  if (wager === null) {
    return res.status(400).json({ error: "Enter a valid wager amount." });
  }
  const currency = parseWagerCurrency(req.body?.currency);
  if (!currency) {
    return res.status(400).json({ error: "Choose coins or gems to wager." });
  }
  const maxWager = currency === "gems" ? MAX_WAGER_GEMS : MAX_WAGER_COINS;
  if (wager > maxWager) {
    return res.status(400).json({ error: `Maximum wager is ${maxWager} ${currency} per match.` });
  }
  const balance = currency === "gems" ? user.gems : user.credits;
  if (wager > balance) {
    return res
      .status(400)
      .json({ error: `Not enough ${currency} to wager.` });
  }

  fetchPlayerProfile(user.tag)
    .then(async (profile) => {
      user.playerProfile = profile;
      user.updatedAt = Date.now();
      await saveStore();

      const existing = findExistingTicket(user.id);
      if (existing) {
        existing.tag = user.tag;
        existing.friendLink = user.friendLink;
        existing.wager = wager;
        existing.currency = currency;
        existing.profile = profile;
        existing.updatedAt = Date.now();
        return res.json({ status: "waiting", ticketId: existing.id });
      }

      const ticket = createTicket(user, wager, currency);
      waitingQueue.push(ticket.id);
      return res.json({ status: "waiting", ticketId: ticket.id });
    })
    .catch((err) => {
      return res.status(err.status || 500).json({
        error: err.message || "Unable to fetch player profile.",
        reason: err.reason,
      });
    });
});

app.post("/api/queue/accept", async (req, res) => {
  cleanupQueues();

  const user = requireAuth(req, res);
  if (!user) return;

  const activeMatch = getActiveMatchForUser(user);
  if (activeMatch) {
    return res.json({
      status: "matched",
      ticketId: null,
      match: activeMatch,
    });
  }

  if (!user.tag) {
    return res.status(400).json({ error: "Add your player tag first." });
  }

  if (!user.friendLink) {
    return res.status(400).json({ error: "Add your friend link first." });
  }

  if (!user.isVerified) {
    return res
      .status(400)
      .json({ error: "Verify your account before joining the queue." });
  }

  const ticketId = String(req.body?.ticketId || "").trim().toUpperCase();
  if (!ticketId) {
    return res.status(400).json({ error: "Missing ticket to accept." });
  }

  const targetTicket = tickets.get(ticketId);
  if (!targetTicket || targetTicket.matchId || isTicketExpired(targetTicket)) {
    tickets.delete(ticketId);
    removeFromQueue(ticketId);
    return res.status(404).json({ error: "That queue entry is no longer available." });
  }

  if (targetTicket.userId === user.id) {
    return res.status(400).json({ error: "You cannot accept your own wager." });
  }

  const targetWager = Math.max(0, Math.floor(targetTicket.wager || 0));
  const targetCurrency = targetTicket.currency || "coins";
  const balance = targetCurrency === "gems" ? user.gems : user.credits;
  if (targetWager > balance) {
    return res
      .status(400)
      .json({ error: `Not enough ${targetCurrency} to accept this wager.` });
  }

  try {
    const profile = await fetchPlayerProfile(user.tag);
    user.playerProfile = profile;
    user.updatedAt = Date.now();
    await saveStore();

    const existing = findExistingTicket(user.id);
    if (existing) {
      removeFromQueue(existing.id);
      tickets.delete(existing.id);
    }

    const refreshedTarget = tickets.get(ticketId);
    if (
      !refreshedTarget ||
      refreshedTarget.matchId ||
      isTicketExpired(refreshedTarget)
    ) {
      tickets.delete(ticketId);
      removeFromQueue(ticketId);
      return res
        .status(409)
        .json({ error: "Another player accepted this wager first." });
    }

    const accepterTicket = createTicket(user, targetWager, targetCurrency);
    const match = createMatch(accepterTicket, refreshedTarget);
    return res.json({
      status: "matched",
      ticketId: accepterTicket.id,
      match,
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      error: err.message || "Unable to accept this wager.",
      reason: err.reason,
    });
  }
});

app.get("/api/queue/status/:ticketId", (req, res) => {
  cleanupQueues();

  const ticketId = req.params.ticketId.trim().toUpperCase();
  const ticket = tickets.get(ticketId);

  if (!ticket || isTicketExpired(ticket)) {
    tickets.delete(ticketId);
    return res.status(404).json({ error: "Ticket expired or not found." });
  }

  ticket.updatedAt = Date.now();

  if (!ticket.matchId) {
    return res.json({ status: "waiting", ticketId: ticket.id });
  }

  const match = matches.get(ticket.matchId);
  if (!match) {
    return res.status(404).json({ error: "Match not found." });
  }

  return res.json({ status: "matched", ticketId: ticket.id, match });
});

app.get("/api/queue/list", (req, res) => {
  cleanupQueues();

  const user = requireAuth(req, res);
  if (!user) return;

  const entries = [];
  waitingQueue.forEach((ticketId) => {
    const ticket = tickets.get(ticketId);
    if (!ticket || ticket.matchId || isTicketExpired(ticket)) {
      return;
    }
    const queueUser = findUserById(ticket.userId);
    entries.push({
      ticketId: ticket.id,
      userId: ticket.userId,
      username: queueUser?.username || "",
      tag: ticket.tag,
      wager: ticket.wager || 0,
      currency: ticket.currency || "coins",
      profile: ticket.profile || queueUser?.playerProfile || null,
      stats: queueUser?.stats || null,
      joinedAt: ticket.createdAt,
      isYou: ticket.userId === user.id,
    });
  });

  entries.sort((a, b) => a.joinedAt - b.joinedAt);
  return res.json({ entries });
});

app.post("/api/queue/cancel", (req, res) => {
  cleanupQueues();

  const user = requireAuth(req, res);
  if (!user) return;

  const ticket = findExistingTicket(user.id);
  if (ticket) {
    removeFromQueue(ticket.id);
    tickets.delete(ticket.id);
  }

  return res.json({ ok: true });
});

app.get("/api/matches/:matchId/track", async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;

  const matchId = req.params.matchId.trim().toUpperCase();
  const match = matches.get(matchId);
  if (!match) {
    return res.status(404).json({ error: "Match not found." });
  }

  if (match.players.length < 2) {
    return res
      .status(400)
      .json({ error: "Match needs two players to track a battle." });
  }

  const [playerA, playerB] = match.players;
  const perspectivePlayer = match.players.find(
    (player) => player.userId === user.id
  );
  if (!perspectivePlayer) {
    return res.status(403).json({ error: "You are not in this match." });
  }

  const tagA = normalizeTagValue(playerA.tag);
  const tagB = normalizeTagValue(playerB.tag);
  const referenceTag = normalizeTagValue(perspectivePlayer.tag);
  if (!tagA || !tagB || !referenceTag) {
    return res.status(400).json({
      error: "Both players need valid Clash Royale tags before tracking a battle.",
    });
  }

  const recordedMatch = getRecordedMatchForMatchId(matchId);
  if (recordedMatch) {
    const settledBattle = buildBattleFromRecord(recordedMatch, referenceTag);
    return res.json({
      matchId,
      tagA,
      tagB,
      referenceTag,
      battle: settledBattle,
      score: {
        team: sumCrowns(settledBattle.team),
        opponent: sumCrowns(settledBattle.opponent),
      },
      settled: true,
    });
  }

  try {
    const battlelogResults = await Promise.allSettled([
      fetchBattlelog(tagA),
      fetchBattlelog(tagB),
    ]);
    const battleLogs = battlelogResults
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);
    if (!battleLogs.length) {
      const firstFailure = battlelogResults.find(
        (result) => result.status === "rejected"
      );
      throw firstFailure?.reason || new Error("Failed to fetch battle log.");
    }

    const trackWindowStart = getTrackWindowStart(match);
    const trackedBattle = pickBattleForMatch(
      battleLogs,
      tagA,
      tagB,
      trackWindowStart
    );

    if (trackedBattle.status === "pending" || !trackedBattle.battle) {
      return res.json({
        matchId,
        tagA,
        tagB,
        referenceTag,
        battle: null,
        status: "pending",
        message:
          "No friendly battle found yet. It can take a minute to appear in the battle log.",
      });
    }

    const battle = trackedBattle.battle;

    if (trackedBattle.status === "invalid") {
      return res.json({
        matchId,
        tagA,
        tagB,
        referenceTag,
        battle: null,
        status: "invalid",
        message:
          "We found a friendly battle, but the settings were off. Please play a standard 1v1 Friendly Battle (no special rules like 2v2, Triple Elixir, Rage, Draft, etc.).",
      });
    }

    const teamCrowns = sumCrowns(battle.team);
    const opponentCrowns = sumCrowns(battle.opponent);

    const matchKey = createMatchKey(battle, tagA, tagB);
    if (!store.recordedMatches[matchKey]) {
      const userA = findUserById(playerA.userId);
      const userB = findUserById(playerB.userId);
      const wagerA = Math.max(0, Math.floor(playerA.wager || 0));
      const wagerB = Math.max(0, Math.floor(playerB.wager || 0));
      const currencyA = playerA.wagerCurrency || "coins";
      const currencyB = playerB.wagerCurrency || "coins";
      const resultA = getResultForTag(battle, playerA.tag);
      const resultB = getResultForTag(battle, playerB.tag);

      if (userA && resultA) updateStatsForUser(userA, resultA, battle.battleTime);
      if (userB && resultB) updateStatsForUser(userB, resultB, battle.battleTime);

      // Helper: apply wager transfer with house cut.
      // Winner receives WINNER_PCT (95%) of the total pot.
      // When both players use the same currency the pot is simply wagerA + wagerB.
      // When currencies differ, the winner gets WINNER_PCT of the opponent's wager
      // in the opponent's currency; the loser forfeits their full wager.
      function applyWagerTransfer(winner, loser, wWager, wCurrency, lWager, lCurrency) {
        if (!winner || !loser || lWager <= 0) return;
        if (wCurrency === lCurrency) {
          const pot     = wWager + lWager;
          const payout  = Math.floor(pot * WINNER_PCT);
          const net     = payout - wWager; // winner already holds their own stake
          if (wCurrency === "gems") {
            winner.gems   = Math.max(0, (winner.gems   || 0) + net);
            loser.gems    = Math.max(0, (loser.gems    || 0) - lWager);
          } else {
            winner.credits = Math.max(0, (winner.credits || 0) + net);
            loser.credits  = Math.max(0, (loser.credits  || 0) - lWager);
          }
        } else {
          // Mixed currencies: 95% of loser's wager goes to winner (in loser's currency)
          const loserPays = Math.floor(lWager * WINNER_PCT);
          if (lCurrency === "gems") {
            winner.gems  = Math.max(0, (winner.gems  || 0) + loserPays);
            loser.gems   = Math.max(0, (loser.gems   || 0) - lWager);
          } else {
            winner.credits = Math.max(0, (winner.credits || 0) + loserPays);
            loser.credits  = Math.max(0, (loser.credits  || 0) - lWager);
          }
        }
      }

      if (resultA === "win" && resultB === "loss") {
        applyWagerTransfer(userA, userB, wagerA, currencyA, wagerB, currencyB);
      } else if (resultB === "win" && resultA === "loss") {
        applyWagerTransfer(userB, userA, wagerB, currencyB, wagerA, currencyA);
      }

      store.recordedMatches[matchKey] = {
        matchId,
        tagA,
        tagB,
        userIdA: userA?.id || null,
        userIdB: userB?.id || null,
        usernameA: userA?.username || "",
        usernameB: userB?.username || "",
        wagerA,
        wagerB,
        currencyA,
        currencyB,
        battleTime: battle.battleTime || null,
        battleType: battle.type || "",
        gameModeName: battle.gameMode?.name || "",
        teamCrowns,
        opponentCrowns,
        resultByTag: {
          [tagA]: resultA || null,
          [tagB]: resultB || null,
        },
        battleSummary: {
          team: summarizeBattlePlayers(battle.team),
          opponent: summarizeBattlePlayers(battle.opponent),
        },
        recordedAt: new Date().toISOString(),
      };
      await saveStore();
    }

    return res.json({
      matchId,
      tagA,
      tagB,
      referenceTag,
      battle,
      score: {
        team: teamCrowns,
        opponent: opponentCrowns,
      },
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      error: err.message || "Unexpected server error.",
      reason: err.reason,
    });
  }
});

// SPA fallback — serve index.html for all non-API routes (e.g. /terms, /privacy)
app.get(/^(?!\/api).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

async function start() {
  await loadStore();
  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
