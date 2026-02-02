const path = require("path");
const fs = require("fs/promises");
const express = require("express");
const fetch = require("node-fetch");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const { Pool } = require("pg");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "127.0.0.1";
const API_TOKEN = process.env.CR_API_TOKEN;
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret";
const DATABASE_URL = process.env.DATABASE_URL;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER || "no-reply@betroyale.win";

const STORE_PATH =
  process.env.STORE_PATH || path.join(__dirname, "data", "store.json");
const DB_SSL =
  DATABASE_URL &&
  !DATABASE_URL.includes("localhost") &&
  !DATABASE_URL.includes("127.0.0.1");
const pool = DATABASE_URL
  ? new Pool({
      connectionString: DATABASE_URL,
      ssl: DB_SSL ? { rejectUnauthorized: false } : undefined,
    })
  : null;
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
const QUEUE_TTL_MS = 1000 * 60 * 30;
const MATCH_TTL_MS = 1000 * 60 * 60 * 6;
const MATCH_LOCK_MS = 1000 * 60 * 2;
const STARTING_CREDITS = 1000;
const VERIFICATION_TTL_MS = 1000 * 60 * 30;
const GEM_BUNDLES = [
  { id: "gems-10", gems: 10, coins: 1000 },
  { id: "gems-25", gems: 25, coins: 2500 },
  { id: "gems-50", gems: 50, coins: 5000 },
  { id: "gems-100", gems: 100, coins: 10000 },
];
const waitingQueue = [];
const tickets = new Map();
const matches = new Map();

let store = {
  users: [],
  recordedMatches: {},
  migrations: {},
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
    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value JSONB
    )
  `);
}

if (!API_TOKEN) {
  console.warn("Missing CR_API_TOKEN in .env");
}
if (!mailTransport) {
  console.warn("Missing EMAIL_USER/EMAIL_PASS; verification emails disabled.");
}

app.use(express.json());
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
    },
  })
);
app.use(express.static(path.join(__dirname, "public")));

async function loadStore() {
  try {
    if (pool) {
      await ensureDatabaseSchema();
      const [userResult, matchResult, metaResult] = await Promise.all([
        pool.query("SELECT * FROM users"),
        pool.query("SELECT * FROM recorded_matches"),
        pool.query("SELECT value FROM app_meta WHERE key = $1", ["migrations"]),
      ]);

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
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        })),
        recordedMatches: {},
        migrations: parseJsonValue(metaResult.rows?.[0]?.value, {}) || {},
      };

      matchResult.rows.forEach((row) => {
        store.recordedMatches[row.match_key] = {
          matchId: row.match_id,
          tagA: row.tag_a,
          tagB: row.tag_b,
          wagerA: row.wager_a,
          wagerB: row.wager_b,
          currencyA: row.currency_a,
          currencyB: row.currency_b,
          recordedAt: row.recorded_at,
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
        migrations:
          parsed.migrations && typeof parsed.migrations === "object"
            ? parsed.migrations
            : {},
      };
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
      throw err;
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
    await ensureDatabaseSchema();
    const client = await pool.connect();
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
            created_at,
            updated_at
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9,
            $10, $11, $12, $13, $14, $15, $16, $17
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
            recorded_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (match_key) DO UPDATE SET
            match_id = EXCLUDED.match_id,
            tag_a = EXCLUDED.tag_a,
            tag_b = EXCLUDED.tag_b,
            wager_a = EXCLUDED.wager_a,
            wager_b = EXCLUDED.wager_b,
            currency_a = EXCLUDED.currency_a,
            currency_b = EXCLUDED.currency_b,
            recorded_at = EXCLUDED.recorded_at
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
          ]
        );
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
  return trimmed;
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
  };
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

  for (const [id, match] of matches.entries()) {
    if (isMatchExpired(match)) {
      matches.delete(id);
    }
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
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data?.message || "Failed to fetch player profile.");
    error.status = response.status;
    error.reason = data?.reason;
    throw error;
  }

  return {
    name: data?.name || "Unknown",
    trophies: Number(data?.trophies) || 0,
    bestTrophies: Number(data?.bestTrophies) || 0,
    expLevel: Number(data?.expLevel) || 0,
    arena: data?.arena?.name || "",
    updatedAt: new Date().toISOString(),
  };
}

function sumCrowns(players) {
  if (!Array.isArray(players)) return 0;
  return players.reduce((sum, player) => sum + (player.crowns || 0), 0);
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

function getGemBundle(bundleId) {
  return GEM_BUNDLES.find((bundle) => bundle.id === bundleId) || null;
}

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

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = createUser(email, passwordHash);
    user.username = username;
    store.users.push(user);
    await saveStore();
    if (user.verificationCode) {
      try {
        await sendVerificationEmail({
          email: user.email,
          username: user.username,
          code: user.verificationCode,
        });
      } catch (mailErr) {
        store.users = store.users.filter((entry) => entry.id !== user.id);
        await saveStore();
        return res
          .status(500)
          .json({ error: "Unable to send verification email." });
      }
    }
    req.session.userId = user.id;
    return res.status(201).json({
      user: publicUser(user),
      verificationCode: mailTransport ? null : user.verificationCode,
      verificationExpiresAt: user.verificationExpiresAt,
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

app.get("/api/shop/bundles", (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;

  return res.json({
    bundles: GEM_BUNDLES,
    balance: {
      coins: user.credits,
      gems: user.gems,
    },
  });
});

app.post("/api/shop/buy", async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;

  const bundleId = String(req.body?.bundleId || "").trim();
  const bundle = getGemBundle(bundleId);
  if (!bundle) {
    return res.status(400).json({ error: "Invalid gem bundle." });
  }

  if (user.credits < bundle.coins) {
    return res.status(400).json({ error: "Not enough coins to purchase." });
  }

  user.credits = Math.max(0, user.credits - bundle.coins);
  user.gems = Math.max(0, user.gems + bundle.gems);
  user.updatedAt = Date.now();
  await saveStore();

  return res.json({
    user: publicUser(user),
    purchase: {
      bundleId: bundle.id,
      gems: bundle.gems,
      coins: bundle.coins,
    },
  });
});

app.get("/api/battlelog", async (req, res) => {
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

  const wager = parseWager(req.body?.wager);
  if (wager === null) {
    return res.status(400).json({ error: "Enter a valid wager amount." });
  }
  const currency = parseWagerCurrency(req.body?.currency);
  if (!currency) {
    return res.status(400).json({ error: "Choose coins or gems to wager." });
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
        const opponent = dequeueOpponent(user.id, currency);
        if (opponent) {
          const match = createMatch(existing, opponent);
          return res.json({
            status: "matched",
            ticketId: existing.id,
            match,
          });
        }

        existing.updatedAt = Date.now();
        return res.json({ status: "waiting", ticketId: existing.id });
      }

      const opponent = dequeueOpponent(user.id, currency);
      if (opponent) {
        const ticket = createTicket(user, wager, currency);
        const match = createMatch(ticket, opponent);
        return res.json({ status: "matched", ticketId: ticket.id, match });
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
      tag: ticket.tag,
      wager: ticket.wager || 0,
      currency: ticket.currency || "coins",
      profile: ticket.profile || queueUser?.playerProfile || null,
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
  const tagA = normalizeTagValue(playerA.tag);
  const tagB = normalizeTagValue(playerB.tag);

  try {
    const [battlesA, battlesB] = await Promise.all([
      fetchBattlelog(tagA),
      fetchBattlelog(tagB),
    ]);

    const battleA = findFriendlyMatch(battlesA, tagA, tagB);
    const battleB = findFriendlyMatch(battlesB, tagA, tagB);
    const battle = selectLatestBattle(battleA, battleB);
    let referenceTag = tagA;
    if (battle && battleB && battle === battleB) {
      referenceTag = tagB;
    }

    if (!battle) {
      return res.json({
        matchId,
        tagA,
        tagB,
        battle: null,
        message: "No friendly battle found yet.",
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

      if (userA) {
        const resultA = getResultForTag(battle, userA.tag);
        if (resultA) {
          updateStatsForUser(userA, resultA, battle.battleTime);
          if (resultA === "win") {
            if (currencyB === "gems") {
              userA.gems += wagerB;
            } else {
              userA.credits += wagerB;
            }
          } else if (resultA === "loss") {
            if (currencyA === "gems") {
              userA.gems = Math.max(0, userA.gems - wagerA);
            } else {
              userA.credits = Math.max(0, userA.credits - wagerA);
            }
          }
        }
      }

      if (userB) {
        const resultB = getResultForTag(battle, userB.tag);
        if (resultB) {
          updateStatsForUser(userB, resultB, battle.battleTime);
          if (resultB === "win") {
            if (currencyA === "gems") {
              userB.gems += wagerA;
            } else {
              userB.credits += wagerA;
            }
          } else if (resultB === "loss") {
            if (currencyB === "gems") {
              userB.gems = Math.max(0, userB.gems - wagerB);
            } else {
              userB.credits = Math.max(0, userB.credits - wagerB);
            }
          }
        }
      }

      store.recordedMatches[matchKey] = {
        matchId,
        tagA,
        tagB,
        wagerA,
        wagerB,
        currencyA,
        currencyB,
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
