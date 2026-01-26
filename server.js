const path = require("path");
const fs = require("fs/promises");
const express = require("express");
const fetch = require("node-fetch");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const session = require("express-session");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "127.0.0.1";
const API_TOKEN = process.env.CR_API_TOKEN;
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret";

const STORE_PATH =
  process.env.STORE_PATH || path.join(__dirname, "data", "store.json");
const QUEUE_TTL_MS = 1000 * 60 * 30;
const MATCH_TTL_MS = 1000 * 60 * 60 * 6;
const MATCH_LOCK_MS = 1000 * 60 * 2;
const STARTING_CREDITS = 1000;
const VERIFICATION_TTL_MS = 1000 * 60 * 30;

const waitingQueue = [];
const tickets = new Map();
const matches = new Map();

let store = {
  users: [],
  recordedMatches: {},
  migrations: {},
};

let writeChain = Promise.resolve();

if (!API_TOKEN) {
  console.warn("Missing CR_API_TOKEN in .env");
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
    if (err.code !== "ENOENT") {
      throw err;
    }
    await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
    await saveStore();
  }
}

function saveStore() {
  writeChain = writeChain.then(() =>
    fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2))
  );
  return writeChain;
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
    req.session.userId = user.id;
    return res.status(201).json({
      user: publicUser(user),
      verificationCode: user.verificationCode,
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
