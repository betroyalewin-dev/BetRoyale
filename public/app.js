const authPanel = document.getElementById("auth-panel");
const profilePanel = document.getElementById("profile-panel");
const queuePanel = document.getElementById("queue-panel");
const shopPanel = document.getElementById("shop-panel");
const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");
const logoutBtn = document.getElementById("logout");
const profileForm = document.getElementById("profile-form");

const registerUsername = document.getElementById("register-username");
const registerEmail = document.getElementById("register-email");
const registerPassword = document.getElementById("register-password");
const registerMessage = document.getElementById("register-message");
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const loginMessage = document.getElementById("login-message");

const profileEmail = document.getElementById("profile-email");
const profileUsername = document.getElementById("profile-username");
const profileTag = document.getElementById("profile-tag");
const profileLink = document.getElementById("profile-link");
const profileNotice = document.getElementById("profile-notice");
const profileHelp = document.getElementById("profile-help");
const profileName = document.getElementById("profile-name");
const profileTrophies = document.getElementById("profile-trophies");
const profileBestTrophies = document.getElementById("profile-best-trophies");
const profileKingLevel = document.getElementById("profile-king-level");
const profileHighestLeague = document.getElementById("profile-highest-league");
const profileUcMedalsRow = document.getElementById("profile-uc-medals-row");
const profileUcMedals = document.getElementById("profile-uc-medals");
const verifyPanel = document.getElementById("verify-panel");
const verifyStatus = document.getElementById("verify-status");
const verifyCodeInput = document.getElementById("verify-code");
const verifyButton = document.getElementById("verify-button");
const verifyResendButton = document.getElementById("verify-resend");
const verifyDisplay = document.getElementById("verify-display");

const statMatches = document.getElementById("stat-matches");
const statCoins = document.getElementById("stat-coins");
const statGems = document.getElementById("stat-gems");
const statWins = document.getElementById("stat-wins");
const statLosses = document.getElementById("stat-losses");
const statDraws = document.getElementById("stat-draws");
const balanceCoins = document.getElementById("balance-coins");
const balanceGems = document.getElementById("balance-gems");
const shopMessageEl = document.getElementById("shop-message");
const shopCoinsEl = document.getElementById("shop-coins");
const shopGemsEl = document.getElementById("shop-gems");
const shopAmountInput = document.getElementById("shop-amount");
const shopCheckoutBtn = document.getElementById("shop-checkout");
const shopGemsPreview = document.getElementById("shop-gems-preview");
const shopAmountChips = Array.from(document.querySelectorAll(".shop-amount-chip"));
const shopMobileAmount = document.getElementById("shop-mobile-amount");
const shopMobileGemsPreview = document.getElementById("shop-mobile-gems-preview");
const shopOpenKeypadBtn = document.getElementById("shop-open-keypad");
const mobileDepositSheet = document.getElementById("mobile-deposit-sheet");
const mobileDepositCloseBtn = document.getElementById("mobile-deposit-close");
const mobileDepositAmountEl = document.getElementById("mobile-deposit-amount");
const mobileDepositGemsEl = document.getElementById("mobile-deposit-gems");
const mobileWalletCoinsEl = document.getElementById("mobile-wallet-coins");
const mobileWalletGemsEl = document.getElementById("mobile-wallet-gems");
const mobileDepositPayBtn = document.getElementById("mobile-deposit-pay");
const mobileKeypadMessageEl = document.getElementById("mobile-keypad-message");
const mobileKeypadKeys = Array.from(document.querySelectorAll(".keypad-key"));
const mobileAmountChips = Array.from(document.querySelectorAll(".mobile-chip"));
const onboardingModal = document.getElementById("onboarding-modal");
const onboardingStepTitleEl = document.getElementById("onboarding-step-title");
const onboardingStepBodyEl = document.getElementById("onboarding-step-body");
const onboardingProgressLabelEl = document.getElementById("onboarding-progress-label");
const onboardingProgressFillEl = document.getElementById("onboarding-progress-fill");
const onboardingBackBtn = document.getElementById("onboarding-back");
const onboardingNextBtn = document.getElementById("onboarding-next");
const onboardingSkipBtn = document.getElementById("onboarding-skip");
const cashoutAmountInput = document.getElementById("cashout-amount");
const cashoutGemsPreview = document.getElementById("cashout-gems-preview");
const cashoutUsdPreview = document.getElementById("cashout-usd-preview");
const cashoutStatusEl = document.getElementById("cashout-status");
const cashoutMessageEl = document.getElementById("cashout-message");
const cashoutConnectBtn = document.getElementById("cashout-connect");
const cashoutSubmitBtn = document.getElementById("cashout-submit");
const cashoutHistoryEl = document.getElementById("cashout-history");
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
const matchEmptyEl = document.getElementById("match-empty");
const matchGoQueueBtn = document.getElementById("match-go-queue");
const matchTransitionEl = document.getElementById("match-transition");
const matchTransitionTitleEl = document.getElementById("match-transition-title");
const matchTransitionSubtitleEl = document.getElementById(
  "match-transition-subtitle"
);
const menuButtons = Array.from(document.querySelectorAll(".menu-button"));
const heroSection = document.querySelector(".hero");
const helpButton = document.getElementById("help-button");
const profileDisplayName = document.getElementById("profile-display-name");
const queueEmptyJoinBtn = document.getElementById("queue-empty-join");
const wagerPresetButtons = Array.from(
  document.querySelectorAll(".preset-button")
);
const currencyButtons = Array.from(
  document.querySelectorAll(".currency-button")
);

const sectionPanels = {
  auth: authPanel,
  profile: profilePanel,
  shop: shopPanel,
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
const MIN_SHOP_CENTS = 1000;
const MIN_CASHOUT_CENTS = 1000;
const MAX_CASHOUT_CENTS = 100000;
let cashoutReady = false;
let mobileDepositValue = (MIN_SHOP_CENTS / 100).toFixed(2);
let onboardingStepIndex = 0;
let onboardingUserId = null;

const ONBOARDING_STEPS = [
  {
    title: "Verify your email",
    body: "Check your inbox for a verification code and enter it on the Profile page. This keeps your account secure.",
  },
  {
    title: "Set up your profile",
    body: "Go to Profile and enter your Clash Royale player tag and friend link. Opponents need your friend link to send you a friendly battle.",
  },
  {
    title: "Deposit money for gems",
    body: "Head to the Shop and deposit USD. Every cent becomes one gem you can wager in real matches.",
  },
  {
    title: "Win Clash Royale duels",
    body: "Join the Queue, set your wager, and get matched. Play a friendly battle in Clash Royale — the winner takes the pot.",
  },
  {
    title: "Cash out your winnings",
    body: "Back in the Shop, convert your gems to USD and cash out through your connected Stripe payout account.",
  },
];

function updatePresetActive(value) {
  const numeric = Number(value);
  wagerPresetButtons.forEach((button) => {
    const preset = Number(button.dataset.wager);
    const isActive = Number.isFinite(numeric) && numeric === preset;
    button.classList.toggle("active", isActive);
  });
}

function formatProfileStat(value) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number" && !Number.isFinite(value)) return "—";
  const text = String(value).trim();
  return text ? text : "—";
}

function getOnboardingStorageKey(userId) {
  return `betroyale_onboarding_seen_${userId}`;
}

function hasSeenOnboarding(userId) {
  if (!userId) return false;
  try {
    return localStorage.getItem(getOnboardingStorageKey(userId)) === "1";
  } catch (err) {
    return false;
  }
}

function markOnboardingSeen(userId) {
  if (!userId) return;
  try {
    localStorage.setItem(getOnboardingStorageKey(userId), "1");
  } catch (err) {
    // Ignore storage limitations.
  }
}

function renderOnboardingStep() {
  const step = ONBOARDING_STEPS[onboardingStepIndex];
  if (!step) return;
  if (onboardingStepTitleEl) onboardingStepTitleEl.textContent = step.title;
  if (onboardingStepBodyEl) onboardingStepBodyEl.textContent = step.body;
  if (onboardingProgressLabelEl) {
    onboardingProgressLabelEl.textContent = `Step ${
      onboardingStepIndex + 1
    } of ${ONBOARDING_STEPS.length}`;
  }
  if (onboardingProgressFillEl) {
    const progress = ((onboardingStepIndex + 1) / ONBOARDING_STEPS.length) * 100;
    onboardingProgressFillEl.style.width = `${progress}%`;
  }
  if (onboardingBackBtn) {
    onboardingBackBtn.disabled = onboardingStepIndex === 0;
  }
  if (onboardingNextBtn) {
    onboardingNextBtn.textContent =
      onboardingStepIndex === ONBOARDING_STEPS.length - 1 ? "Finish" : "Next";
  }
}

function openOnboarding(userId, force = false) {
  if (!onboardingModal || !userId) return;
  if (!force && hasSeenOnboarding(userId)) return;
  onboardingUserId = userId;
  onboardingStepIndex = 0;
  renderOnboardingStep();
  onboardingModal.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeOnboarding(markSeen = true) {
  if (!onboardingModal) return;
  onboardingModal.classList.add("hidden");
  document.body.classList.remove("modal-open");
  if (markSeen) {
    markOnboardingSeen(onboardingUserId);
  }
  onboardingUserId = null;
}

function isMobileViewport() {
  return window.matchMedia("(max-width: 900px)").matches;
}

function centsToAmountString(cents) {
  const safe = Math.max(0, Math.floor(Number(cents) || 0));
  return (safe / 100).toFixed(2);
}

function sanitizeAmountString(raw) {
  let value = String(raw || "").replace(/[^\d.]/g, "");
  const dotIndex = value.indexOf(".");
  if (dotIndex >= 0) {
    const before = value.slice(0, dotIndex + 1);
    const after = value.slice(dotIndex + 1).replace(/\./g, "");
    value = `${before}${after}`;
  }
  if (value.startsWith(".")) value = `0${value}`;
  if (!value) return "0";

  let [whole, decimals = ""] = value.split(".");
  whole = whole.replace(/^0+(?=\d)/, "");
  if (!whole) whole = "0";
  if (whole.length > 5) {
    whole = whole.slice(0, 5);
  }
  if (decimals.length > 2) {
    decimals = decimals.slice(0, 2);
  }
  return value.includes(".") ? `${whole}.${decimals}` : whole;
}

function updateMobileChipActive(cents) {
  if (!mobileAmountChips.length) return;
  mobileAmountChips.forEach((chip) => {
    chip.classList.toggle("active", Number(chip.dataset.cents) === cents);
  });
}

function syncDepositDisplays(cents) {
  const safeCents = Math.max(0, Math.floor(Number(cents) || 0));
  const amountText = centsToAmountString(safeCents);
  if (shopGemsPreview) shopGemsPreview.textContent = String(safeCents);
  if (shopMobileAmount) shopMobileAmount.textContent = amountText;
  if (shopMobileGemsPreview) shopMobileGemsPreview.textContent = String(safeCents);
  if (mobileDepositAmountEl) mobileDepositAmountEl.textContent = amountText;
  if (mobileDepositGemsEl) mobileDepositGemsEl.textContent = String(safeCents);
  updateMobileChipActive(safeCents);
}

function updateMobileKeypadValidation(cents) {
  if (!mobileKeypadMessageEl) return;
  if (cents < MIN_SHOP_CENTS) {
    mobileKeypadMessageEl.textContent = "Minimum deposit is $10.00.";
    mobileKeypadMessageEl.classList.add("error");
  } else {
    mobileKeypadMessageEl.textContent = "1¢ = 1 gem. Continue to secure checkout.";
    mobileKeypadMessageEl.classList.remove("error");
  }
  if (mobileDepositPayBtn) {
    mobileDepositPayBtn.disabled = cents < MIN_SHOP_CENTS;
  }
}

function setMobileDepositValue(nextValue) {
  mobileDepositValue = sanitizeAmountString(nextValue);
  const cents = parseAmountToCents(mobileDepositValue) || 0;
  if (shopAmountInput) {
    shopAmountInput.value = cents > 0 ? centsToAmountString(cents) : "";
  }
  syncDepositDisplays(cents);
  updateMobileKeypadValidation(cents);
}

function openMobileDepositSheet() {
  if (!mobileDepositSheet || !isMobileViewport()) return;
  if (shopMessageEl) shopMessageEl.textContent = "";
  const initialCents = parseAmountToCents(shopAmountInput?.value) || MIN_SHOP_CENTS;
  mobileDepositValue = centsToAmountString(initialCents);
  setMobileDepositValue(mobileDepositValue);
  mobileDepositSheet.classList.add("active");
  mobileDepositSheet.setAttribute("aria-hidden", "false");
  document.body.classList.add("mobile-sheet-open");
}

function closeMobileDepositSheet() {
  if (!mobileDepositSheet) return;
  mobileDepositSheet.classList.remove("active");
  mobileDepositSheet.setAttribute("aria-hidden", "true");
  document.body.classList.remove("mobile-sheet-open");
}

function handleMobileKeyInput(key) {
  let nextValue = mobileDepositValue;
  if (key === "back") {
    nextValue = nextValue.slice(0, -1);
  } else if (key === ".") {
    if (!nextValue.includes(".")) nextValue = `${nextValue}.`;
  } else {
    nextValue = nextValue === "0" ? String(key) : `${nextValue}${key}`;
  }
  if (!nextValue) nextValue = "0";
  setMobileDepositValue(nextValue);
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
  if (!currentUser && target !== "auth") {
    setActiveSection("auth");
    return;
  }
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
  if (target === "match" && !currentMatchId) {
    resetMatch();
  }
  if (target === "shop") {
    refreshShop();
    return;
  }
  if (target === "results" && currentUser) {
    loadResultsHistory();
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
      button.classList.remove("hidden");
    } else {
      const disable = section !== "auth";
      button.disabled = disable;
      button.classList.toggle("disabled", disable);
      if (section === "shop") {
        button.classList.add("hidden");
      }
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
  statusEl.classList.remove("auto-dismiss");

  if (message && !isError) {
    // Force reflow so the animation restarts if called rapidly
    void statusEl.offsetWidth;
    statusEl.classList.add("auto-dismiss");
  }
}

function setFormMessage(target, message, isError = false) {
  if (!target) return;
  target.textContent = message || "";
  target.classList.toggle("hidden", !message);
  target.classList.toggle("error", Boolean(isError && message));
}

function setProfileNotice(html, isError = false) {
  if (!profileNotice) return;
  profileNotice.innerHTML = html || "";
  profileNotice.classList.toggle("hidden", !html);
  profileNotice.classList.toggle("error", Boolean(isError && html));
}

function updateProfileHighlights(user) {
  if (!profileTag || !profileLink) return;
  const needsTag = !user?.tag;
  const needsLink = !user?.friendLink;
  profileTag.classList.toggle("highlight-field", needsTag);
  profileLink.classList.toggle("highlight-field", needsLink);
}

function clearResults() {
  resultsEl.innerHTML = "";
}

async function loadResultsHistory() {
  if (!currentUser) return;
  if (!currentUser.tag) {
    clearResults();
    showStatus("Add your player tag in Profile to load your match history.", true);
    return;
  }

  clearResults();
  showStatus("Loading BetRoyale match history...");

  try {
    const data = await apiRequest("/api/results?limit=250", { method: "GET" });
    const battles = Array.isArray(data.battles) ? data.battles : [];
    if (!battles.length) {
      showStatus("No completed BetRoyale matches yet.");
      return;
    }

    battles.forEach((battle) => {
      resultsEl.appendChild(renderBattle(battle, data.referenceTag || currentUser.tag));
    });
    showStatus(`Loaded ${battles.length} BetRoyale matches.`);
  } catch (err) {
    showStatus(err.message || "Unable to load match history.", true);
  }
}

function setAuthState(user) {
  currentUser = user;

  if (user) {
    updateProfileUI(user);
    startQueuePolling();
    refreshShop();
  } else {
    if (profileDisplayName) profileDisplayName.textContent = "—";
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
    if (profileTrophies) profileTrophies.textContent = "—";
    if (profileBestTrophies) profileBestTrophies.textContent = "—";
    if (profileKingLevel) profileKingLevel.textContent = "—";
    if (profileHighestLeague) profileHighestLeague.textContent = "—";
    if (profileUcMedals) profileUcMedals.textContent = "—";
    if (profileUcMedalsRow) profileUcMedalsRow.classList.add("hidden");
    if (verifyStatus) {
      verifyStatus.textContent = "Unverified";
      verifyStatus.classList.remove("verified");
    }
    if (verifyPanel) verifyPanel.classList.add("hidden");
    if (verifyDisplay) verifyDisplay.classList.add("hidden");
    if (profileNotice) profileNotice.classList.add("hidden");
    if (profileNotice) profileNotice.textContent = "";
    if (queueListEl) queueListEl.innerHTML = "";
    if (queueCountEl) queueCountEl.textContent = "0 waiting";
    if (queueEmptyEl) queueEmptyEl.classList.remove("hidden");
    if (balanceCoins) balanceCoins.textContent = "0";
    if (balanceGems) balanceGems.textContent = "0";
    if (shopCoinsEl) shopCoinsEl.textContent = "0";
    if (shopGemsEl) shopGemsEl.textContent = "0";
    if (mobileWalletCoinsEl) mobileWalletCoinsEl.textContent = "0";
    if (mobileWalletGemsEl) mobileWalletGemsEl.textContent = "0";
    if (shopMessageEl) shopMessageEl.textContent = "";
    if (shopAmountInput) shopAmountInput.value = "";
    if (shopGemsPreview) shopGemsPreview.textContent = "0";
    if (shopMobileAmount) shopMobileAmount.textContent = "10.00";
    if (shopMobileGemsPreview) shopMobileGemsPreview.textContent = "1000";
    if (mobileDepositAmountEl) mobileDepositAmountEl.textContent = "10.00";
    if (mobileDepositGemsEl) mobileDepositGemsEl.textContent = "1000";
    if (mobileKeypadMessageEl) {
      mobileKeypadMessageEl.textContent = "Minimum deposit: $10.00.";
      mobileKeypadMessageEl.classList.remove("error");
    }
    closeMobileDepositSheet();
    if (cashoutAmountInput) cashoutAmountInput.value = "";
    if (cashoutGemsPreview) cashoutGemsPreview.textContent = "0";
    if (cashoutUsdPreview) cashoutUsdPreview.textContent = "0.00";
    if (cashoutStatusEl) {
      cashoutStatusEl.textContent = "Connect your Stripe payout account to enable cash outs.";
      cashoutStatusEl.classList.remove("ready");
    }
    if (cashoutMessageEl) cashoutMessageEl.textContent = "";
    if (cashoutHistoryEl) {
      cashoutHistoryEl.innerHTML = "";
      cashoutHistoryEl.classList.add("hidden");
    }
    cashoutReady = false;
    if (shopPanel) shopPanel.classList.add("hidden");
    stopQueuePolling();
    closeOnboarding(false);
  }

  updateMenuState(user);
}

function updateProfileUI(user) {
  if (profileDisplayName) {
    profileDisplayName.textContent = user.username || user.email || "—";
  }
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
  if (shopCoinsEl) shopCoinsEl.textContent = coins;
  if (shopGemsEl) shopGemsEl.textContent = user.gems ?? 0;
  if (mobileWalletCoinsEl) mobileWalletCoinsEl.textContent = coins;
  if (mobileWalletGemsEl) mobileWalletGemsEl.textContent = user.gems ?? 0;
  statWins.textContent = stats.wins || 0;
  statLosses.textContent = stats.losses || 0;
  statDraws.textContent = stats.draws || 0;
  const playerProfile = user.playerProfile || null;
  if (profileName) {
    profileName.textContent = formatProfileStat(playerProfile?.name);
  }
  if (profileTrophies) {
    profileTrophies.textContent = formatProfileStat(playerProfile?.trophies);
  }
  if (profileBestTrophies) {
    profileBestTrophies.textContent = formatProfileStat(playerProfile?.bestTrophies);
  }
  if (profileKingLevel) {
    profileKingLevel.textContent = formatProfileStat(playerProfile?.expLevel);
  }
  if (profileHighestLeague) {
    if (playerProfile) {
      profileHighestLeague.textContent = formatProfileStat(
        playerProfile.highestLeagueName || "Unranked"
      );
    } else {
      profileHighestLeague.textContent = "—";
    }
  }
  const medals = Number(playerProfile?.ultimateChampionMedals || 0);
  if (profileUcMedalsRow) {
    profileUcMedalsRow.classList.toggle("hidden", medals <= 0);
  }
  if (profileUcMedals) {
    profileUcMedals.textContent = medals > 0 ? String(medals) : "—";
  }
  if (verifyStatus) {
    verifyStatus.textContent = user.isVerified ? "Verified" : "Unverified";
    verifyStatus.classList.toggle("verified", user.isVerified);
  }
  if (verifyPanel) {
    verifyPanel.classList.toggle("hidden", user.isVerified);
  }
  updateShopPreview();
  updateProfileHighlights(user);
  updateProfileHelp(user);
}

function parseAmountToCents(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return null;
  const cents = Math.round(amount * 100);
  if (cents <= 0) return null;
  return cents;
}

function updateShopPreview() {
  const cents = parseAmountToCents(shopAmountInput?.value);
  const safeCents = cents && cents > 0 ? cents : 0;
  syncDepositDisplays(safeCents);
  if (safeCents > 0) {
    mobileDepositValue = centsToAmountString(safeCents);
  }
  updateMobileKeypadValidation(safeCents);
}

function updateCashoutPreview() {
  const cents = parseAmountToCents(cashoutAmountInput?.value);
  const safeCents = cents && cents > 0 ? cents : 0;
  if (cashoutGemsPreview) cashoutGemsPreview.textContent = String(safeCents);
  if (cashoutUsdPreview) cashoutUsdPreview.textContent = (safeCents / 100).toFixed(2);
}

function formatUsd(amountCents) {
  const numeric = Number(amountCents) || 0;
  return `$${(numeric / 100).toFixed(2)}`;
}

function renderCashoutHistory(entries) {
  if (!cashoutHistoryEl) return;
  cashoutHistoryEl.innerHTML = "";
  if (!Array.isArray(entries) || entries.length === 0) {
    cashoutHistoryEl.classList.add("hidden");
    return;
  }
  cashoutHistoryEl.classList.remove("hidden");
  const title = document.createElement("p");
  title.className = "cashout-history-title";
  title.textContent = "Recent cash outs";
  cashoutHistoryEl.appendChild(title);

  entries.forEach((entry) => {
    const row = document.createElement("div");
    row.className = "cashout-history-item";
    const amount = document.createElement("span");
    amount.textContent = `${formatUsd(entry.amountCents)} (${entry.gems} gems)`;
    const status = document.createElement("span");
    status.textContent = (entry.status || "pending").toUpperCase();
    row.appendChild(amount);
    row.appendChild(status);
    cashoutHistoryEl.appendChild(row);

    const meta = document.createElement("p");
    meta.className = "cashout-history-meta";
    const date = entry.createdAt ? new Date(entry.createdAt).toLocaleString() : "Unknown time";
    meta.textContent = `${date}${entry.error ? ` - ${entry.error}` : ""}`;
    cashoutHistoryEl.appendChild(meta);
  });
}

async function refreshCashoutStatus() {
  if (!currentUser) return;
  if (cashoutMessageEl) cashoutMessageEl.textContent = "";
  if (!cashoutStatusEl) return;

  try {
    const data = await apiRequest("/api/shop/cashout/status", { method: "GET" });
    cashoutReady = Boolean(data.ready);
    const enabled = Boolean(data.enabled);
    if (!enabled) {
      cashoutStatusEl.textContent =
        "Cash out is unavailable because Stripe is not configured.";
      cashoutStatusEl.classList.remove("ready");
      if (cashoutConnectBtn) cashoutConnectBtn.disabled = true;
      if (cashoutSubmitBtn) cashoutSubmitBtn.disabled = true;
      renderCashoutHistory([]);
      return;
    }

    if (!data.connected) {
      cashoutStatusEl.textContent = "Connect your Stripe payout account to enable cash outs.";
      cashoutStatusEl.classList.remove("ready");
      if (cashoutConnectBtn) cashoutConnectBtn.disabled = false;
      if (cashoutSubmitBtn) cashoutSubmitBtn.disabled = true;
    } else if (!data.ready) {
      cashoutStatusEl.textContent =
        "Finish Stripe onboarding to enable cash outs.";
      cashoutStatusEl.classList.remove("ready");
      if (cashoutConnectBtn) cashoutConnectBtn.disabled = false;
      if (cashoutSubmitBtn) cashoutSubmitBtn.disabled = true;
    } else {
      cashoutStatusEl.textContent = "Payout account connected. You can cash out now.";
      cashoutStatusEl.classList.add("ready");
      if (cashoutConnectBtn) cashoutConnectBtn.disabled = false;
      if (cashoutSubmitBtn) cashoutSubmitBtn.disabled = false;
    }

    renderCashoutHistory(data.recentCashouts || []);
  } catch (err) {
    cashoutStatusEl.textContent = err.message || "Unable to load cash out status.";
    cashoutStatusEl.classList.remove("ready");
    if (cashoutConnectBtn) cashoutConnectBtn.disabled = true;
    if (cashoutSubmitBtn) cashoutSubmitBtn.disabled = true;
    renderCashoutHistory([]);
  }
}

function refreshShop() {
  if (!currentUser) return;
  if (shopAmountInput && !String(shopAmountInput.value || "").trim()) {
    shopAmountInput.value = centsToAmountString(MIN_SHOP_CENTS);
  }
  updateShopPreview();
  updateCashoutPreview();
  refreshCashoutStatus();
  if (shopMessageEl) shopMessageEl.textContent = "";
}

function clearShopQueryParams() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has("shop") && !params.has("session_id")) return;
  params.delete("shop");
  params.delete("session_id");
  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${
    window.location.hash || ""
  }`;
  window.history.replaceState({}, "", nextUrl);
}

async function handleShopRedirectState() {
  const params = new URLSearchParams(window.location.search);
  const shopState = params.get("shop");
  if (!shopState) return;

  if (shopState === "cancel") {
    if (currentUser) {
      setActiveSection("shop");
      if (shopMessageEl) shopMessageEl.textContent = "Payment canceled.";
    }
    clearShopQueryParams();
    return;
  }

  if (shopState === "cashout-return" || shopState === "cashout-refresh") {
    if (currentUser) {
      setActiveSection("shop");
      await refreshCashoutStatus();
      if (cashoutMessageEl) {
        cashoutMessageEl.textContent =
          shopState === "cashout-return"
            ? "Payout account sync complete."
            : "Resume Stripe onboarding to enable payouts.";
      }
    }
    clearShopQueryParams();
    return;
  }

  if (shopState === "success") {
    const sessionId = String(params.get("session_id") || "").trim();
    if (!currentUser) {
      showStatus("Payment completed. Log in to sync your gems.", true);
      clearShopQueryParams();
      return;
    }
    setActiveSection("shop");
    if (!sessionId) {
      if (shopMessageEl) shopMessageEl.textContent = "Missing checkout session id.";
      clearShopQueryParams();
      return;
    }
    if (shopMessageEl) shopMessageEl.textContent = "Confirming payment...";
    try {
      const data = await apiRequest("/api/shop/confirm", {
        method: "POST",
        body: JSON.stringify({ sessionId }),
      });
      if (data?.user) {
        currentUser = data.user;
        updateProfileUI(currentUser);
      }
      if (shopMessageEl) {
        shopMessageEl.textContent =
          data?.message || "Payment confirmed and gems were updated.";
      }
    } catch (err) {
      if (shopMessageEl) shopMessageEl.textContent = err.message;
    }
    clearShopQueryParams();
  }
}

async function startCheckoutWithCents(cents) {
  if (!currentUser) {
    showStatus("Log in to purchase gems.", true);
    return;
  }
  if (!cents) {
    if (shopMessageEl) shopMessageEl.textContent = "Enter a valid USD amount.";
    updateMobileKeypadValidation(0);
    return;
  }
  if (cents < MIN_SHOP_CENTS) {
    if (shopMessageEl) {
      shopMessageEl.textContent = "Minimum deposit is $10.00.";
    }
    updateMobileKeypadValidation(cents);
    return;
  }
  if (mobileKeypadMessageEl) {
    mobileKeypadMessageEl.textContent = "Opening secure checkout...";
    mobileKeypadMessageEl.classList.remove("error");
  }
  if (shopMessageEl) shopMessageEl.textContent = "Opening secure checkout...";
  if (shopCheckoutBtn) shopCheckoutBtn.disabled = true;
  if (mobileDepositPayBtn) mobileDepositPayBtn.disabled = true;
  try {
    const data = await apiRequest("/api/shop/checkout", {
      method: "POST",
      body: JSON.stringify({ amountCents: cents }),
    });
    if (data?.url) {
      closeMobileDepositSheet();
      window.location.href = data.url;
      return;
    }
    if (shopMessageEl) {
      shopMessageEl.textContent = "Checkout link unavailable. Try again.";
    }
  } catch (err) {
    if (shopMessageEl) shopMessageEl.textContent = err.message;
    if (mobileKeypadMessageEl) {
      mobileKeypadMessageEl.textContent = err.message;
      mobileKeypadMessageEl.classList.add("error");
    }
  } finally {
    if (shopCheckoutBtn) shopCheckoutBtn.disabled = false;
    if (mobileDepositPayBtn) mobileDepositPayBtn.disabled = false;
  }
}

async function startCheckout() {
  if (!currentUser) {
    showStatus("Log in to purchase gems.", true);
    return;
  }
  if (isMobileViewport()) {
    openMobileDepositSheet();
    return;
  }
  const cents = parseAmountToCents(shopAmountInput?.value);
  await startCheckoutWithCents(cents);
}

async function startCashoutConnect() {
  if (!currentUser) {
    showStatus("Log in to cash out gems.", true);
    return;
  }
  if (cashoutMessageEl) {
    cashoutMessageEl.textContent = "Opening Stripe onboarding...";
  }
  if (cashoutConnectBtn) cashoutConnectBtn.disabled = true;
  try {
    const data = await apiRequest("/api/shop/cashout/connect", {
      method: "POST",
      body: JSON.stringify({}),
    });
    if (data?.url) {
      window.location.href = data.url;
      return;
    }
    if (cashoutMessageEl) {
      cashoutMessageEl.textContent = "Unable to open onboarding right now.";
    }
  } catch (err) {
    if (cashoutMessageEl) cashoutMessageEl.textContent = err.message;
  } finally {
    if (cashoutConnectBtn) cashoutConnectBtn.disabled = false;
  }
}

async function startCashout() {
  if (!currentUser) {
    showStatus("Log in to cash out gems.", true);
    return;
  }
  const cents = parseAmountToCents(cashoutAmountInput?.value);
  if (!cents) {
    if (cashoutMessageEl) cashoutMessageEl.textContent = "Enter a valid USD amount.";
    return;
  }
  if (cents < MIN_CASHOUT_CENTS || cents > MAX_CASHOUT_CENTS) {
    if (cashoutMessageEl) {
      cashoutMessageEl.textContent = `Cash out must be between ${formatUsd(
        MIN_CASHOUT_CENTS
      )} and ${formatUsd(MAX_CASHOUT_CENTS)}.`;
    }
    return;
  }
  if ((currentUser?.gems || 0) < cents) {
    if (cashoutMessageEl) cashoutMessageEl.textContent = "Not enough gems for that cash out.";
    return;
  }
  if (!cashoutReady) {
    if (cashoutMessageEl) {
      cashoutMessageEl.textContent = "Connect and finish Stripe payout onboarding first.";
    }
    return;
  }

  if (cashoutMessageEl) cashoutMessageEl.textContent = "Processing cash out...";
  if (cashoutSubmitBtn) cashoutSubmitBtn.disabled = true;
  try {
    const data = await apiRequest("/api/shop/cashout", {
      method: "POST",
      body: JSON.stringify({ amountCents: cents }),
    });
    if (data?.user) {
      currentUser = data.user;
      updateProfileUI(currentUser);
    }
    if (cashoutMessageEl) {
      cashoutMessageEl.textContent =
        data.message || "Cash out submitted. Check your payout account.";
    }
    if (cashoutAmountInput) cashoutAmountInput.value = "";
    updateCashoutPreview();
    await refreshCashoutStatus();
  } catch (err) {
    if (cashoutMessageEl) cashoutMessageEl.textContent = err.message;
  } finally {
    if (cashoutSubmitBtn) cashoutSubmitBtn.disabled = false;
  }
}

function updateProfileHelp(user) {
  if (!profileHelp) return;
  const needsProfile = !user?.tag || !user?.friendLink;
  profileHelp.classList.toggle("hidden", !needsProfile);
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    credentials: "include",
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
  await handleShopRedirectState();
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
  setFormMessage(registerMessage, "Creating account...");

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
    setFormMessage(registerMessage, "");
    showStatus("Account created. Verify your account below.");
    openOnboarding(data.user?.id);
    if (verifyDisplay && data.verificationCode) {
      verifyDisplay.textContent = `Verification code: ${data.verificationCode}`;
      verifyDisplay.classList.remove("hidden");
    }
    registerForm.reset();
    profileTag.focus();
  } catch (err) {
    setFormMessage(registerMessage, err.message, true);
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setFormMessage(loginMessage, "Logging in...");

  try {
    const data = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        identifier: loginEmail.value,
        password: loginPassword.value,
      }),
    });
    setAuthState(data.user);
    setFormMessage(loginMessage, "");
    if (!data.user?.isVerified) {
      showStatus("Logged in. Verify your account to unlock matchmaking.");
    } else if (!data.user?.tag || !data.user?.friendLink) {
      showStatus("Logged in. Add your player tag and friend link below.");
    } else {
      showStatus("Logged in. You can join the queue.");
    }
    loginForm.reset();
  } catch (err) {
    setFormMessage(loginMessage, err.message, true);
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
  setProfileNotice("Verifying account...");
  showStatus("");
  try {
    const data = await apiRequest("/api/auth/verify", {
      method: "POST",
      body: JSON.stringify({ code: verifyCodeInput.value }),
    });
    setAuthState(data.user);
    setProfileNotice(
      "<strong>Account Verified.</strong> Next, paste your Clash Royale player tag and friend link below to be able to join the queue!"
    );
    updateProfileHighlights(data.user);
    if (verifyDisplay) verifyDisplay.classList.add("hidden");
    verifyCodeInput.value = "";
  } catch (err) {
    setProfileNotice(err.message, true);
  }
}

async function resendVerificationCode() {
  showStatus("Sending a new verification code...");
  if (verifyDisplay) verifyDisplay.classList.add("hidden");
  try {
    const data = await apiRequest("/api/auth/resend", { method: "POST" });
    if (verifyDisplay) {
      if (data.verificationCode) {
        verifyDisplay.textContent = `Verification code: ${data.verificationCode}`;
      } else {
        verifyDisplay.textContent = "Verification code sent. Check your email.";
      }
      verifyDisplay.classList.remove("hidden");
    }
    showStatus("New verification code sent.");
  } catch (err) {
    showStatus(err.message, true);
    if (verifyDisplay) {
      verifyDisplay.textContent = err.message;
      verifyDisplay.classList.remove("hidden");
    }
  }
}

function parseBattleDate(battleTime) {
  if (!battleTime) return null;
  const native = new Date(battleTime);
  if (!Number.isNaN(native.getTime())) return native;

  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(?:\.(\d+))?Z?$/.exec(
    String(battleTime)
  );
  if (!match) return null;
  const [, year, month, day, hour, minute, second, ms = "0"] = match;
  const time = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
    Number(ms.slice(0, 3))
  );
  return new Date(time);
}

function formatBattleTime(battleTime) {
  const parsed = parseBattleDate(battleTime);
  if (!parsed) return "Unknown time";
  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatModeName(battle) {
  const raw = String(battle?.gameMode?.name || battle?.type || "Match");
  const trimmed = raw.trim();
  if (!trimmed) return "Match";
  const known = {
    friendly: "Friendly Battle",
    ranked1v1_newarena: "Ranked 1v1",
    ranked: "Ranked",
    ladder: "Ladder",
  };
  const normalized = trimmed.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (known[normalized]) return known[normalized];
  return trimmed
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function sumCrowns(players) {
  if (!Array.isArray(players)) return 0;
  return players.reduce((sum, player) => sum + (player.crowns || 0), 0);
}

function normalizeTagValue(tag) {
  if (!tag) return "";
  const cleaned = String(tag).trim().toUpperCase();
  if (!cleaned) return "";
  return cleaned.startsWith("#") ? cleaned : `#${cleaned}`;
}

function getPlayerNames(players) {
  if (!Array.isArray(players) || players.length === 0) return "Unknown";
  return players.map((p) => p.name).filter(Boolean).join(" + ");
}

function getCardNames(cards) {
  if (!Array.isArray(cards) || cards.length === 0) return [];
  return cards.map((card) => card.name).filter(Boolean);
}

function extractUrlFromText(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const match = raw.match(/https?:\/\/[^\s<>"']+/i);
  const candidate = match ? match[0] : raw;
  return candidate.replace(/[),.;!?]+$/, "");
}

function renderBattle(battle, perspectiveTag) {
  let team = battle.team || [];
  let opponent = battle.opponent || [];

  const normalizedPerspectiveTag = normalizeTagValue(perspectiveTag);
  if (normalizedPerspectiveTag) {
    const inTeam = team.some(
      (player) => normalizeTagValue(player?.tag) === normalizedPerspectiveTag
    );
    const inOpponent = opponent.some(
      (player) => normalizeTagValue(player?.tag) === normalizedPerspectiveTag
    );
    if (!inTeam && inOpponent) {
      [team, opponent] = [opponent, team];
    }
  }

  const teamCrowns =
    typeof battle.teamCrowns === "number" ? battle.teamCrowns : sumCrowns(team);
  const opponentCrowns =
    typeof battle.opponentCrowns === "number"
      ? battle.opponentCrowns
      : sumCrowns(opponent);

  const normalizedResult = String(battle.result || "").toLowerCase();
  let outcome = "Draw";
  if (normalizedResult === "win" || normalizedResult === "loss") {
    outcome = normalizedResult === "win" ? "Win" : "Loss";
  } else {
    if (teamCrowns > opponentCrowns) outcome = "Win";
    if (teamCrowns < opponentCrowns) outcome = "Loss";
  }

  const card = document.createElement("article");
  card.className = "card";

  const header = document.createElement("div");
  header.className = "card-header";

  const badge = document.createElement("span");
  badge.className = `badge${outcome === "Loss" ? " loss" : ""}`;
  const hasScore =
    Number.isFinite(teamCrowns) &&
    Number.isFinite(opponentCrowns) &&
    !(teamCrowns === 0 && opponentCrowns === 0 && !battle.battleTime);
  badge.textContent = hasScore
    ? `${outcome} - ${teamCrowns}-${opponentCrowns}`
    : outcome;

  const meta = document.createElement("div");
  meta.className = "meta";
  const mode = formatModeName(battle);
  meta.textContent = `${mode} - ${formatBattleTime(battle.battleTime)}`;

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

  if (battle.matchId) {
    const matchLine = document.createElement("div");
    matchLine.className = "meta";
    matchLine.textContent = `Match ID: ${battle.matchId}`;
    lineup.appendChild(matchLine);
  }

  const deck = getCardNames(team[0]?.cards);

  card.appendChild(header);
  card.appendChild(lineup);

  if (deck.length) {
    const cardsWrap = document.createElement("div");
    cardsWrap.className = "cards";
    cardsWrap.textContent = `Deck: ${deck.join(", ")}`;
    card.appendChild(cardsWrap);
  }

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
  if (matchIdEl) matchIdEl.textContent = "No active match";
  if (matchPlayersEl) matchPlayersEl.innerHTML = "";
  if (trackBattleBtn) trackBattleBtn.disabled = true;
  if (matchEmptyEl) matchEmptyEl.classList.remove("hidden");
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
  if (matchSection) matchSection.classList.remove("hidden");
  if (matchEmptyEl) matchEmptyEl.classList.add("hidden");
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
      const trimmed = extractUrlFromText(player.friendLink);
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

function showMatchTransition(title, subtitle) {
  if (!matchTransitionEl) return Promise.resolve();
  if (matchTransitionTitleEl) {
    matchTransitionTitleEl.textContent = title || "Match Found";
  }
  if (matchTransitionSubtitleEl) {
    matchTransitionSubtitleEl.textContent = subtitle || "Taking you to your 1v1...";
  }
  matchTransitionEl.classList.remove("hidden");
  matchTransitionEl.classList.add("active");
  return new Promise((resolve) => {
    setTimeout(() => {
      matchTransitionEl.classList.remove("active");
      matchTransitionEl.classList.add("hidden");
      resolve();
    }, 1200);
  });
}

async function moveToMatch(match, transitionTitle, transitionSubtitle) {
  renderMatch(match);
  await showMatchTransition(transitionTitle, transitionSubtitle);
  setActiveSection("match");
  showStatus(`Matched with ${getOpponentTag(match)}.`);
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
    const primaryName =
      entry.profile?.name || entry.username || entry.tag || "Unknown player";
    tag.textContent = entry.isYou ? `${primaryName} (You)` : primaryName;
    const meta = document.createElement("div");
    meta.className = "queue-meta";
    const wins = Number(entry.stats?.wins || 0);
    const losses = Number(entry.stats?.losses || 0);
    const draws = Number(entry.stats?.draws || 0);
    const record = `${wins}W-${losses}L-${draws}D`;
    const league = entry.profile?.highestLeagueName || "Unranked";
    if (entry.profile) {
      meta.textContent = `${entry.tag} · ${
        entry.profile.trophies ?? 0
      } trophies · ${league} · ${record}`;
    } else {
      meta.textContent = `${entry.tag} · Profile loading... · ${record}`;
    }
    left.appendChild(tag);
    left.appendChild(meta);

    if (entry.profile?.isUltimateChampion) {
      const flair = document.createElement("div");
      flair.className = "queue-flair";
      const medals = Number(entry.profile?.ultimateChampionMedals || 0);
      flair.textContent =
        medals > 0
          ? `Ultimate Champion • ${medals} medals`
          : "Ultimate Champion";
      left.appendChild(flair);
    }

    const right = document.createElement("div");
    right.className = "queue-actions-inline";
    const wager = document.createElement("span");
    wager.className = "queue-wager";
    const currency = entry.currency || "coins";
    wager.textContent = `Wager: ${entry.wager ?? 0} ${currency}`;
    right.appendChild(wager);

    if (!entry.isYou) {
      const acceptButton = document.createElement("button");
      acceptButton.type = "button";
      acceptButton.className = "secondary accept-wager-button";
      acceptButton.textContent = "Accept";
      acceptButton.addEventListener("click", () => acceptWager(entry));
      right.appendChild(acceptButton);
    }

    card.appendChild(left);
    card.appendChild(right);
    queueListEl.appendChild(card);
  });

  if (currentTicketId && !entries.some((entry) => entry.isYou)) {
    const placeholder = document.createElement("div");
    placeholder.className = "queue-card you";
    const left = document.createElement("div");
    left.className = "queue-info";
    const tag = document.createElement("span");
    tag.className = "queue-tag";
    const primaryName =
      currentUser?.playerProfile?.name ||
      currentUser?.username ||
      currentUser?.tag ||
      "You";
    tag.textContent = `${primaryName} (You)`;
    const meta = document.createElement("div");
    meta.className = "queue-meta";
    if (currentUser?.playerProfile) {
      const wins = Number(currentUser?.stats?.wins || 0);
      const losses = Number(currentUser?.stats?.losses || 0);
      const draws = Number(currentUser?.stats?.draws || 0);
      const league = currentUser.playerProfile?.highestLeagueName || "Unranked";
      meta.textContent = `${currentUser.tag || "No tag"} · ${
        currentUser.playerProfile.trophies ?? 0
      } trophies · ${league} · ${wins}W-${losses}L-${draws}D`;
    } else {
      meta.textContent = `${currentUser?.tag || "No tag"} · Profile loading...`;
    }
    left.appendChild(tag);
    left.appendChild(meta);

    if (currentUser?.playerProfile?.isUltimateChampion) {
      const flair = document.createElement("div");
      flair.className = "queue-flair";
      const medals = Number(
        currentUser?.playerProfile?.ultimateChampionMedals || 0
      );
      flair.textContent =
        medals > 0
          ? `Ultimate Champion • ${medals} medals`
          : "Ultimate Champion";
      left.appendChild(flair);
    }

    const right = document.createElement("div");
    right.className = "queue-actions-inline";
    const wager = document.createElement("span");
    wager.className = "queue-wager";
    wager.textContent = `Wager: ${Number(wagerInput?.value || 0)} ${
      selectedCurrency || "coins"
    }`;
    right.appendChild(wager);

    placeholder.appendChild(left);
    placeholder.appendChild(right);
    queueListEl.prepend(placeholder);
    const count = entries.length + 1;
    queueCountEl.textContent = `${count} waiting`;
  }
}

async function acceptWager(entry) {
  if (!entry?.ticketId) {
    showStatus("That queue entry is no longer available.", true);
    return;
  }
  setWaitingState(true);
  showStatus("Accepting wager...");
  try {
    const data = await apiRequest("/api/queue/accept", {
      method: "POST",
      body: JSON.stringify({ ticketId: entry.ticketId }),
    });
    currentTicketId = data.ticketId || null;
    if (data.status === "matched" && data.match) {
      await moveToMatch(
        data.match,
        "Match Locked In",
        "Challenge accepted. Opening your 1v1 arena..."
      );
      setWaitingState(false);
      stopPolling();
      refreshQueueList();
      return;
    }
    setWaitingState(false);
    showStatus("Unable to create match from that wager.", true);
  } catch (err) {
    setWaitingState(false);
    showStatus(err.message, true);
    refreshQueueList();
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
    if (data.status === "matched") {
      await moveToMatch(data.match, "Match Found", "Opening your match page...");
      setWaitingState(false);
      stopPolling();
      refreshQueueList();
      return;
    }

    showStatus("Challenge posted. Waiting for someone to accept.");
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
      await moveToMatch(
        data.match,
        "Challenge Accepted",
        "A player accepted your wager. Taking you to the match page..."
      );
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

    showStatus("Friendly battle found. Loading full history...");
    setActiveSection("results");
    await loadResultsHistory();
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

if (onboardingBackBtn) {
  onboardingBackBtn.addEventListener("click", () => {
    onboardingStepIndex = Math.max(0, onboardingStepIndex - 1);
    renderOnboardingStep();
  });
}

if (onboardingNextBtn) {
  onboardingNextBtn.addEventListener("click", () => {
    if (onboardingStepIndex >= ONBOARDING_STEPS.length - 1) {
      closeOnboarding(true);
      return;
    }
    onboardingStepIndex += 1;
    renderOnboardingStep();
  });
}

if (onboardingSkipBtn) {
  onboardingSkipBtn.addEventListener("click", () => {
    closeOnboarding(true);
  });
}

if (onboardingModal) {
  onboardingModal.addEventListener("click", (event) => {
    if (event.target === onboardingModal) {
      closeOnboarding(true);
    }
  });
}

if (helpButton) {
  helpButton.addEventListener("click", () => {
    if (!currentUser) {
      showStatus("Log in to view the walkthrough.", true);
      return;
    }
    openOnboarding(currentUser.id, true);
  });
}

if (queueEmptyJoinBtn) {
  queueEmptyJoinBtn.addEventListener("click", () => {
    joinQueue();
  });
}

if (matchGoQueueBtn) {
  matchGoQueueBtn.addEventListener("click", () => {
    setActiveSection("queue");
  });
}

joinQueueBtn.addEventListener("click", joinQueue);
trackBattleBtn.addEventListener("click", trackFriendlyBattle);
if (refreshQueueBtn) refreshQueueBtn.addEventListener("click", manualRefreshQueue);
if (cancelQueueBtn) cancelQueueBtn.addEventListener("click", cancelQueue);
if (verifyButton) verifyButton.addEventListener("click", verifyAccount);
if (verifyResendButton) {
  verifyResendButton.addEventListener("click", resendVerificationCode);
}
if (shopAmountInput) {
  shopAmountInput.addEventListener("input", updateShopPreview);
}
if (shopAmountChips.length) {
  shopAmountChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const cents = Number(chip.dataset.cents);
      if (!Number.isFinite(cents) || cents <= 0) return;
      if (shopAmountInput) shopAmountInput.value = centsToAmountString(cents);
      updateShopPreview();
    });
  });
}
if (shopCheckoutBtn) {
  shopCheckoutBtn.addEventListener("click", startCheckout);
}
if (shopOpenKeypadBtn) {
  shopOpenKeypadBtn.addEventListener("click", () => {
    openMobileDepositSheet();
  });
}
if (mobileDepositCloseBtn) {
  mobileDepositCloseBtn.addEventListener("click", closeMobileDepositSheet);
}
if (mobileDepositSheet) {
  mobileDepositSheet.addEventListener("click", (event) => {
    if (event.target === mobileDepositSheet) {
      closeMobileDepositSheet();
    }
  });
}
if (mobileAmountChips.length) {
  mobileAmountChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const cents = Number(chip.dataset.cents);
      if (!Number.isFinite(cents) || cents <= 0) return;
      setMobileDepositValue(centsToAmountString(cents));
    });
  });
}
if (mobileKeypadKeys.length) {
  mobileKeypadKeys.forEach((keyButton) => {
    keyButton.addEventListener("click", () => {
      const key = keyButton.dataset.key;
      if (!key) return;
      handleMobileKeyInput(key);
    });
  });
}
if (mobileDepositPayBtn) {
  mobileDepositPayBtn.addEventListener("click", async () => {
    const cents = parseAmountToCents(mobileDepositValue);
    await startCheckoutWithCents(cents);
  });
}
if (cashoutAmountInput) {
  cashoutAmountInput.addEventListener("input", updateCashoutPreview);
}
if (cashoutConnectBtn) {
  cashoutConnectBtn.addEventListener("click", startCashoutConnect);
}
if (cashoutSubmitBtn) {
  cashoutSubmitBtn.addEventListener("click", startCashout);
}
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

window.addEventListener("resize", () => {
  if (!isMobileViewport()) {
    closeMobileDepositSheet();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (mobileDepositSheet?.classList.contains("active")) {
    closeMobileDepositSheet();
  }
  if (onboardingModal && !onboardingModal.classList.contains("hidden")) {
    closeOnboarding(true);
  }
});

resetMatch();
setActiveSection("auth");
setCurrency(selectedCurrency);
if (shopAmountInput && !String(shopAmountInput.value || "").trim()) {
  shopAmountInput.value = centsToAmountString(MIN_SHOP_CENTS);
}
updateShopPreview();
loadSession();
