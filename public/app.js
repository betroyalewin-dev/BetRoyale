const authPanel = document.getElementById("auth-panel");
const profilePanel = document.getElementById("profile-panel");
const queuePanel = document.getElementById("queue-panel");
const storePanel = document.getElementById("store-panel");

const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");
const logoutBtn = document.getElementById("logout");
const profileForm = document.getElementById("profile-form");

const registerUsername = document.getElementById("register-username");
const registerEmail = document.getElementById("register-email");
const registerPassword = document.getElementById("register-password");
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");

const profileEmail = document.getElementById("profile-email");
const profileUsername = document.getElementById("profile-username");
const profileTag = document.getElementById("profile-tag");
const profileLink = document.getElementById("profile-link");
const profileHelp = document.getElementById("profile-help");
const profileName = document.getElementById("profile-name");
const profileArena = document.getElementById("profile-arena");
const profileTrophies = document.getElementById("profile-trophies");
const verifyPanel = document.getElementById("verify-panel");
const verifyStatus = document.getElementById("verify-status");
const verifyCodeInput = document.getElementById("verify-code");
const verifyButton = document.getElementById("verify-button");
const verifyDisplay = document.getElementById("verify-display");

const statMatches = document.getElementById("stat-matches");
const statCoins = document.getElementById("stat-coins");
const statGems = document.getElementById("stat-gems");
const statWins = document.getElementById("stat-wins");
const statLosses = document.getElementById("stat-losses");
const statDraws = document.getElementById("stat-draws");
const balanceCoins = document.getElementById("balance-coins");
const balanceGems = document.getElementById("balance-gems");
const storeRewardsEl = document.getElementById("store-rewards");
const storeClaimBtn = document.getElementById("store-claim");
const storeStreakEl = document.getElementById("store-streak-count");
const storeNextEl = document.getElementById("store-next");
const storeMessageEl = document.getElementById("store-message");

const joinQueueBtn = document.getElementById("join-queue");
const wagerInput = document.getElementById("wager-amount");
const wagerLabel = document.getElementById("wager-label");
const refreshQueueBtn = document.getElementById("refresh-queue");
const cancelQueueBtn = document.getElementById("cancel-queue");
const queueListEl = document.getElementById("queue-list");
const queueCountEl = document.getElementById("queue-count");
const queueEmptyEl = document.getElementById("queue-empty");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");
const resultsPanel = document.getElementById("results-panel");
const matchSection = document.getElementById("match");
const matchIdEl = document.getElementById("match-id");
const matchPlayersEl = document.getElementById("match-players");
const trackBattleBtn = document.getElementById("track-battle");
const matchLockEl = document.getElementById("match-lock");
const matchPotEl = document.getElementById("match-pot");
const matchYourWagerEl = document.getElementById("match-your-wager");
const matchOpponentWagerEl = document.getElementById("match-opponent-wager");
const menuButtons = Array.from(document.querySelectorAll(".menu-button"));
const heroSection = document.querySelector(".hero");
const wagerPresetButtons = Array.from(
  document.querySelectorAll(".preset-button")
);
const currencyButtons = Array.from(
  document.querySelectorAll(".currency-button")
);

const sectionPanels = {
  auth: authPanel,
  profile: profilePanel,
  store: storePanel,
  queue: queuePanel,
  match: matchSection,
  results: resultsPanel,
};

let currentUser = null;
let currentTicketId = null;
let currentMatchId = null;
let pollTimer = null;
let matchLockTimer = null;
let matchLockCountdownTimer = null;
let queueTimer = null;
let activeSection = "auth";
let selectedCurrency = "coins";

function updatePresetActive(value) {
  const numeric = Number(value);
  wagerPresetButtons.forEach((button) => {
    const preset = Number(button.dataset.wager);
    const isActive = Number.isFinite(numeric) && numeric === preset;
    button.classList.toggle("active", isActive);
  });
}

function setCurrency(currency) {
  selectedCurrency = currency === "gems" ? "gems" : "coins";
  currencyButtons.forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.currency === selectedCurrency
    );
  });
  if (wagerLabel) {
    wagerLabel.textContent = `Wager (${selectedCurrency})`;
  }
}

function resolveSectionTarget(section) {
  if (section === "auth" && currentUser) {
    return "profile";
  }
  return section;
}

function setActiveSection(section) {
  const target = resolveSectionTarget(section);
  if (!sectionPanels[target]) return;
  Object.entries(sectionPanels).forEach(([key, panel]) => {
    if (!panel) return;
    panel.classList.toggle("hidden", key !== target);
  });
  if (heroSection) {
    heroSection.classList.toggle("hidden", target !== "auth");
  }
  menuButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.section === target);
  });
  activeSection = target;
  if (target === "store") {
    refreshStoreStatus();
  }
}

function updateMenuState(user) {
  const isLoggedIn = Boolean(user);
  menuButtons.forEach((button) => {
    const section = button.dataset.section;
    if (!section) return;
    if (isLoggedIn) {
      button.disabled = false;
      button.classList.remove("disabled");
    } else {
      const disable = section !== "auth";
      button.disabled = disable;
      button.classList.toggle("disabled", disable);
    }
  });

  if (!isLoggedIn) {
    setActiveSection("auth");
    return;
  }

  if (activeSection === "auth") {
    setActiveSection("profile");
  }
}

function showStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("hidden", !message);
  statusEl.classList.toggle("error", isError);
}

function clearResults() {
  resultsEl.innerHTML = "";
}

function setAuthState(user) {
  currentUser = user;

  if (user) {
    updateProfileUI(user);
    refreshStoreStatus();
    startQueuePolling();
  } else {
    profileEmail.textContent = "—";
    if (profileUsername) profileUsername.value = "";
    profileTag.value = "";
    profileLink.value = "";
    statMatches.textContent = "0";
    if (statCoins) statCoins.textContent = "0";
    if (statGems) statGems.textContent = "0";
    statWins.textContent = "0";
    statLosses.textContent = "0";
    statDraws.textContent = "0";
    if (profileName) profileName.textContent = "—";
    if (profileArena) profileArena.textContent = "No profile loaded";
    if (profileTrophies) profileTrophies.textContent = "0";
    if (verifyStatus) {
      verifyStatus.textContent = "Unverified";
      verifyStatus.classList.remove("verified");
    }
    if (verifyPanel) verifyPanel.classList.add("hidden");
    if (verifyDisplay) verifyDisplay.classList.add("hidden");
    if (queueListEl) queueListEl.innerHTML = "";
    if (queueCountEl) queueCountEl.textContent = "0 waiting";
    if (queueEmptyEl) queueEmptyEl.classList.remove("hidden");
    if (balanceCoins) balanceCoins.textContent = "0";
    if (balanceGems) balanceGems.textContent = "0";
    if (storeStreakEl) storeStreakEl.textContent = "0";
    if (storeNextEl) storeNextEl.textContent = "Next reward: —";
    if (storeMessageEl) storeMessageEl.textContent = "";
    if (storeRewardsEl) storeRewardsEl.innerHTML = "";
    stopQueuePolling();
  }

  updateMenuState(user);
}

function updateProfileUI(user) {
  profileEmail.textContent = user.email || "—";
  if (profileUsername) {
    profileUsername.value = user.username || "";
  }
  profileTag.value = user.tag || "";
  profileLink.value = user.friendLink || "";
  const stats = user.stats || {};
  statMatches.textContent = stats.matchesPlayed || 0;
  const coins = user.coins ?? user.credits ?? 0;
  if (statCoins) statCoins.textContent = coins;
  if (statGems) statGems.textContent = user.gems ?? 0;
  if (balanceCoins) balanceCoins.textContent = coins;
  if (balanceGems) balanceGems.textContent = user.gems ?? 0;
  statWins.textContent = stats.wins || 0;
  statLosses.textContent = stats.losses || 0;
  statDraws.textContent = stats.draws || 0;
  if (profileName) {
    profileName.textContent = user.playerProfile?.name || "—";
  }
  if (profileArena) {
    profileArena.textContent = user.playerProfile?.arena || "No profile loaded";
  }
  if (profileTrophies) {
    profileTrophies.textContent = user.playerProfile?.trophies ?? 0;
  }
  if (verifyStatus) {
    verifyStatus.textContent = user.isVerified ? "Verified" : "Unverified";
    verifyStatus.classList.toggle("verified", user.isVerified);
  }
  if (verifyPanel) {
    verifyPanel.classList.toggle("hidden", user.isVerified);
  }
  updateProfileHelp(user);
}

function updateProfileHelp(user) {
  if (!profileHelp) return;
  const needsProfile = !user?.tag || !user?.friendLink;
  profileHelp.classList.toggle("hidden", !needsProfile);
}

function formatReward(reward) {
  if (!reward) return "—";
  if (reward.gems) {
    return `${reward.gems} gem${reward.gems === 1 ? "" : "s"}`;
  }
  return `${reward.coins} coins`;
}

function renderStoreRewards(rewards, streak, canClaim, nextRewardIndex) {
  if (!storeRewardsEl) return;
  storeRewardsEl.innerHTML = "";
  if (!Array.isArray(rewards)) return;

  rewards.forEach((reward) => {
    const card = document.createElement("div");
    card.className = "reward-card";

    const dayIndex = reward.day || 0;
    const claimed = canClaim
      ? dayIndex < nextRewardIndex
      : dayIndex <= streak;
    const highlightIndex = canClaim ? nextRewardIndex : streak || 1;
    const isToday = dayIndex === highlightIndex;

    if (claimed) card.classList.add("claimed");
    if (isToday) card.classList.add("today");

    const title = document.createElement("p");
    title.className = "reward-title";
    title.textContent = `Day ${dayIndex}`;

    const value = document.createElement("p");
    value.className = "reward-value";
    value.textContent = formatReward(reward);

    const badge = document.createElement("span");
    badge.className = "reward-badge";
    if (isToday && canClaim) {
      badge.textContent = "Today";
    } else if (claimed) {
      badge.textContent = "Claimed";
    } else {
      badge.textContent = "Locked";
    }

    card.appendChild(title);
    card.appendChild(value);
    card.appendChild(badge);
    storeRewardsEl.appendChild(card);
  });
}

function updateStoreUI(status) {
  if (!status) return;
  const streak = Number(status.streak) || 0;
  const canClaim = Boolean(status.canClaim);
  const nextRewardIndex = Number(status.nextRewardIndex) || 1;
  const nextReward = status.nextReward || null;

  if (storeStreakEl) storeStreakEl.textContent = streak;
  if (storeNextEl) {
    storeNextEl.textContent = `Next reward: ${formatReward(nextReward)}`;
  }
  if (storeMessageEl) {
    storeMessageEl.textContent = canClaim
      ? "Claim today’s reward to keep the streak alive."
      : "You’ve claimed today’s reward. Come back tomorrow!";
  }
  if (storeClaimBtn) {
    storeClaimBtn.disabled = !canClaim;
  }
  renderStoreRewards(status.rewards, streak, canClaim, nextRewardIndex);
}

async function refreshStoreStatus() {
  if (!currentUser) return;
  try {
    const data = await apiRequest("/api/store/status", { method: "GET" });
    updateStoreUI(data);
  } catch (err) {
    if (storeMessageEl) {
      storeMessageEl.textContent = err.message || "Unable to load store.";
    }
  }
}

async function claimDailyReward() {
  if (!currentUser) {
    showStatus("Log in to claim rewards.", true);
    return;
  }
  if (storeClaimBtn) storeClaimBtn.disabled = true;
  if (storeMessageEl) storeMessageEl.textContent = "Claiming reward...";
  try {
    const data = await apiRequest("/api/store/claim", { method: "POST" });
    if (data.user) {
      setAuthState(data.user);
    }
    await refreshStoreStatus();
    showStatus(
      `Daily reward claimed: ${formatReward(data.reward || {})}.`
    );
  } catch (err) {
    if (storeMessageEl) storeMessageEl.textContent = err.message;
    showStatus(err.message, true);
  }
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error || "Request failed.";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return data;
}

async function loadSession() {
  try {
    const data = await apiRequest("/api/auth/session", { method: "GET" });
    setAuthState(data.user);
  } catch (err) {
    setAuthState(null);
  }
}

async function refreshProfile() {
  try {
    const data = await apiRequest("/api/profile", { method: "GET" });
    setAuthState(data.user);
  } catch (err) {
    showStatus(err.message, true);
  }
}

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  showStatus("Creating account...");

  try {
    const data = await apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        username: registerUsername.value,
        email: registerEmail.value,
        password: registerPassword.value,
      }),
    });
    setAuthState(data.user);
    showStatus("Account created. Verify your account below.");
    if (verifyDisplay && data.verificationCode) {
      verifyDisplay.textContent = `Verification code: ${data.verificationCode}`;
      verifyDisplay.classList.remove("hidden");
    }
    registerForm.reset();
    profileTag.focus();
  } catch (err) {
    showStatus(err.message, true);
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  showStatus("Logging in...");

  try {
    const data = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        identifier: loginEmail.value,
        password: loginPassword.value,
      }),
    });
    setAuthState(data.user);
    if (!data.user?.isVerified) {
      showStatus("Logged in. Verify your account to unlock matchmaking.");
    } else if (!data.user?.tag || !data.user?.friendLink) {
      showStatus("Logged in. Add your player tag and friend link below.");
    } else {
      showStatus("Logged in. You can join the queue.");
    }
    loginForm.reset();
  } catch (err) {
    showStatus(err.message, true);
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    await apiRequest("/api/auth/logout", { method: "POST" });
    stopPolling();
    clearMatchLock();
    resetMatch();
    setAuthState(null);
    showStatus("Logged out.");
  } catch (err) {
    showStatus(err.message, true);
  }
});

profileForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  showStatus("Saving profile...");

  try {
    const data = await apiRequest("/api/profile", {
      method: "PUT",
      body: JSON.stringify({
        username: profileUsername?.value,
        tag: profileTag.value,
        friendLink: profileLink.value,
      }),
    });
    setAuthState(data.user);
    showStatus("Profile saved. You can join the queue now.");
  } catch (err) {
    showStatus(err.message, true);
  }
});

async function verifyAccount() {
  if (!verifyCodeInput) return;
  showStatus("Verifying account...");
  try {
    const data = await apiRequest("/api/auth/verify", {
      method: "POST",
      body: JSON.stringify({ code: verifyCodeInput.value }),
    });
    setAuthState(data.user);
    showStatus("Account verified. You can join the queue now.");
    if (verifyDisplay) verifyDisplay.classList.add("hidden");
    verifyCodeInput.value = "";
  } catch (err) {
    showStatus(err.message, true);
  }
}

function formatBattleTime(battleTime) {
  if (!battleTime) return "Unknown time";
  const parsed = new Date(battleTime);
  if (Number.isNaN(parsed.getTime())) return battleTime;
  return parsed.toLocaleString();
}

function sumCrowns(players) {
  if (!Array.isArray(players)) return 0;
  return players.reduce((sum, player) => sum + (player.crowns || 0), 0);
}

function getPlayerNames(players) {
  if (!Array.isArray(players) || players.length === 0) return "Unknown";
  return players.map((p) => p.name).filter(Boolean).join(" + ");
}

function getCardNames(cards) {
  if (!Array.isArray(cards) || cards.length === 0) return [];
  return cards.map((card) => card.name).filter(Boolean);
}

function renderBattle(battle, perspectiveTag) {
  const team = battle.team || [];
  const opponent = battle.opponent || [];
  const teamCrowns = sumCrowns(team);
  const opponentCrowns = sumCrowns(opponent);

  let outcome = "Draw";
  if (teamCrowns > opponentCrowns) outcome = "Win";
  if (teamCrowns < opponentCrowns) outcome = "Loss";

  const card = document.createElement("article");
  card.className = "card";

  const header = document.createElement("div");
  header.className = "card-header";

  const badge = document.createElement("span");
  badge.className = `badge${outcome === "Loss" ? " loss" : ""}`;
  badge.textContent = `${outcome} - ${teamCrowns}-${opponentCrowns}`;

  const meta = document.createElement("div");
  meta.className = "meta";
  const mode = battle.gameMode?.name || battle.type || "Match";
  const perspective = perspectiveTag ? ` - Perspective: ${perspectiveTag}` : "";
  meta.textContent = `${mode} - ${formatBattleTime(battle.battleTime)}${perspective}`;

  header.appendChild(badge);
  header.appendChild(meta);

  const lineup = document.createElement("div");
  lineup.className = "lineup";

  const teamLine = document.createElement("div");
  const teamLabel = document.createElement("span");
  teamLabel.className = "label";
  teamLabel.textContent = "Team:";
  const teamNames = document.createElement("span");
  teamNames.textContent = ` ${getPlayerNames(team)}`;
  teamLine.appendChild(teamLabel);
  teamLine.appendChild(teamNames);

  const oppLine = document.createElement("div");
  const oppLabel = document.createElement("span");
  oppLabel.className = "label";
  oppLabel.textContent = "Opponent:";
  const oppNames = document.createElement("span");
  oppNames.textContent = ` ${getPlayerNames(opponent)}`;
  oppLine.appendChild(oppLabel);
  oppLine.appendChild(oppNames);

  lineup.appendChild(teamLine);
  lineup.appendChild(oppLine);

  const cardsWrap = document.createElement("div");
  cardsWrap.className = "cards";
  const deck = getCardNames(team[0]?.cards);
  cardsWrap.textContent = deck.length
    ? `Deck: ${deck.join(", ")}`
    : "Deck info not available.";

  card.appendChild(header);
  card.appendChild(lineup);
  card.appendChild(cardsWrap);

  return card;
}

function setWaitingState(isWaiting) {
  joinQueueBtn.disabled = isWaiting;
  if (refreshQueueBtn) refreshQueueBtn.disabled = isWaiting;
  currencyButtons.forEach((button) => {
    button.disabled = isWaiting;
  });
  if (wagerInput) {
    wagerInput.disabled = isWaiting;
  }
}

function resetMatch() {
  currentMatchId = null;
  matchSection.classList.add("hidden");
  matchIdEl.textContent = "N/A";
  matchPlayersEl.innerHTML = "";
  trackBattleBtn.disabled = true;
  if (matchPotEl) matchPotEl.textContent = "0";
  if (matchYourWagerEl) matchYourWagerEl.textContent = "0";
  if (matchOpponentWagerEl) matchOpponentWagerEl.textContent = "0";
  clearLockCountdown();
}

function clearMatchLock() {
  if (matchLockTimer) {
    clearTimeout(matchLockTimer);
    matchLockTimer = null;
  }
}

function applyMatchLock(lockUntil) {
  clearMatchLock();
  if (!lockUntil) return;
  const remaining = lockUntil - Date.now();
  if (remaining <= 0) {
    joinQueueBtn.disabled = false;
    return;
  }
  joinQueueBtn.disabled = true;
  matchLockTimer = setTimeout(() => {
    joinQueueBtn.disabled = false;
  }, remaining);
}

function clearLockCountdown() {
  if (matchLockCountdownTimer) {
    clearTimeout(matchLockCountdownTimer);
    matchLockCountdownTimer = null;
  }
  if (matchLockEl) {
    matchLockEl.textContent = "";
  }
}

function startLockCountdown(lockUntil) {
  clearLockCountdown();
  if (!matchLockEl || !lockUntil) return;
  const update = () => {
    const remaining = lockUntil - Date.now();
    if (remaining <= 0) {
      matchLockEl.textContent = "Queue lock ended. You can rejoin.";
      clearLockCountdown();
      return;
    }
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    matchLockEl.textContent = `Queue locked for ${minutes}:${String(
      seconds
    ).padStart(2, "0")}`;
    matchLockCountdownTimer = setTimeout(update, 1000);
  };
  update();
}

function renderMatch(match) {
  currentMatchId = match.id;
  matchSection.classList.remove("hidden");
  matchIdEl.textContent = match.id;
  matchPlayersEl.innerHTML = "";

  const youId = currentUser?.id;
  const you = match.players.find((player) => player.userId === youId);
  const opponent = match.players.find((player) => player.userId !== youId);
  const yourWager = you?.wager ?? 0;
  const opponentWager = opponent?.wager ?? 0;
  const matchCurrency = match.currency || you?.wagerCurrency || "coins";
  const pot =
    matchCurrency === opponent?.wagerCurrency
      ? yourWager + opponentWager
      : null;
  if (matchPotEl) {
    matchPotEl.textContent =
      pot === null ? "Mixed" : `${pot} ${matchCurrency}`;
  }
  if (matchYourWagerEl) {
    matchYourWagerEl.textContent = `${yourWager} ${
      you?.wagerCurrency || matchCurrency
    }`;
  }
  if (matchOpponentWagerEl) {
    matchOpponentWagerEl.textContent = `${opponentWager} ${
      opponent?.wagerCurrency || matchCurrency
    }`;
  }

  match.players.forEach((player) => {
    const item = document.createElement("li");

    const tagLine = document.createElement("div");
    tagLine.className = "player-tag";
    const isYou = currentUser && player.userId === currentUser.id;
    tagLine.textContent = isYou ? `${player.tag} (You)` : player.tag;

    const profileLine = document.createElement("div");
    profileLine.className = "player-meta";
    if (player.profile?.name) {
      profileLine.textContent = `${player.profile.name} · ${
        player.profile.trophies ?? 0
      } trophies`;
    } else {
      profileLine.textContent = "Profile not loaded";
    }

    const linkLine = document.createElement("div");
    if (player.friendLink) {
      const trimmed = player.friendLink.trim();
      const isUrl = /^https?:\/\//i.test(trimmed);
      if (isUrl) {
        const link = document.createElement("a");
        link.className = "player-link";
        link.href = trimmed;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Open friend link";
        linkLine.appendChild(link);
      } else {
        linkLine.className = "player-link";
        linkLine.textContent = trimmed;
      }
    } else {
      linkLine.className = "player-link missing";
      linkLine.textContent = "Friend link not available.";
    }

    item.appendChild(tagLine);
    item.appendChild(profileLine);
    item.appendChild(linkLine);
    const wagerLine = document.createElement("div");
    wagerLine.className = "player-wager";
    const currency = player.wagerCurrency || "coins";
    wagerLine.textContent = `Wager: ${player.wager ?? 0} ${currency}`;
    item.appendChild(wagerLine);
    matchPlayersEl.appendChild(item);
  });

  trackBattleBtn.disabled = false;
  applyMatchLock(match.lockUntil);
  startLockCountdown(match.lockUntil);
}

function getOpponentTag(match) {
  if (!match || !currentUser) return "your opponent";
  const opponent = match.players.find(
    (player) => player.userId !== currentUser.id
  );
  return opponent?.tag || "your opponent";
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

function startPolling() {
  stopPolling();
  pollTimer = setInterval(checkQueueStatus, 5000);
}

function stopQueuePolling() {
  if (queueTimer) {
    clearInterval(queueTimer);
    queueTimer = null;
  }
}

function startQueuePolling() {
  stopQueuePolling();
  refreshQueueList();
  queueTimer = setInterval(refreshQueueList, 6000);
}

async function refreshQueueList() {
  if (!currentUser) return;
  try {
    const data = await apiRequest("/api/queue/list", { method: "GET" });
    renderQueueList(data.entries || []);
    if (currentTicketId) {
      const waitingText = `${(data.entries || []).length} waiting`;
      queueCountEl.textContent = waitingText;
    }
  } catch (err) {
    // Quietly ignore queue list errors.
  }
}

function renderQueueList(entries) {
  if (!queueListEl || !queueCountEl || !queueEmptyEl) return;
  queueListEl.innerHTML = "";
  if (!entries.length) {
    queueCountEl.textContent = "0 waiting";
    queueEmptyEl.classList.remove("hidden");
    return;
  }
  queueEmptyEl.classList.add("hidden");
  queueCountEl.textContent = `${entries.length} waiting`;

  entries.forEach((entry) => {
    const card = document.createElement("div");
    card.className = `queue-card${entry.isYou ? " you" : ""}`;
    const left = document.createElement("div");
    left.className = "queue-info";
    const tag = document.createElement("span");
    tag.className = "queue-tag";
    tag.textContent = entry.isYou ? `${entry.tag} (You)` : entry.tag;
    const meta = document.createElement("div");
    meta.className = "queue-meta";
    if (entry.profile?.name) {
      meta.textContent = `${entry.profile.name} · ${
        entry.profile.trophies ?? 0
      } trophies`;
    } else {
      meta.textContent = "Profile loading...";
    }
    left.appendChild(tag);
    left.appendChild(meta);

    const wager = document.createElement("span");
    wager.className = "queue-wager";
    const currency = entry.currency || "coins";
    wager.textContent = `Wager: ${entry.wager ?? 0} ${currency}`;

    card.appendChild(left);
    card.appendChild(wager);
    queueListEl.appendChild(card);
  });

  if (currentTicketId && !entries.some((entry) => entry.isYou)) {
    const placeholder = document.createElement("div");
    placeholder.className = "queue-card you";
    const left = document.createElement("div");
    left.className = "queue-info";
    const tag = document.createElement("span");
    tag.className = "queue-tag";
    tag.textContent = currentUser?.tag ? `${currentUser.tag} (You)` : "You";
    const meta = document.createElement("div");
    meta.className = "queue-meta";
    if (currentUser?.playerProfile?.name) {
      meta.textContent = `${currentUser.playerProfile.name} · ${
        currentUser.playerProfile.trophies ?? 0
      } trophies`;
    } else {
      meta.textContent = "Profile loading...";
    }
    left.appendChild(tag);
    left.appendChild(meta);

    const wager = document.createElement("span");
    wager.className = "queue-wager";
    wager.textContent = `Wager: ${Number(wagerInput?.value || 0)} ${
      selectedCurrency || "coins"
    }`;

    placeholder.appendChild(left);
    placeholder.appendChild(wager);
    queueListEl.prepend(placeholder);
    const count = entries.length + 1;
    queueCountEl.textContent = `${count} waiting`;
  }
}

async function joinQueue() {
  if (!currentUser) {
    showStatus("Log in first.", true);
    return;
  }

  if (!currentUser.isVerified) {
    showStatus("Verify your account before joining the queue.", true);
    return;
  }

  if (!currentUser.tag || !currentUser.friendLink) {
    showStatus("Add your tag and friend link in your profile first.", true);
    return;
  }

  const wagerValue = Number(wagerInput.value);
  if (!Number.isFinite(wagerValue) || wagerValue < 0) {
    showStatus("Enter a valid wager amount.", true);
    return;
  }
  const wager = Math.floor(wagerValue);
  const availableCoins = currentUser.coins ?? currentUser.credits ?? 0;
  const availableGems = currentUser.gems ?? 0;
  const availableBalance =
    selectedCurrency === "gems" ? availableGems : availableCoins;
  if (wager > availableBalance) {
    showStatus(`You don't have enough ${selectedCurrency} for that wager.`, true);
    return;
  }

  setWaitingState(true);
  resetMatch();
  clearResults();
  showStatus("Joining the queue...");

  try {
    const data = await apiRequest("/api/queue/join", {
      method: "POST",
      body: JSON.stringify({ wager, currency: selectedCurrency }),
    });

    currentTicketId = data.ticketId;
    refreshQueueList();
    if (queueCountEl && currentTicketId) {
      const current = queueCountEl.textContent || "0 waiting";
      const match = current.match(/^(\\d+)/);
      const count = match ? Number(match[1]) : 0;
      queueCountEl.textContent = `${count + 1} waiting`;
    }

    if (data.status === "matched") {
      renderMatch(data.match);
      showStatus(`Matched with ${getOpponentTag(data.match)}.`);
      setActiveSection("match");
      setWaitingState(false);
      stopPolling();
      refreshQueueList();
      return;
    }

    showStatus("Waiting for another player to join...");
    startPolling();
  } catch (err) {
    setWaitingState(false);
    if (err.status === 401) {
      setAuthState(null);
    }
    showStatus(err.message, true);
  }
}

async function cancelQueue() {
  if (!currentTicketId) {
    showStatus("You're not in the queue.", true);
    return;
  }

  try {
    await apiRequest("/api/queue/cancel", { method: "POST" });
    currentTicketId = null;
    stopPolling();
    setWaitingState(false);
    showStatus("Left the queue.");
    refreshQueueList();
  } catch (err) {
    showStatus(err.message, true);
  }
}

async function manualRefreshQueue() {
  await refreshQueueList();
}

async function checkQueueStatus() {
  if (!currentTicketId) return;

  try {
    const data = await apiRequest(
      `/api/queue/status/${encodeURIComponent(currentTicketId)}`,
      { method: "GET" }
    );

    if (data.status === "matched") {
      renderMatch(data.match);
      showStatus(`Matched with ${getOpponentTag(data.match)}.`);
      setActiveSection("match");
      setWaitingState(false);
      stopPolling();
      return;
    }

    showStatus("Still waiting for another player...");
  } catch (err) {
    stopPolling();
    setWaitingState(false);
    showStatus(err.message, true);
  }
}

async function trackFriendlyBattle() {
  if (!currentMatchId) {
    showStatus("Join the queue and get matched first.", true);
    return;
  }

  showStatus("Checking for a friendly battle...");
  clearResults();

  try {
    const data = await apiRequest(
      `/api/matches/${encodeURIComponent(currentMatchId)}/track`,
      { method: "GET" }
    );

    if (!data.battle) {
      showStatus(data.message || "No friendly battle found yet.");
      return;
    }

    showStatus("Friendly battle found.");
    resultsEl.appendChild(renderBattle(data.battle, data.referenceTag));
    setActiveSection("results");
    refreshProfile();
  } catch (err) {
    showStatus(err.message, true);
  }
}

menuButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.disabled) return;
    const section = button.dataset.section;
    if (!section) return;
    if (!currentUser && section !== "auth") {
      showStatus("Log in to access that section.", true);
      setActiveSection("auth");
      return;
    }
    setActiveSection(section);
  });
});

joinQueueBtn.addEventListener("click", joinQueue);
trackBattleBtn.addEventListener("click", trackFriendlyBattle);
if (refreshQueueBtn) refreshQueueBtn.addEventListener("click", manualRefreshQueue);
if (cancelQueueBtn) cancelQueueBtn.addEventListener("click", cancelQueue);
if (verifyButton) verifyButton.addEventListener("click", verifyAccount);
if (storeClaimBtn) storeClaimBtn.addEventListener("click", claimDailyReward);
if (wagerInput) {
  wagerInput.addEventListener("input", (event) => {
    updatePresetActive(event.target.value);
  });
}
if (wagerPresetButtons.length && wagerInput) {
  wagerPresetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const value = Number(button.dataset.wager);
      if (!Number.isFinite(value)) return;
      wagerInput.value = value;
      updatePresetActive(value);
    });
  });
}
if (currencyButtons.length) {
  currencyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const currency = button.dataset.currency;
      if (!currency) return;
      setCurrency(currency);
    });
  });
}

setActiveSection("auth");
setCurrency(selectedCurrency);
loadSession();
