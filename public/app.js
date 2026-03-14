const authPanel = document.getElementById("auth-panel");
const profilePanel = document.getElementById("profile-panel");
const queuePanel = document.getElementById("queue-panel");
const shopPanel = document.getElementById("shop-panel");
const leaderboardsPanel = document.getElementById("leaderboards-panel");
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
const statBalance = document.getElementById("stat-balance");
const statWins = document.getElementById("stat-wins");
const statLosses = document.getElementById("stat-losses");
const statDraws = document.getElementById("stat-draws");
const balanceCoins = document.getElementById("balance-coins");
const balanceBalance = document.getElementById("balance-balance");
const shopMessageEl = document.getElementById("shop-message");
const shopCoinsEl = document.getElementById("shop-coins");
const shopBalanceEl = document.getElementById("shop-balance");
const shopAmountInput = document.getElementById("shop-amount");
const shopCheckoutBtn = document.getElementById("shop-checkout");
const shopBalancePreview = document.getElementById("shop-balance-preview");
const shopAmountChips = Array.from(document.querySelectorAll(".shop-amount-chip"));
const shopMobileAmount = document.getElementById("shop-mobile-amount");
const shopMobileBalancePreview = document.getElementById("shop-mobile-balance-preview");
const shopOpenKeypadBtn = document.getElementById("shop-open-keypad");
const coinGemTradeBtn = document.getElementById("coin-gem-trade");
const coinGemMessageEl = document.getElementById("coin-gem-message");
const exchangeCoinsEl = document.getElementById("exchange-coins");
const exchangeBalanceEl = document.getElementById("exchange-balance");
const exchangeCtaCoinsEl = document.getElementById("exchange-cta-coins");
const exchangeCtaBalanceEl = document.getElementById("exchange-cta-balance");
const dailyRewardsTrackEl = document.getElementById("daily-rewards-track");
const dailyRewardStreakEl = document.getElementById("daily-reward-streak");
const dailyRewardStatusEl = document.getElementById("daily-reward-status");
const dailyRewardNextEl = document.getElementById("daily-reward-next");
const dailyRewardNextSubtextEl = document.getElementById("daily-reward-next-subtext");
const dailyRewardClaimBtn = document.getElementById("daily-reward-claim");
const dailyRewardMessageEl = document.getElementById("daily-reward-message");
const walletCoinsWonEl = document.getElementById("wallet-coins-won");
const walletBalanceWonEl = document.getElementById("wallet-balance-won");
const walletBalanceCashedOutEl = document.getElementById("wallet-balance-cashed-out");
const walletFeesPaidEl = document.getElementById("wallet-fees-paid");
const walletCashableEl = document.getElementById("wallet-cashable");
const walletCashableSubtextEl = document.getElementById("wallet-cashable-subtext");
const walletAlertEl = document.getElementById("wallet-alert");
const mobileDepositSheet = document.getElementById("mobile-deposit-sheet");
const mobileDepositCloseBtn = document.getElementById("mobile-deposit-close");
const mobileDepositAmountEl = document.getElementById("mobile-deposit-amount");
const mobileDepositBalanceEl = document.getElementById("mobile-deposit-balance");
const mobileWalletCoinsEl = document.getElementById("mobile-wallet-coins");
const mobileWalletBalanceEl = document.getElementById("mobile-wallet-balance");
const mobileDepositPayBtn = document.getElementById("mobile-deposit-pay");
const mobileKeypadMessageEl = document.getElementById("mobile-keypad-message");
const mobileKeypadKeys = Array.from(document.querySelectorAll(".keypad-key"));
const mobileAmountChips = Array.from(document.querySelectorAll(".mobile-chip"));
const onboardingModal = document.getElementById("onboarding-modal");
const legalModal = document.getElementById("legal-modal");
const legalModalTitle = document.getElementById("legal-modal-title");
const legalModalBody = document.getElementById("legal-modal-body");
const legalModalClose = document.getElementById("legal-modal-close");
const onboardingStepTitleEl = document.getElementById("onboarding-step-title");
const onboardingStepBodyEl = document.getElementById("onboarding-step-body");
const onboardingProgressLabelEl = document.getElementById("onboarding-progress-label");
const onboardingProgressFillEl = document.getElementById("onboarding-progress-fill");
const onboardingBackBtn = document.getElementById("onboarding-back");
const onboardingNextBtn = document.getElementById("onboarding-next");
const onboardingSkipBtn = document.getElementById("onboarding-skip");
const cashoutAmountInput = document.getElementById("cashout-amount");
const cashoutBalancePreview = document.getElementById("cashout-balance-preview");
const cashoutUsdPreview = document.getElementById("cashout-usd-preview");
const cashoutStatusEl = document.getElementById("cashout-status");
const cashoutMessageEl = document.getElementById("cashout-message");
const cashoutConnectBtn = document.getElementById("cashout-connect");
const cashoutSubmitBtn = document.getElementById("cashout-submit");
const cashoutHistoryEl = document.getElementById("cashout-history");
let COIN_TO_BALANCE_COINS = 1000;
let COIN_TO_BALANCE_BALANCE = 100;
// Deprecated constants for backwards compatibility
let COIN_TO_GEM_COINS = COIN_TO_BALANCE_COINS;
let COIN_TO_GEM_GEMS = COIN_TO_BALANCE_BALANCE;
const BALANCE_TO_USD_RATE = 0.01; // 1 balance unit = 1 cent (0.01 USD)
const DAILY_REWARD_SCHEDULE = [
  { day: 1, currency: "coins", amount: 50 },
  { day: 2, currency: "coins", amount: 100 },
  { day: 3, currency: "coins", amount: 150 },
  { day: 4, currency: "coins", amount: 250 },
  { day: 5, currency: "balance", amount: 50 },
];
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
const leaderboardsBodyEl = document.getElementById("leaderboards-body");
const leaderboardsLabelEl = document.getElementById("leaderboards-label");
const leaderboardsMessageEl = document.getElementById("leaderboards-message");
const leaderboardWinningsHeaderEl = document.getElementById("leaderboard-winnings-header");
const leaderboardPrizesEl = document.getElementById("leaderboard-prizes");
const leaderboardRewardClaimEl = document.getElementById("leaderboard-reward-claim");
const leaderboardRewardTitleEl = document.getElementById("leaderboard-reward-title");
const leaderboardRewardCopyEl = document.getElementById("leaderboard-reward-copy");
const leaderboardRewardClaimBtn = document.getElementById("leaderboard-reward-claim-btn");
const leaderboardCurrencyButtons = Array.from(
  document.querySelectorAll("[data-leaderboard-currency]")
);
const leaderboardPeriodButtons = Array.from(
  document.querySelectorAll("[data-leaderboard-period]")
);
const matchSection = document.getElementById("match");
const matchIdEl = document.getElementById("match-id");
const matchPlayersEl = document.getElementById("match-players");
const trackBattleBtn = document.getElementById("track-battle");
const matchLockEl = document.getElementById("match-lock");
const matchPotEl = document.getElementById("match-pot");
const matchWinnerPayoutEl = document.getElementById("match-winner-payout");
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
const authOnlySections = Array.from(document.querySelectorAll(".auth-only"));
const helpButton = document.getElementById("help-button");
const menuToggleButton = document.getElementById("menu-toggle");
const menuCloseButton = document.getElementById("menu-close");
const menuDrawer = document.getElementById("menu-drawer");
const menuScrim = document.getElementById("menu-scrim");
const drawerAnchorButtons = Array.from(
  document.querySelectorAll(".drawer-anchor")
);
const profileDisplayName = document.getElementById("profile-display-name");
const profileReadinessPercentEl = document.getElementById("profile-readiness-percent");
const profileReadinessCopyEl = document.getElementById("profile-readiness-copy");
const profileReadinessFillEl = document.getElementById("profile-readiness-fill");
const profileReadinessChecklistEl = document.getElementById("profile-readiness-checklist");
const queueEmptyJoinBtn = document.getElementById("queue-empty-join");
const queueInsightsEl = document.getElementById("queue-insights");
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
  leaderboards: leaderboardsPanel,
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
let queueLastUpdated = 0;
let queueLastUpdatedTimer = null;
let activeSection = "auth";
let selectedCurrency = "coins";
const MIN_SHOP_CENTS = 1000;
const MIN_CASHOUT_CENTS = 1000;
const MAX_CASHOUT_CENTS = 100000;
const MAX_WAGER_BALANCE  = 100;
const MAX_WAGER_COINS = 10000;
let cashoutReady = false;
let mobileDepositValue = (MIN_SHOP_CENTS / 100).toFixed(2);
let onboardingStepIndex = 0;
let onboardingUserId = null;
let leaderboardCurrency = "balance";
let leaderboardPeriod = "month";

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
    title: "Deposit money for balance",
    body: "Head to the Shop and deposit USD. Every cent becomes one gem you can wager in real matches.",
  },
  {
    title: "Win Clash Royale duels",
    body: "Join the Queue, set your wager, and get matched. Play a friendly battle in Clash Royale — the winner takes the pot.",
  },
  {
    title: "Cash out your winnings",
    body: "Back in the Shop, convert your balance to USD and cash out through your connected Stripe payout account.",
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

const LEAGUE_BADGE_CONFIG = {
  "Master I": {
    slug: "master-1",
    image: "/brand/league-badges/master-1.png",
    surface: "rgba(22, 82, 156, 0.86)",
    surfaceAlt: "rgba(12, 24, 49, 0.96)",
    border: "rgba(125, 211, 252, 0.36)",
    glow: "rgba(59, 130, 246, 0.34)",
    accent: "#7dd3fc",
    text: "#eff8ff",
  },
  "Master II": {
    slug: "master-2",
    image: "/brand/league-badges/master-2.png",
    surface: "rgba(86, 44, 151, 0.84)",
    surfaceAlt: "rgba(24, 13, 46, 0.96)",
    border: "rgba(196, 181, 253, 0.4)",
    glow: "rgba(168, 85, 247, 0.32)",
    accent: "#ddd6fe",
    text: "#faf5ff",
  },
  "Master III": {
    slug: "master-3",
    image: "/brand/league-badges/master-3.png",
    surface: "rgba(122, 35, 57, 0.84)",
    surfaceAlt: "rgba(43, 11, 30, 0.96)",
    border: "rgba(251, 113, 133, 0.36)",
    glow: "rgba(244, 63, 94, 0.32)",
    accent: "#fda4af",
    text: "#fff1f2",
  },
  "Champion": {
    slug: "champion",
    image: "/brand/league-badges/champion.png",
    surface: "rgba(136, 34, 68, 0.82)",
    surfaceAlt: "rgba(59, 13, 25, 0.96)",
    border: "rgba(251, 191, 36, 0.44)",
    glow: "rgba(251, 146, 60, 0.34)",
    accent: "#fbbf24",
    text: "#fff7ed",
  },
  "Grand Champion": {
    slug: "grand-champion",
    image: "/brand/league-badges/grand-champion.png",
    surface: "rgba(32, 94, 190, 0.84)",
    surfaceAlt: "rgba(17, 39, 84, 0.96)",
    border: "rgba(250, 204, 21, 0.42)",
    glow: "rgba(96, 165, 250, 0.34)",
    accent: "#facc15",
    text: "#f8fbff",
  },
  "Royal Champion": {
    slug: "royal-champion",
    image: "/brand/league-badges/royal-champion.png",
    surface: "rgba(25, 101, 196, 0.84)",
    surfaceAlt: "rgba(22, 49, 114, 0.96)",
    border: "rgba(251, 191, 36, 0.44)",
    glow: "rgba(59, 130, 246, 0.36)",
    accent: "#fcd34d",
    text: "#fffbeb",
  },
  "Ultimate Champion": {
    slug: "ultimate-champion",
    image: "/brand/league-badges/ultimate-champion.png",
    surface: "rgba(116, 52, 180, 0.86)",
    surfaceAlt: "rgba(34, 19, 69, 0.96)",
    border: "rgba(226, 232, 240, 0.48)",
    glow: "rgba(192, 132, 252, 0.4)",
    accent: "#e9d5ff",
    text: "#faf5ff",
  },
  Unranked: {
    slug: "unranked",
    surface: "rgba(39, 50, 68, 0.86)",
    surfaceAlt: "rgba(16, 23, 34, 0.96)",
    border: "rgba(148, 163, 184, 0.26)",
    glow: "rgba(15, 23, 42, 0.25)",
    accent: "#cbd5e1",
    text: "#e2e8f0",
  },
};

const LEAGUE_NAME_ALIASES = new Map([
  ["master i", "Master I"],
  ["master 1", "Master I"],
  ["master ii", "Master II"],
  ["master 2", "Master II"],
  ["master iii", "Master III"],
  ["master 3", "Master III"],
  ["champion", "Champion"],
  ["grand champion", "Grand Champion"],
  ["royal champion", "Royal Champion"],
  ["ultimate champion", "Ultimate Champion"],
  ["unranked", "Unranked"],
]);

function normalizeLeagueName(leagueName) {
  const raw = String(leagueName || "").trim();
  if (!raw) return "Unranked";
  const normalizedRaw = raw.replace(/\s+/g, " ");
  const lower = normalizedRaw.toLowerCase();
  if (
    lower === "chamption" ||
    lower.includes("ultimate chamption") ||
    lower.includes("ultimate champion")
  ) {
    return "Ultimate Champion";
  }
  // Map old Challenger names to Master I (Challenger removed June 2025)
  if (lower.startsWith("challenger")) {
    return "Master I";
  }
  return LEAGUE_NAME_ALIASES.get(lower) || normalizedRaw;
}

function createLeagueBadge(leagueName) {
  const normalizedLeagueName = normalizeLeagueName(leagueName);
  const config =
    LEAGUE_BADGE_CONFIG[normalizedLeagueName] || LEAGUE_BADGE_CONFIG.Unranked;
  const span = document.createElement("span");
  span.className = `league-badge league-badge--${config.slug}`;
  span.setAttribute("aria-label", normalizedLeagueName);
  span.title = normalizedLeagueName;
  span.style.setProperty("--league-surface", config.surface);
  span.style.setProperty("--league-surface-alt", config.surfaceAlt);
  span.style.setProperty("--league-border", config.border);
  span.style.setProperty("--league-glow", config.glow);
  span.style.setProperty("--league-accent", config.accent);
  span.style.setProperty("--league-text", config.text);

  const icon = document.createElement("span");
  icon.className = "league-badge-icon";
  icon.setAttribute("aria-hidden", "true");
  if (config.image) {
    const art = document.createElement("img");
    art.className = "league-badge-art";
    art.src = config.image;
    art.alt = "";
    art.decoding = "async";
    art.width = 36;
    art.height = 36;
    icon.appendChild(art);
  } else {
    icon.textContent = "•";
  }

  const copy = document.createElement("span");
  copy.className = "league-badge-copy";
  const label = document.createElement("span");
  label.className = "league-badge-label";
  label.textContent = normalizedLeagueName;
  copy.appendChild(label);
  span.append(icon, copy);
  return span;
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

// ── Legal modal (Terms / Privacy) ──────────────────────────────────────────

const LEGAL_CONTENT = {
  terms: {
    title: "Terms of Service",
    effectiveDate: "March 11, 2026",
    sections: [
      { heading: "1. Eligibility", body: "You must be at least 18 years of age and physically located in a state or jurisdiction where skill-based wagering is lawful to use BetRoyale. By creating an account and providing your date of birth you represent and warrant that you meet these requirements. BetRoyale currently blocks registrations from AZ, AR, HI, ID, IL, IA, LA, MT, ND, NV, NY, PA, TN, TX, and WA." },
      { heading: "2. Skill-Based Wagering", body: "BetRoyale facilitates wagers on the outcome of Clash Royale friendly duels between consenting players. Outcomes are determined solely by player skill and are verified through the official Clash Royale API battle log. BetRoyale does not participate in or influence match outcomes. The platform charges a 7.25% fee on each wagered pot (winner receives 92.75% of the combined pot)." },
      { heading: "3. Coins & Balance", body: "Coins are free starter currency with no monetary value; they cannot be cashed out. Balance are purchased with real USD at a rate of 1¢ = 1 gem and may be withdrawn subject to identity verification and these Terms. Minimum deposit: $10.00. Maximum deposit: $1,000.00 per transaction." },
      { heading: "4. Deposits, Fees & Cash Outs", body: "Deposits are processed by Stripe and are subject to Stripe's terms and fees. BetRoyale charges a 7.25% fee on wager pots only — there are no fees on deposits or cash outs. Cash outs require completion of Stripe identity verification and may take 1–3 business days for Stripe to approve your account, then 1–2 additional business days for the transfer to arrive. BetRoyale reserves the right to delay or deny cash outs pending fraud review or legal compliance." },
      { heading: "5. Prohibited Conduct", body: "The following are strictly prohibited and will result in immediate account suspension and forfeiture of account balance: (a) collusion or match-fixing between players; (b) use of bots, macros, or automation tools; (c) multi-accounting (operating more than one account); (d) initiating fraudulent chargebacks; (e) exploiting platform bugs for financial gain; (f) providing false identity information; (g) allowing minors to access your account." },
      { heading: "6. Dispute Resolution", body: "If you believe a match result was recorded incorrectly, contact support@betroyale.win within 72 hours of the match with your match ID and a description of the issue. BetRoyale will review the Clash Royale API battle log and respond within 5 business days. By agreeing to these Terms you consent to binding arbitration for any unresolved disputes and waive your right to participate in a class action lawsuit against BetRoyale." },
      { heading: "7. Responsible Gaming & Self-Exclusion", body: "BetRoyale provides deposit limits and a self-exclusion tool accessible from your account settings. Self-exclusion is effective immediately and remains in place for a minimum of 30 days; reinstatement requires written request to support@betroyale.win and a 30-day cooling-off period. For help with problem gambling, contact the National Council on Problem Gambling at 1-800-522-4700 or ncpgambling.org." },
      { heading: "8. Refunds", body: "Deposits are non-refundable once converted to balance, except in cases of proven technical error on our part. Unspent balance may be cashed out via the normal withdrawal process. Wager results are final once the Clash Royale battle log confirms the outcome." },
      { heading: "9. Termination", body: "BetRoyale may suspend or terminate accounts at any time for violation of these Terms. You may close your account at any time by emailing support@betroyale.win; any pending gem balance will be processed for withdrawal within 14 business days after identity verification." },
      { heading: "10. Limitation of Liability", body: "BetRoyale is not liable for losses arising from platform downtime, Clash Royale API delays, Stripe service failures, or other third-party failures beyond our control. Total liability to any user is limited to the gem balance in their account at the time of the claim." },
      { heading: "11. Governing Law & Arbitration", body: "These Terms are governed by the laws of the State of California, USA, without regard to conflict-of-law principles. Any dispute not resolved by BetRoyale support shall be settled by binding arbitration administered by JAMS in Los Angeles, California, under its Streamlined Arbitration Rules. You waive any right to a jury trial or class action." },
      { heading: "12. Changes to Terms", body: "We may update these Terms at any time. Continued use of BetRoyale after notice constitutes acceptance. Material changes will be communicated by email at least 14 days in advance." },
      { heading: "13. Contact", body: "General: support@betroyale.win · Legal: legal@betroyale.win · Address: BetRoyale, Los Angeles, California, USA." },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    effectiveDate: "March 11, 2026",
    sections: [
      { heading: "1. Information We Collect", body: "We collect: account information (username, email, hashed password, date of birth, state of residence); gameplay data (Clash Royale player tag, friend link, match history, wager history); identity verification data (name, address, government ID — collected and stored by Stripe, not BetRoyale); and technical metadata (IP address, session identifiers, browser type)." },
      { heading: "2. Payment & Identity Data", body: "Deposits and cash outs are processed by Stripe, Inc. BetRoyale does not store payment card numbers or full government ID images. Stripe's Privacy Policy (stripe.com/privacy) governs how Stripe handles your financial and identity data." },
      { heading: "3. How We Use Your Data", body: "Your data is used to: operate and secure your account; verify your age and state eligibility; settle wagers; detect and prevent fraud and collusion; comply with legal obligations; and send transactional emails (verification codes, payout confirmations). We do not use your data for targeted advertising." },
      { heading: "4. Data Sharing", body: "We do not sell your personal data. We share data only: with Stripe for payment and identity processing; with Supercell's Clash Royale API to verify battle outcomes; with law enforcement or regulators when legally required; and with service providers who assist in operating the platform under data processing agreements." },
      { heading: "5. Data Retention", body: "Account data is retained for the life of your account. Financial records (deposits, withdrawals, wager history) are retained for 7 years to comply with financial regulations. You may request deletion of non-financial personal data by emailing support@betroyale.win." },
      { heading: "6. Security", body: "Passwords are hashed using bcrypt. All data in transit is encrypted using TLS 1.2+. We conduct periodic security reviews. No system is completely secure; please use a strong, unique password." },
      { heading: "7. Cookies", body: "BetRoyale uses only session cookies that are strictly necessary for login and platform security. We do not use third-party advertising, tracking, or analytics cookies. You may disable cookies in your browser settings, but doing so will prevent you from logging in." },
      { heading: "8. Your Rights (CCPA / GDPR)", body: "California residents have the right to know what personal data we collect, request deletion of their data, and opt out of sale of their data (we do not sell data). EEA/UK residents have rights under GDPR including access, rectification, erasure, restriction, and data portability. To exercise any of these rights, email support@betroyale.win with your request. We will respond within 30 days." },
      { heading: "9. Children's Privacy", body: "BetRoyale is not directed to persons under 18. We do not knowingly collect data from minors. If you believe a minor has created an account, contact support@betroyale.win immediately." },
      { heading: "10. Changes to This Policy", body: "We may update this Privacy Policy at any time. Material changes will be communicated by email at least 14 days in advance and reflected with a new effective date at the top of this page." },
      { heading: "11. Contact", body: "Privacy questions or data requests: support@betroyale.win · Legal/compliance: legal@betroyale.win · BetRoyale, Los Angeles, California, USA." },
    ],
  },
};

function openLegalModal(type) {
  if (!legalModal) return;
  const content = LEGAL_CONTENT[type];
  if (!content) return;
  legalModalTitle.textContent = content.title;
  const effectiveDateHtml = content.effectiveDate
    ? `<p class="legal-effective-date">Effective date: ${content.effectiveDate}</p>`
    : "";
  legalModalBody.innerHTML =
    effectiveDateHtml +
    content.sections
      .map((s) => `<div><h3>${s.heading}</h3><p>${s.body}</p></div>`)
      .join("");
  legalModal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  history.replaceState(null, "", type === "terms" ? "/terms" : "/privacy");
}

function closeLegalModal() {
  if (!legalModal) return;
  legalModal.classList.add("hidden");
  document.body.classList.remove("modal-open");
  history.replaceState(null, "", "/");
}

if (legalModalClose) {
  legalModalClose.addEventListener("click", closeLegalModal);
}

legalModal?.addEventListener("click", (e) => {
  if (e.target === legalModal) closeLegalModal();
});

// Auto-open on direct navigation to /terms or /privacy
(function checkLegalRoute() {
  const path = window.location.pathname;
  if (path === "/terms") openLegalModal("terms");
  else if (path === "/privacy") openLegalModal("privacy");
})();

// Footer links
document.querySelectorAll('a[href="/terms"]').forEach((el) => {
  el.addEventListener("click", (e) => { e.preventDefault(); openLegalModal("terms"); });
});
document.querySelectorAll('a[href="/privacy"]').forEach((el) => {
  el.addEventListener("click", (e) => { e.preventDefault(); openLegalModal("privacy"); });
});

// ── End Legal modal ─────────────────────────────────────────────────────────

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
  if (shopBalancePreview) shopBalancePreview.textContent = formatUsd(safeCents);
  if (shopMobileAmount) shopMobileAmount.textContent = amountText;
  if (shopMobileBalancePreview) shopMobileBalancePreview.textContent = formatUsd(safeCents);
  if (mobileDepositAmountEl) mobileDepositAmountEl.textContent = amountText;
  if (mobileDepositBalanceEl) mobileDepositBalanceEl.textContent = formatUsd(safeCents);
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
  selectedCurrency = currency === "balance" ? "balance" : "coins";
  currencyButtons.forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.currency === selectedCurrency
    );
  });
  updateQueueBalance();
  updateWinPreview();
}

// Potential-winnings preview: shows what the player would receive if their
// opponent matches the entered wager.
const WINNER_PCT_CLIENT = 0.9275;
function updateWinPreview() {
  const el = document.getElementById("queue-win-preview");
  if (!el) return;
  const wager = Math.floor(Number(wagerInput?.value) || 0);
  if (wager <= 0) {
    el.textContent = "";
    return;
  }
  const pot     = wager * 2;
  const payout  = Math.floor(pot * WINNER_PCT_CLIENT);
  const label   = selectedCurrency === "balance" ? "Balance" : "Coins";
  const winDisplay = selectedCurrency === "balance" ? formatUsd(payout) : `${payout.toLocaleString()} ${label}`;
  el.innerHTML =
    `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>` +
    `Win <strong>${winDisplay}</strong> if your opponent matches`;
}

// Show available balance near the wager input so users don't have to look away.
function updateQueueBalance() {
  const el = document.getElementById("queue-balance");
  if (!el) return;
  if (!currentUser) { el.textContent = ""; return; }
  const coins = currentUser.coins ?? currentUser.credits ?? 0;
  const balance  = currentUser.balance ?? 0;
  const bal   = selectedCurrency === "balance" ? balance : coins;
  const label = selectedCurrency === "balance" ? "Balance" : "Coins";
  const displayVal = selectedCurrency === "balance" ? formatUsd(bal) : `${bal.toLocaleString()} ${label}`;
  el.innerHTML = `Balance: <strong>${displayVal}</strong>`;
}

// Show a green ✓ or amber ⚠ above the form based on profile readiness.
function updateQueueProfileCheck() {
  const el = document.getElementById("queue-profile-check");
  if (!el) return;
  if (!currentUser) { el.innerHTML = ""; return; }
  const hasTag  = Boolean(currentUser.tag);
  const hasLink = Boolean(currentUser.friendLink);
  if (hasTag && hasLink) {
    el.innerHTML =
      `<span class="profile-check profile-check--ok">` +
      `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>` +
      `Profile ready — player tag and friend link set.</span>`;
  } else {
    const missing = [!hasTag && "player tag", !hasLink && "friend link"].filter(Boolean).join(" and ");
    el.innerHTML =
      `<span class="profile-check profile-check--warn">` +
      `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>` +
      `Missing ${missing} — <a id="queue-go-profile" href="#">update your profile</a> before joining.</span>`;
    document.getElementById("queue-go-profile")?.addEventListener("click", (e) => {
      e.preventDefault();
      setActiveSection("profile");
    });
  }
}

function getProfileReadinessState(user) {
  const checklist = [
    {
      label: "Verify email",
      done: Boolean(user?.isVerified),
      doneText: "Email confirmed",
      pendingText: "Needed to unlock matchmaking",
    },
    {
      label: "Save player tag",
      done: Boolean(user?.tag),
      doneText: user?.tag || "Tag saved",
      pendingText: "Used to verify your Clash Royale battle",
    },
    {
      label: "Save friend link",
      done: Boolean(user?.friendLink),
      doneText: "Friend link saved",
      pendingText: "Lets opponents add you quickly",
    },
  ];
  const completed = checklist.filter((item) => item.done).length;
  const percent = Math.round((completed / checklist.length) * 100);
  let copy = "Verify your email, then add your player tag and friend link to unlock the queue.";
  if (percent === 100) {
    copy = "";
  } else if (completed === 2) {
    copy = "One step left. Finish the last item to become queue-ready.";
  } else if (completed === 1) {
    copy = "Good start. Complete the remaining steps so opponents can connect with you.";
  }
  return { checklist, percent, copy };
}

function renderProfileReadiness(user) {
  if (
    !profileReadinessPercentEl ||
    !profileReadinessCopyEl ||
    !profileReadinessFillEl ||
    !profileReadinessChecklistEl
  ) {
    return;
  }

  const container = document.getElementById("profile-readiness");
  const state = getProfileReadinessState(user);
  const storageKey = `br_ready_dismissed_${currentUser?.id || ""}`;

  // If the user drops below 100%, clear the dismissal so the widget reappears
  // when they complete all steps again.
  if (state.percent < 100) {
    if (localStorage.getItem(storageKey)) {
      localStorage.removeItem(storageKey);
    }
    if (container) {
      container.classList.remove("profile-readiness--dismissing", "profile-readiness--hidden");
      delete container.dataset.dismissTimer;
    }
  }

  // Already dismissed at 100% — keep hidden without re-rendering.
  if (state.percent === 100 && localStorage.getItem(storageKey)) {
    if (container) container.classList.add("profile-readiness--hidden");
    return;
  }

  // Render the widget normally.
  profileReadinessPercentEl.textContent = `${state.percent}%`;
  profileReadinessCopyEl.textContent = state.copy;
  profileReadinessFillEl.style.width = `${state.percent}%`;
  profileReadinessChecklistEl.innerHTML = "";
  state.checklist.forEach((item) => {
    const node = document.createElement("div");
    node.className = `profile-readiness-item${item.done ? " done" : ""}`;
    node.innerHTML =
      `<span class="profile-readiness-icon">${item.done ? "✓" : "•"}</span>` +
      `<span class="profile-readiness-label">${item.label}</span>` +
      `<span class="profile-readiness-note">${item.done ? item.doneText : item.pendingText}</span>`;
    profileReadinessChecklistEl.appendChild(node);
  });

  // At 100% and not yet dismissed — wait 3 s then fade + slide the widget away.
  if (state.percent === 100 && container && !container.dataset.dismissTimer) {
    container.dataset.dismissTimer = "1";
    setTimeout(() => {
      container.classList.add("profile-readiness--dismissing");
      container.addEventListener(
        "transitionend",
        () => {
          container.classList.add("profile-readiness--hidden");
          localStorage.setItem(storageKey, "1");
          delete container.dataset.dismissTimer;
        },
        { once: true },
      );
    }, 3000);
  }
}

function resolveSectionTarget(section, options = {}) {
  if (section === "auth" && currentUser && !options.allowAuth) {
    return "profile";
  }
  return section;
}

function setActiveSection(section, options = {}) {
  const target = resolveSectionTarget(section, options);
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
  authOnlySections.forEach((panel) => {
    panel.classList.toggle("hidden", target !== "auth");
  });
  menuButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.section === target);
  });
  // Update mobile nav active state
  const mobileNavItems = Array.from(document.querySelectorAll(".mobile-nav-item"));
  mobileNavItems.forEach((button) => {
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
  if (target === "leaderboards" && currentUser) {
    loadLeaderboards();
    return;
  }
  if (target === "results" && currentUser) {
    loadResultsHistory();
  }
}

function openMenuDrawer() {
  document.body.classList.add("menu-drawer-open");
  if (window.Haptics) Haptics.light();
  if (menuToggleButton) {
    menuToggleButton.setAttribute("aria-expanded", "true");
  }
  if (menuScrim) {
    menuScrim.classList.remove("hidden");
  }
}

function closeMenuDrawer() {
  document.body.classList.remove("menu-drawer-open");
  if (window.Haptics) Haptics.light();
  if (menuToggleButton) {
    menuToggleButton.setAttribute("aria-expanded", "false");
  }
  if (menuScrim) {
    menuScrim.classList.add("hidden");
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

  // Update mobile bottom nav visibility
  const mobileBottomNav = document.getElementById("mobile-bottom-nav");
  if (mobileBottomNav) {
    if (isLoggedIn) {
      mobileBottomNav.classList.remove("hidden");
    } else {
      mobileBottomNav.classList.add("hidden");
    }
  }

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

const navAuthBtns   = document.getElementById("nav-auth-btns");
const navProfileBtn = document.getElementById("nav-profile-btn");
const navMenuBalance = document.getElementById("menu-balance");


function updateNavAuthState(user) {
  const loggedIn = Boolean(user);
  if (navAuthBtns)   navAuthBtns.classList.toggle("hidden", loggedIn);
  if (navProfileBtn) navProfileBtn.classList.toggle("hidden", !loggedIn);
  if (navMenuBalance) navMenuBalance.classList.toggle("hidden", !loggedIn);
  document.body.classList.toggle("landing-mobile-nav-hidden", !loggedIn);
  if (!loggedIn) {
    closeMenuDrawer();
  }
}

document.getElementById("nav-login-btn")?.addEventListener("click", () => {
  setActiveSection("auth", { allowAuth: true });
  document.getElementById("login-form")?.scrollIntoView({ behavior: "smooth" });
});
document.getElementById("nav-signup-btn")?.addEventListener("click", () => openWizard("basic"));

function setAuthState(user) {
  currentUser = user;
  updateNavAuthState(user);

  if (user) {
    updateProfileUI(user);
    updateQueueBalance();
    updateQueueProfileCheck();
    startQueuePolling();
    refreshShop();
  } else {
    updateQueueBalance();
    updateQueueProfileCheck();
    renderProfileReadiness(null);
    renderWalletSummary(null);
    renderQueueInsights({});
    renderLeaderboardRewardClaim([]);
    renderDailyRewards(null);
    if (profileDisplayName) profileDisplayName.textContent = "—";
    profileEmail.textContent = "—";
    if (profileUsername) profileUsername.value = "";
    profileTag.value = "";
    profileLink.value = "";
    statMatches.textContent = "0";
    if (statCoins) statCoins.textContent = "0";
    if (statBalance) statBalance.textContent = "0";
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
    if (balanceBalance) balanceBalance.textContent = "0";
    if (shopCoinsEl) shopCoinsEl.textContent = "0";
    if (shopBalanceEl) shopBalanceEl.textContent = "0";
    if (mobileWalletCoinsEl) mobileWalletCoinsEl.textContent = "0";
    if (mobileWalletBalanceEl) mobileWalletBalanceEl.textContent = "0";
    if (shopMessageEl) shopMessageEl.textContent = "";
    if (coinGemMessageEl) coinGemMessageEl.textContent = "";
    if (dailyRewardMessageEl) dailyRewardMessageEl.textContent = "";
    if (shopAmountInput) shopAmountInput.value = "";
    if (shopBalancePreview) shopBalancePreview.textContent = "0";
    if (shopMobileAmount) shopMobileAmount.textContent = "10.00";
    if (shopMobileBalancePreview) shopMobileBalancePreview.textContent = "1000";
    if (mobileDepositAmountEl) mobileDepositAmountEl.textContent = "10.00";
    if (mobileDepositBalanceEl) mobileDepositBalanceEl.textContent = "1000";
    if (mobileKeypadMessageEl) {
      mobileKeypadMessageEl.textContent = "Minimum deposit: $10.00.";
      mobileKeypadMessageEl.classList.remove("error");
    }
    closeMobileDepositSheet();
    if (cashoutAmountInput) cashoutAmountInput.value = "";
    if (cashoutBalancePreview) cashoutBalancePreview.textContent = "0";
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
    if (coinGemTradeBtn) coinGemTradeBtn.disabled = true;
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
  if (statBalance) statBalance.textContent = formatUsd(user.balance ?? 0);
  if (balanceCoins) balanceCoins.textContent = coins;
  if (balanceBalance) balanceBalance.textContent = formatUsd(user.balance ?? 0);
  if (shopCoinsEl) shopCoinsEl.textContent = coins;
  if (shopBalanceEl) shopBalanceEl.textContent = formatUsd(user.balance ?? 0);
  if (mobileWalletCoinsEl) mobileWalletCoinsEl.textContent = coins;
  if (mobileWalletBalanceEl) mobileWalletBalanceEl.textContent = formatUsd(user.balance ?? 0);
  updateCoinGemTradeState(user);
  renderProfileReadiness(user);
  renderWalletSummary(user);
  renderDailyRewards(user);
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
      // isUltimateChampion is the reliable flag — use it as an override so
      // stale cached profiles that stored "Champion" still show correctly.
      const leagueName = playerProfile.isUltimateChampion
        ? "Ultimate Champion"
        : (playerProfile.highestLeagueName || "Unranked");
      profileHighestLeague.replaceChildren(createLeagueBadge(leagueName));
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
  updateReferralUI(user);
  updateQueueBalance();
  updateQueueProfileCheck();
}

// ── Referral UI ─────────────────────────────────────────────────────────────
function updateReferralUI(user) {
  const codeEl   = document.getElementById("referral-code-display");
  const linkEl   = document.getElementById("referral-link-display");
  const invited  = document.getElementById("referral-invited-count");
  const completed = document.getElementById("referral-completed-count");
  const earned   = document.getElementById("referral-earned-count");

  const code = user?.referralCode || "";
  const link = code ? `${window.location.origin}/?ref=${code}` : "";

  if (codeEl) codeEl.textContent = code || "—";
  if (linkEl) { linkEl.textContent = link || "—"; linkEl.dataset.link = link; }
  if (invited)   invited.textContent   = (user?.referralCount || 0).toLocaleString();
  if (completed) completed.textContent = (user?.referralCompletedCount || 0).toLocaleString();
  if (earned)    earned.textContent    = ((user?.referralCompletedCount || 0) * 1500).toLocaleString();
}

function copyReferralText(text, btn) {
  if (!text || text === "—") return;
  navigator.clipboard.writeText(text).then(() => {
    const icon = btn.querySelector("svg");
    if (icon) {
      // swap to checkmark briefly
      const prev = icon.innerHTML;
      icon.innerHTML = '<polyline points="20 6 9 17 4 12"/>';
      btn.classList.add("copied");
      setTimeout(() => { icon.innerHTML = prev; btn.classList.remove("copied"); }, 1800);
    }
  }).catch(() => {});
}

document.getElementById("referral-copy-code-btn")?.addEventListener("click", () => {
  const code = document.getElementById("referral-code-display")?.textContent;
  copyReferralText(code, document.getElementById("referral-copy-code-btn"));
});
document.getElementById("referral-copy-link-btn")?.addEventListener("click", () => {
  const link = document.getElementById("referral-link-display")?.dataset.link || "";
  copyReferralText(link, document.getElementById("referral-copy-link-btn"));
});

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
  if (cashoutBalancePreview) cashoutBalancePreview.textContent = formatUsd(safeCents);
  if (cashoutUsdPreview) cashoutUsdPreview.textContent = (safeCents / 100).toFixed(2);
}

function updateCoinGemTradeState(user) {
  if (!coinGemTradeBtn) return;
  const coins = user?.coins ?? user?.credits ?? 0;
  const canTrade = Boolean(user) && coins >= COIN_TO_BALANCE_COINS;
  coinGemTradeBtn.disabled = !canTrade;
  if (!canTrade && coinGemMessageEl && !coinGemMessageEl.textContent) {
    coinGemMessageEl.textContent = `You need ${COIN_TO_BALANCE_COINS} coins to trade.`;
  }
  if (canTrade && coinGemMessageEl && /need \d+ coins/i.test(coinGemMessageEl.textContent)) {
    coinGemMessageEl.textContent = "";
  }
}

function formatRewardLabel(reward) {
  if (!reward) return "—";
  if (reward.currency === "balance") return formatUsd(Number(reward.amount || 0));
  return `${Number(reward.amount || 0).toLocaleString("en-US")} coins`;
}

function renderDailyRewards(user) {
  if (
    !dailyRewardsTrackEl ||
    !dailyRewardStreakEl ||
    !dailyRewardStatusEl ||
    !dailyRewardNextEl ||
    !dailyRewardNextSubtextEl ||
    !dailyRewardClaimBtn
  ) {
    return;
  }

  const fallbackState = {
    streak: 0,
    canClaim: false,
    claimedToday: false,
    streakBroken: false,
    nextRewardDay: 1,
    nextReward: DAILY_REWARD_SCHEDULE[0],
    completedInCycle: 0,
    claimedDays: DAILY_REWARD_SCHEDULE.map((reward, index) => ({
      ...reward,
      status: "upcoming",
      isNext: index === 0,
    })),
  };
  const state = user?.dailyRewards || fallbackState;
  const nextReward = state.nextReward || DAILY_REWARD_SCHEDULE[0];

  const streakCount = Number(state.streak || 0);
  dailyRewardStreakEl.textContent = `${streakCount} ${streakCount === 1 ? "day" : "days"}`;
  dailyRewardNextEl.textContent = formatRewardLabel(nextReward);

  let statusText = "Claim today to start your streak.";
  let nextText = `Day ${state.nextRewardDay || 1} reward is ready to claim.`;

  if (!user) {
    statusText = "Log in to start your daily reward streak.";
    nextText = "Day 1 reward unlocks after login.";
  } else if (state.claimedToday) {
    statusText = `Day ${state.completedInCycle || state.nextRewardDay || 1} claimed. Come back tomorrow to keep the streak alive.`;
    nextText = `Tomorrow unlocks Day ${state.nextRewardDay || 1}.`;
  } else if (state.streakBroken) {
    statusText = "You missed a day, so the streak reset.";
    nextText = "Claim Day 1 to start a new 5-day run.";
  } else if ((state.streak || 0) > 0) {
    statusText = `${state.streak}-day streak active.`;
    nextText = `Claim Day ${state.nextRewardDay || 1} next.`;
  }

  dailyRewardStatusEl.textContent = statusText;
  dailyRewardNextSubtextEl.textContent = nextText;

  dailyRewardsTrackEl.innerHTML = "";
  (state.claimedDays || DAILY_REWARD_SCHEDULE).forEach((reward) => {
    const item = document.createElement("div");
    const status = reward.status || "upcoming";
    item.className = `daily-reward-day is-${status}`;
    if (reward.isNext) {
      item.classList.add("is-next");
    }

    const rewardLabel = formatRewardLabel(reward);
    item.innerHTML =
      `<span class="daily-reward-day-label">Day ${reward.day}</span>` +
      `<strong class="daily-reward-day-value">${rewardLabel}</strong>` +
      `<span class="daily-reward-day-state">${
        status === "claimed"
          ? "Claimed"
          : reward.isNext && state.canClaim
            ? "Ready"
            : "Locked"
      }</span>`;
    dailyRewardsTrackEl.appendChild(item);
  });

  dailyRewardClaimBtn.disabled = !user || !state.canClaim;
  dailyRewardClaimBtn.textContent = !user
    ? "Log In to Claim"
    : state.canClaim
      ? `Claim Day ${state.nextRewardDay || 1} Reward`
      : "Claimed Today";
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-US");
}

function renderWalletSummary(user) {
  const summary = user?.walletSummary || {};
  if (walletCoinsWonEl) {
    walletCoinsWonEl.textContent = formatNumber(summary.coinsWon || 0);
  }
  if (walletBalanceWonEl) {
    walletBalanceWonEl.textContent = formatUsd(summary.balanceWon || 0);
  }
  if (walletBalanceCashedOutEl) {
    walletBalanceCashedOutEl.textContent = formatUsd(summary.balanceCashedOut || 0);
  }
  if (walletFeesPaidEl) {
    walletFeesPaidEl.textContent = `${formatNumber(summary.feesPaidCoins || 0)} coins · ${formatUsd(summary.feesPaidBalance || 0)}`;
  }
  if (walletCashableEl) {
    walletCashableEl.textContent = formatUsd(summary.cashableUsdCents || 0);
  }
  if (walletCashableSubtextEl) {
    walletCashableSubtextEl.textContent = summary.readyToCashOut
      ? `${formatUsd(summary.cashableBalance || 0)} are ready to cash out.`
      : `Build to ${formatUsd(MIN_CASHOUT_CENTS)} to unlock cash out.`;
  }
  if (walletAlertEl) {
    walletAlertEl.textContent = summary.readyToCashOut
      ? `You have ${formatUsd(summary.cashableUsdCents || 0)} ready to cash out.`
      : "Keep building your balance.";
    walletAlertEl.classList.toggle("ready", Boolean(summary.readyToCashOut));
  }
}

function renderQueueInsights(meta = {}) {
  if (!queueInsightsEl) return;
  const activePlayers = Number(meta.activePlayers || 0);
  const waitEstimate = meta.waitEstimate || "~8-10 min";
  const exactWagerCount = Number(meta.exactWagerCount || 0);
  const tip = meta.tip || "Post your challenge to get on the board.";
  queueInsightsEl.innerHTML = "";

  [
    {
      label: "Active now",
      value: activePlayers > 0 ? formatNumber(activePlayers) : "0",
      note: activePlayers === 1 ? "player in queue or a live match" : "players in queue or live matches",
    },
    {
      label: "Est. wait",
      value: waitEstimate,
      note: exactWagerCount > 0 ? "based on players already near your wager" : "based on current queue activity",
    },
    {
      label: "Queue tip",
      value: exactWagerCount > 0 ? "Hot lobby" : "Adjustment",
      note: tip,
    },
  ].forEach((item) => {
    const card = document.createElement("div");
    card.className = "queue-insight-card";
    card.innerHTML =
      `<p class="queue-insight-label">${item.label}</p>` +
      `<p class="queue-insight-value">${item.value}</p>` +
      `<p class="queue-insight-note">${item.note}</p>`;
    queueInsightsEl.appendChild(card);
  });
}

async function loadExchangeRate() {
  try {
    const data = await apiRequest("/api/shop/exchange/rate", { method: "GET" });
    if (Number.isFinite(data?.coins) && data.coins > 0) {
      COIN_TO_BALANCE_COINS = data.coins;
      COIN_TO_GEM_COINS = data.coins;
    }
    if (Number.isFinite(data?.balance) && data.balance > 0) {
      COIN_TO_BALANCE_BALANCE = data.balance;
      COIN_TO_GEM_GEMS = data.balance;
    }
  } catch (err) {
    // Keep defaults if unavailable
  }
  if (exchangeCoinsEl) exchangeCoinsEl.textContent = formatNumber(COIN_TO_BALANCE_COINS);
  if (exchangeBalanceEl) exchangeBalanceEl.textContent = formatUsd(COIN_TO_BALANCE_BALANCE);
  if (exchangeCtaCoinsEl) exchangeCtaCoinsEl.textContent = formatNumber(COIN_TO_BALANCE_COINS);
  if (exchangeCtaBalanceEl) exchangeCtaBalanceEl.textContent = formatUsd(COIN_TO_BALANCE_BALANCE);
  updateCoinBalanceTradeState(currentUser);
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
    amount.textContent = `${formatUsd(entry.amountCents)} (${formatUsd(entry.balance)})`;
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
  updateCoinGemTradeState(currentUser);
  renderWalletSummary(currentUser);
  renderDailyRewards(currentUser);
  if (shopMessageEl) shopMessageEl.textContent = "";
  if (coinGemMessageEl) coinGemMessageEl.textContent = "";
  if (dailyRewardMessageEl) dailyRewardMessageEl.textContent = "";
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
      showStatus("Payment completed. Log in to sync your balance.", true);
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
        if (window.Haptics) Haptics.win();
      }
      if (shopMessageEl) {
        shopMessageEl.textContent =
          data?.message || "Payment confirmed and balance were updated.";
      }
    } catch (err) {
      if (shopMessageEl) shopMessageEl.textContent = err.message;
      if (window.Haptics) Haptics.error();
    }
    clearShopQueryParams();
  }
}

async function startCheckoutWithCents(cents) {
  if (!currentUser) {
    showStatus("Log in to purchase balance.", true);
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
    showStatus("Log in to purchase balance.", true);
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
    showStatus("Log in to cash out balance.", true);
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
    showStatus("Log in to cash out balance.", true);
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
  if ((currentUser?.balance || 0) < cents) {
    if (cashoutMessageEl) cashoutMessageEl.textContent = "Not enough balance for that cash out.";
    if (window.Haptics) Haptics.error();
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
      if (window.Haptics) Haptics.win();
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
    if (window.Haptics) Haptics.error();
  } finally {
    if (cashoutSubmitBtn) cashoutSubmitBtn.disabled = false;
  }
}

async function tradeCoinsForBalance() {
  if (!currentUser) {
    showStatus("Log in to trade coins for balance.", true);
    return;
  }
  const coins = currentUser.coins ?? currentUser.credits ?? 0;
  if (coins < COIN_TO_GEM_COINS) {
    if (coinGemMessageEl) {
      coinGemMessageEl.textContent = `You need ${COIN_TO_GEM_COINS} coins to trade.`;
    }
    return;
  }
  if (coinGemMessageEl) coinGemMessageEl.textContent = "Processing trade...";
  if (coinGemTradeBtn) coinGemTradeBtn.disabled = true;
  try {
    const data = await apiRequest("/api/shop/exchange", {
      method: "POST",
      body: JSON.stringify({}),
    });
    if (data?.user) {
      currentUser = data.user;
      updateProfileUI(currentUser);
    }
    if (coinGemMessageEl) {
      coinGemMessageEl.textContent =
        data?.message || `Traded ${COIN_TO_GEM_COINS} coins for ${COIN_TO_GEM_GEMS} balance.`;
    }
  } catch (err) {
    if (coinGemMessageEl) coinGemMessageEl.textContent = err.message;
  } finally {
    updateCoinGemTradeState(currentUser);
  }
}

async function claimDailyReward() {
  if (!currentUser) {
    showStatus("Log in to claim daily rewards.", true);
    return;
  }
  if (dailyRewardMessageEl) dailyRewardMessageEl.textContent = "Claiming reward...";
  if (dailyRewardClaimBtn) dailyRewardClaimBtn.disabled = true;
  try {
    const data = await apiRequest("/api/shop/daily-rewards/claim", {
      method: "POST",
      body: JSON.stringify({}),
    });
    if (data?.user) {
      currentUser = data.user;
      updateProfileUI(currentUser);
    }
    if (dailyRewardMessageEl) {
      dailyRewardMessageEl.textContent =
        data?.message || "Daily reward claimed.";
    }
  } catch (err) {
    if (dailyRewardMessageEl) {
      dailyRewardMessageEl.textContent = err.message || "Unable to claim daily reward.";
    }
  } finally {
    renderDailyRewards(currentUser);
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

function renderLeaderboardPrizeSchedule(currency, prizes = []) {
  if (!leaderboardPrizesEl) return;
  leaderboardPrizesEl.innerHTML = "";
  if (!Array.isArray(prizes) || prizes.length === 0) {
    leaderboardPrizesEl.classList.add("hidden");
    return;
  }
  leaderboardPrizesEl.classList.remove("hidden");
  prizes.forEach((prize) => {
    const pill = document.createElement("div");
    pill.className = `leaderboard-prize-pill rank-${prize.rank}`;
    pill.innerHTML =
      `<span class="prize-rank">#${prize.rank}</span>` +
      `<span class="prize-amount">${Number(prize.amount || 0).toLocaleString()} ${prize.currency || currency}</span>`;
    leaderboardPrizesEl.appendChild(pill);
  });
}

function formatRewardSummary(rewards = []) {
  if (!Array.isArray(rewards) || rewards.length === 0) return "";
  const totals = rewards.reduce(
    (acc, reward) => {
      if (reward?.currency === "balance") {
        acc.balance += Number(reward.amount || 0);
      } else {
        acc.coins += Number(reward.amount || 0);
      }
      return acc;
    },
    { coins: 0, balance: 0 }
  );
  const parts = [];
  if (totals.coins > 0) parts.push(`${formatNumber(totals.coins)} coins`);
  if (totals.balance > 0) parts.push(`${formatNumber(totals.balance)} balance`);
  return parts.join(" + ");
}

function renderLeaderboardRewardClaim(pendingRewards = []) {
  if (
    !leaderboardRewardClaimEl ||
    !leaderboardRewardTitleEl ||
    !leaderboardRewardCopyEl ||
    !leaderboardRewardClaimBtn
  ) {
    return;
  }

  if (!Array.isArray(pendingRewards) || pendingRewards.length === 0) {
    leaderboardRewardClaimEl.classList.add("hidden");
    leaderboardRewardCopyEl.textContent = "";
    return;
  }

  const rewardCount = pendingRewards.length;
  const summary = formatRewardSummary(pendingRewards);
  leaderboardRewardClaimEl.classList.remove("hidden");
  leaderboardRewardTitleEl.textContent =
    rewardCount === 1 ? "Claim your leaderboard reward" : `Claim ${rewardCount} leaderboard rewards`;
  leaderboardRewardCopyEl.textContent =
    rewardCount === 1
      ? `${summary} is ready to claim from your top-5 finish.`
      : `${summary} is ready to claim across your weekly and monthly finishes.`;
  leaderboardRewardClaimBtn.textContent =
    rewardCount === 1 ? `Claim ${summary}` : `Claim ${summary}`;
}

function renderLeaderboards(data) {
  if (!leaderboardsBodyEl) return;
  leaderboardsBodyEl.innerHTML = "";
  const currency = data?.currency === "balance" ? "balance" : "coins";
  const period = data?.period || "month";
  const entries = Array.isArray(data?.entries) ? data.entries : [];
  const prizeSchedule = Array.isArray(data?.prizeSchedule) ? data.prizeSchedule : [];
  const showWinningsColumn = !(
    currency === "balance" && (period === "year" || period === "all")
  );
  renderLeaderboardRewardClaim(data?.pendingRewards || []);
  if (leaderboardsLabelEl) {
    leaderboardsLabelEl.textContent = data?.label || "This month";
  }
  if (leaderboardsMessageEl) {
    leaderboardsMessageEl.textContent = entries.length
      ? ""
      : `No ${currency} winners recorded for this period yet.`;
  }
  if (leaderboardWinningsHeaderEl) {
    leaderboardWinningsHeaderEl.hidden = !showWinningsColumn;
    leaderboardWinningsHeaderEl.textContent =
      currency === "balance" ? "Balance Won" : "Coins Won";
  }
  renderLeaderboardPrizeSchedule(currency, prizeSchedule);

  entries.forEach((entry) => {
    const row = document.createElement("tr");
    row.innerHTML = showWinningsColumn
      ? `
        <td>${entry.rank}</td>
        <td>${entry.username || "Unknown"}</td>
        <td>${entry.tag || "—"}</td>
        <td>${Number(entry.wins || 0).toLocaleString()}</td>
        <td>${Number(entry.winnings || 0).toLocaleString()} ${currency}</td>
      `
      : `
        <td>${entry.rank}</td>
        <td>${entry.username || "Unknown"}</td>
        <td>${entry.tag || "—"}</td>
        <td>${Number(entry.wins || 0).toLocaleString()}</td>
      `;
    leaderboardsBodyEl.appendChild(row);
  });

  if (prizeSchedule.length) {
    const existingRanks = new Set(entries.map((entry) => Number(entry.rank)));
    prizeSchedule.forEach((prize) => {
      if (existingRanks.has(prize.rank)) return;
      const row = document.createElement("tr");
      row.className = `leaderboard-placeholder-row rank-${prize.rank}`;
      row.innerHTML = `
        <td>${prize.rank}</td>
        <td>--</td>
        <td>--</td>
        <td>--</td>
        <td>Win ${Number(prize.amount || 0).toLocaleString()} ${prize.currency || currency}</td>
      `;
      leaderboardsBodyEl.appendChild(row);
    });
  }
}

async function loadLeaderboards() {
  if (!currentUser) return;
  if (leaderboardsMessageEl) {
    leaderboardsMessageEl.textContent = "Loading leaderboard...";
  }
  try {
    const data = await apiRequest(
      `/api/leaderboards?currency=${encodeURIComponent(
        leaderboardCurrency
      )}&period=${encodeURIComponent(leaderboardPeriod)}`,
      { method: "GET" }
    );
    renderLeaderboards(data);
  } catch (err) {
    if (leaderboardsBodyEl) leaderboardsBodyEl.innerHTML = "";
    renderLeaderboardRewardClaim([]);
    if (leaderboardsMessageEl) {
      leaderboardsMessageEl.textContent = err.message;
    }
    if (leaderboardPrizesEl) leaderboardPrizesEl.classList.add("hidden");
  }
}

async function claimLeaderboardRewards() {
  if (!currentUser) {
    showStatus("Log in to claim leaderboard rewards.", true);
    return;
  }
  if (leaderboardRewardClaimBtn) {
    leaderboardRewardClaimBtn.disabled = true;
    leaderboardRewardClaimBtn.textContent = "Claiming...";
  }
  try {
    const data = await apiRequest("/api/leaderboards/claim", {
      method: "POST",
      body: JSON.stringify({}),
    });
    if (data?.user) {
      currentUser = data.user;
      updateProfileUI(currentUser);
    }
    renderLeaderboardRewardClaim(data?.pendingRewards || []);
    await loadLeaderboards();
    showStatus(data?.message || "Leaderboard rewards claimed.");
  } catch (err) {
    showStatus(err.message || "Unable to claim leaderboard rewards.", true);
  } finally {
    if (leaderboardRewardClaimBtn) {
      leaderboardRewardClaimBtn.disabled = false;
    }
  }
}

registerForm?.addEventListener("submit", async (event) => {
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
  const trailingChars = "),.;!?";
  let end = candidate.length;
  while (end > 0 && trailingChars.includes(candidate[end - 1])) {
    end -= 1;
  }
  return candidate.slice(0, end);
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

  if (battle.settlement) {
    const settlement = document.createElement("div");
    settlement.className = "battle-settlement";

    const wagerLine = document.createElement("p");
    wagerLine.className = "battle-settlement-line";
    wagerLine.innerHTML = `<span>Wager</span><strong>${formatNumber(
      battle.settlement.wager || 0
    )} ${battle.settlement.wagerCurrency || "coins"}</strong>`;

    const payoutLine = document.createElement("p");
    payoutLine.className = "battle-settlement-line";
    payoutLine.innerHTML = `<span>Winner payout</span><strong>${formatNumber(
      battle.settlement.payout || 0
    )} ${battle.settlement.payoutCurrency || battle.settlement.wagerCurrency || "coins"}</strong>`;

    const feeLine = document.createElement("p");
    feeLine.className = "battle-settlement-line";
    feeLine.innerHTML = `<span>Platform fee</span><strong>${formatNumber(
      battle.settlement.fee || 0
    )} ${battle.settlement.feeCurrency || battle.settlement.wagerCurrency || "coins"}</strong>`;

    const summary = document.createElement("p");
    summary.className = `battle-settlement-summary ${
      battle.settlement.result === "win"
        ? "win"
        : battle.settlement.result === "loss"
          ? "loss"
          : ""
    }`;
    summary.textContent = battle.settlement.headline || "Match settled.";

    settlement.append(wagerLine, payoutLine, feeLine, summary);
    card.appendChild(settlement);
  }

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
  if (cancelQueueBtn) cancelQueueBtn.disabled = !isWaiting;
  if (refreshQueueBtn) refreshQueueBtn.disabled = isWaiting;
  currencyButtons.forEach((button) => {
    button.disabled = isWaiting;
  });
  if (wagerInput) {
    wagerInput.disabled = isWaiting;
  }
  document.body.classList.toggle("in-queue", isWaiting);
}

function resetMatch() {
  currentMatchId = null;
  if (matchIdEl) matchIdEl.textContent = "No active match";
  if (matchPlayersEl) matchPlayersEl.innerHTML = "";
  if (trackBattleBtn) trackBattleBtn.disabled = true;
  if (matchEmptyEl) matchEmptyEl.classList.remove("hidden");
  if (matchPotEl) matchPotEl.textContent = "0";
  if (matchWinnerPayoutEl) matchWinnerPayoutEl.textContent = "0";
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
  const winnerPayout =
    pot === null
      ? `${Math.floor(opponentWager * WINNER_PCT_CLIENT)} ${
          opponent?.wagerCurrency || matchCurrency
        }`
      : `${Math.floor(pot * WINNER_PCT_CLIENT)} ${matchCurrency}`;
  if (matchPotEl) {
    matchPotEl.textContent =
      pot === null ? "Mixed" : `${pot} ${matchCurrency}`;
  }
  if (matchWinnerPayoutEl) {
    matchWinnerPayoutEl.textContent = winnerPayout;
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
    if (!isYou) {
      // Opponent card — big "Add Friend" CTA that deep-links into the CR app
      if (player.friendLink) {
        const trimmed = extractUrlFromText(player.friendLink);
        const isUrl = /^https?:\/\//i.test(trimmed);
        if (isUrl) {
          const addBtn = document.createElement("a");
          addBtn.className = "add-friend-btn";
          addBtn.href = trimmed;
          addBtn.target = "_blank";
          addBtn.rel = "noopener noreferrer";
          addBtn.innerHTML =
            `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" ` +
            `fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" ` +
            `stroke-linejoin="round" aria-hidden="true">` +
            `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>` +
            `<circle cx="9" cy="7" r="4"/>` +
            `<line x1="19" y1="8" x2="19" y2="14"/>` +
            `<line x1="22" y1="11" x2="16" y2="11"/>` +
            `</svg>Add Friend in Clash Royale`;
          linkLine.appendChild(addBtn);
        } else {
          // Non-URL link text — show as plain text fallback
          linkLine.className = "player-link";
          linkLine.textContent = trimmed;
        }
      } else {
        linkLine.className = "player-link missing";
        linkLine.textContent = "Friend link not available.";
      }
    } else {
      // Your own card — just confirm your link was shared
      const note = document.createElement("span");
      note.className = "your-link-shared";
      note.textContent = "✓ Your link has been shared with your opponent";
      linkLine.appendChild(note);
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
    const params = new URLSearchParams({
      currency: selectedCurrency || "coins",
      wager: String(Math.max(0, Math.floor(Number(wagerInput?.value) || 0))),
    });
    const data = await apiRequest(`/api/queue/list?${params.toString()}`, {
      method: "GET",
    });
    renderQueueList(data.entries || []);
    renderQueueInsights(data.meta || {});
    if (currentTicketId) {
      const count = (data.entries || []).length;
      queueCountEl.textContent = `${count} waiting`;
      queueCountEl.classList.toggle("has-players", count > 0);
    }
    // Update "last refreshed" indicator
    queueLastUpdated = Date.now();
    const updatedEl = document.getElementById("queue-last-updated");
    if (updatedEl) {
      updatedEl.textContent = "Updated just now";
      if (queueLastUpdatedTimer) clearInterval(queueLastUpdatedTimer);
      queueLastUpdatedTimer = setInterval(() => {
        if (!updatedEl) return;
        const secs = Math.round((Date.now() - queueLastUpdated) / 1000);
        if (secs < 60) {
          updatedEl.textContent = `Updated ${secs}s ago`;
        } else {
          updatedEl.textContent = `Updated ${Math.round(secs / 60)}m ago`;
          clearInterval(queueLastUpdatedTimer);
        }
      }, 1000);
    }
  } catch (err) {
    // Quietly ignore queue list errors.
  }
}

function renderQueueList(entries) {
  if (!queueListEl || !queueCountEl || !queueEmptyEl) return;
  queueListEl.innerHTML = "";
  if (!entries.length) {
    queueCountEl.textContent = "Open";
    queueCountEl.classList.remove("has-players");
    queueEmptyEl.classList.remove("hidden");
    return;
  }
  queueEmptyEl.classList.add("hidden");
  queueCountEl.textContent = `${entries.length} waiting`;
  queueCountEl.classList.add("has-players");

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
    const league = entry.profile?.isUltimateChampion
      ? "Ultimate Champion"
      : normalizeLeagueName(entry.profile?.highestLeagueName || "Unranked");
    if (entry.profile) {
      meta.append(
        `${entry.tag} · ${entry.profile.trophies ?? 0} trophies · `,
        createLeagueBadge(league),
        ` · ${record}`
      );
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
      const league = currentUser.playerProfile?.isUltimateChampion
        ? "Ultimate Champion"
        : normalizeLeagueName(currentUser.playerProfile?.highestLeagueName || "Unranked");
      meta.append(
        `${currentUser.tag || "No tag"} · ${
          currentUser.playerProfile.trophies ?? 0
        } trophies · `,
        createLeagueBadge(league),
        ` · ${wins}W-${losses}L-${draws}D`
      );
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
    queueCountEl.classList.add("has-players");
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
  const availableBalance = currentUser.balance ?? 0;
  const availableFunds =
    selectedCurrency === "balance" ? availableBalance : availableCoins;
  if (wager > availableFunds) {
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

    const settlementHeadline =
      data?.battle?.settlement?.headline || "Friendly battle found. Loading full history...";
    setActiveSection("results");
    await loadResultsHistory();
    refreshProfile();
    showStatus(settlementHeadline);
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
    closeMenuDrawer();
  });
});

// Mobile bottom nav items
const mobileNavItems = Array.from(document.querySelectorAll(".mobile-nav-item"));
mobileNavItems.forEach((button) => {
  button.addEventListener("click", () => {
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

if (menuToggleButton) {
  menuToggleButton.addEventListener("click", () => {
    if (document.body.classList.contains("menu-drawer-open")) {
      closeMenuDrawer();
      return;
    }
    openMenuDrawer();
  });
}

if (menuCloseButton) {
  menuCloseButton.addEventListener("click", closeMenuDrawer);
}

if (menuScrim) {
  menuScrim.addEventListener("click", closeMenuDrawer);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenuDrawer();
  }
});

drawerAnchorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const anchorId = button.dataset.anchor;
    if (!anchorId) return;
    setActiveSection("auth", { allowAuth: true });
    closeMenuDrawer();
    window.requestAnimationFrame(() => {
      const target = document.getElementById(anchorId);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
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
      setActiveSection("auth", { allowAuth: true });
      closeMenuDrawer();
      window.requestAnimationFrame(() => {
        authPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }
    closeMenuDrawer();
    openOnboarding(currentUser.id, true);
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
  shopCheckoutBtn.addEventListener("click", () => {
    // Require KYC before real-money deposit
    if (!currentUser?.kycStatus || currentUser.kycStatus === "none") {
      if (shopMessageEl) {
        shopMessageEl.textContent = "Identity verification is required before depositing. Complete your account setup first.";
        shopMessageEl.className = "shop-message error";
      }
      setTimeout(() => openWizard("full"), 800);
      return;
    }
    startCheckout();
  });
}
if (coinGemTradeBtn) {
  coinGemTradeBtn.addEventListener("click", tradeCoinsForBalance);
}
if (dailyRewardClaimBtn) {
  dailyRewardClaimBtn.addEventListener("click", claimDailyReward);
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
    if (!currentUser?.kycStatus || currentUser.kycStatus === "none") {
      closeMobileDepositSheet();
      setTimeout(() => openWizard("full"), 300);
      return;
    }
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
if (leaderboardCurrencyButtons.length) {
  leaderboardCurrencyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      leaderboardCurrency =
        button.dataset.leaderboardCurrency === "balance" ? "balance" : "coins";
      leaderboardCurrencyButtons.forEach((candidate) => {
        candidate.classList.toggle(
          "active",
          candidate.dataset.leaderboardCurrency === leaderboardCurrency
        );
      });
      if (activeSection === "leaderboards") {
        loadLeaderboards();
      }
    });
  });
}
if (leaderboardPeriodButtons.length) {
  leaderboardPeriodButtons.forEach((button) => {
    button.addEventListener("click", () => {
      leaderboardPeriod = button.dataset.leaderboardPeriod || "month";
      leaderboardPeriodButtons.forEach((candidate) => {
        candidate.classList.toggle(
          "active",
          candidate.dataset.leaderboardPeriod === leaderboardPeriod
        );
      });
      if (activeSection === "leaderboards") {
        loadLeaderboards();
      }
    });
  });
}
if (leaderboardRewardClaimBtn) {
  leaderboardRewardClaimBtn.addEventListener("click", claimLeaderboardRewards);
}
if (wagerInput) {
  wagerInput.addEventListener("input", (event) => {
    updatePresetActive(event.target.value);
    updateWinPreview();
  });
}
if (wagerPresetButtons.length && wagerInput) {
  wagerPresetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const value = Number(button.dataset.wager);
      if (!Number.isFinite(value)) return;
      wagerInput.value = value;
      updatePresetActive(value);
      updateWinPreview();
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
loadExchangeRate();

// ══════════════════════════════════════════════════════════════════════════
// 7-STEP SIGNUP WIZARD
// ══════════════════════════════════════════════════════════════════════════

const BLOCKED_STATES = new Set([
  "AZ","AR","HI","ID","IL","IA","LA","MT","ND","NV","NY","PA","TN","TX","WA",
]);

const wizardEl        = document.getElementById("signup-wizard");
const wizardCard      = wizardEl?.querySelector(".signup-wizard-card");
const wizardCloseBtn  = document.getElementById("wizard-close");
const wizardBackBtn   = document.getElementById("wizard-back");
const wizardNextBtn   = document.getElementById("wizard-next");
const wizardStatusEl  = document.getElementById("wizard-status");
const wizardCounter   = document.getElementById("wizard-step-counter");
const wizardProgressbar = document.getElementById("wizard-progressbar");
const wizardFill      = document.getElementById("wizard-progress-fill");

let wizardStep = 1;
let wizardIdSkipped = false;
let wizardMode = "basic"; // "basic" (steps 1-3, coins only) | "full" (steps 4-7, real money)
const WIZARD_BASIC_TOTAL = 3;
const WIZARD_FULL_TOTAL  = 7;

// Collected data across steps
const wData = {
  state: "", ageConfirmed: false,
  username: "", email: "", password: "", referral: "",
  firstName: "", lastName: "", dob: "", address: "", city: "", zip: "", phone: "",
  ssn4: "", w9Confirmed: false,
  consentTos: false, consentPrivacy: false, consentRwp: false, consentState: false,
  depositLimit: 100,
  crTag: "", crLink: "",
};

function openWizard(mode = "basic") {
  if (!wizardEl) return;
  wizardMode = mode;
  wizardIdSkipped = false;
  wizardStep = mode === "full" ? 4 : 1;
  // Pre-fill referral code from URL ?ref= param
  if (mode === "basic" && wReferralInput && !wReferralInput.value) {
    const refParam = new URLSearchParams(window.location.search).get("ref");
    if (refParam) wReferralInput.value = refParam.toUpperCase();
  }
  goToStep(wizardStep);
  wizardEl.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeWizard() {
  if (!wizardEl) return;
  wizardEl.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

function goToStep(n) {
  for (let i = 1; i <= WIZARD_FULL_TOTAL; i++) {
    const el = document.getElementById(`ws-${i}`);
    if (el) el.classList.toggle("hidden", i !== n);
  }
  wizardStep = n;
  const isBasic = wizardMode === "basic";
  const total   = isBasic ? WIZARD_BASIC_TOTAL : (WIZARD_FULL_TOTAL - WIZARD_BASIC_TOTAL);
  const display = isBasic ? n : (n - WIZARD_BASIC_TOTAL);
  const isLast  = isBasic ? n === WIZARD_BASIC_TOTAL : n === WIZARD_FULL_TOTAL;
  const isFirst = isBasic ? n === 1 : n === 4;
  if (wizardCounter) wizardCounter.textContent = `Step ${display} of ${total}`;
  if (wizardFill) wizardFill.style.width = `${(display / total) * 100}%`;
  if (wizardProgressbar) wizardProgressbar.setAttribute("aria-valuenow", display);
  if (wizardBackBtn) wizardBackBtn.disabled = isFirst;
  if (wizardNextBtn) wizardNextBtn.textContent = isLast ? (isBasic ? "Start Playing" : "Complete Setup") : "Continue";
  const stepEl = document.getElementById(`ws-${n}`);
  if (stepEl) stepEl.scrollTop = 0;
}

function setWizardError(step, msg) {
  const el = document.getElementById(`ws${step}-error`);
  if (!el) return;
  el.textContent = msg;
  el.classList.toggle("hidden", !msg);
}

// Show an inline error directly below a specific field.
// errorId  – the <p class="field-error"> element id
// msg      – message string (empty string clears the error)
// inputId  – optional: the associated <input>/<select> id to highlight
function setFieldError(errorId, msg, inputId) {
  const errEl = document.getElementById(errorId);
  if (errEl) errEl.textContent = msg;
  if (inputId) {
    const inp = document.getElementById(inputId);
    if (inp) inp.classList.toggle("input-error", Boolean(msg));
  }
}

function setWizardLoading(isLoading) {
  if (wizardEl) wizardEl.classList.toggle("is-loading", isLoading);
  if (wizardStatusEl) {
    wizardStatusEl.textContent = isLoading ? "Working…" : "";
    wizardStatusEl.classList.toggle("hidden", !isLoading);
  }
  if (wizardProgressbar) wizardProgressbar.setAttribute("aria-busy", isLoading ? "true" : "false");
}

// ── Step 1: Eligibility ───────────────────────────────────────────────────
const wStateSelect    = document.getElementById("w-state");
const wJurisdictionMsg = document.getElementById("w-jurisdiction-msg");
const wDobInput       = document.getElementById("w-dob");

wStateSelect?.addEventListener("change", () => {
  const state = wStateSelect.value;
  if (!state || !wJurisdictionMsg) return;
  wJurisdictionMsg.classList.remove("hidden", "allowed", "blocked");
  if (BLOCKED_STATES.has(state)) {
    wJurisdictionMsg.textContent = "⚠ Skill-based wagering is not currently available in your state. You may browse but cannot wager real money.";
    wJurisdictionMsg.classList.add("blocked");
  } else {
    wJurisdictionMsg.textContent = "✓ BetRoyale is available in your state.";
    wJurisdictionMsg.classList.add("allowed");
  }
});

function validateStep1() {
  setFieldError("w-state-error", "", "w-state");
  setFieldError("w-age-error",   "", "w-dob");
  const state = wStateSelect?.value;
  if (!state) { setFieldError("w-state-error", "Please select your state.", "w-state"); return false; }
  if (BLOCKED_STATES.has(state)) { setFieldError("w-state-error", "Skill-based wagering is not available in your state.", "w-state"); return false; }
  const dob = wDobInput?.value;
  if (!dob) { setFieldError("w-age-error", "Please enter your date of birth.", "w-dob"); return false; }
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) { setFieldError("w-age-error", "Enter a valid date of birth.", "w-dob"); return false; }
  const ageMsec = Date.now() - birthDate.getTime();
  const ageYears = ageMsec / (1000 * 60 * 60 * 24 * 365.25);
  if (ageYears < 18) { setFieldError("w-age-error", "You must be 18 or older to use BetRoyale.", "w-dob"); return false; }
  wData.state = state;
  wData.dob = dob;
  wData.ageConfirmed = true;
  return true;
}

// ── Step 2: Credentials ───────────────────────────────────────────────────
const wUsernameInput  = document.getElementById("w-username");
const wEmailInput     = document.getElementById("w-email");
const wPasswordInput  = document.getElementById("w-password");
const wPasswordConfirm = document.getElementById("w-password-confirm");
const wReferralInput  = document.getElementById("w-referral");
const wPasswordToggle = document.getElementById("w-password-toggle");
const wStrengthFill   = document.getElementById("w-strength-fill");
const wStrengthLabel  = document.getElementById("w-strength-label");

wPasswordToggle?.addEventListener("click", () => {
  if (!wPasswordInput) return;
  const show = wPasswordInput.type === "password";
  wPasswordInput.type = show ? "text" : "password";
});

wPasswordInput?.addEventListener("input", () => {
  const pw = wPasswordInput.value;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const pcts  = ["0%", "25%", "50%", "75%", "100%"];
  const colors = ["", "#ef4444", "#f97316", "#eab308", "#f59e0b"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  if (wStrengthFill) { wStrengthFill.style.width = pcts[score]; wStrengthFill.style.background = colors[score]; }
  if (wStrengthLabel) wStrengthLabel.textContent = pw.length ? labels[score] : "";
});

async function validateStep2() {
  setFieldError("w-username-error", "", "w-username");
  setFieldError("w-email-error",    "", "w-email");
  setFieldError("w-password-error", "", "w-password");
  setFieldError("w-confirm-error",  "", "w-password-confirm");
  setFieldError("w-referral-error", "", "w-referral");
  const username = wUsernameInput?.value.trim() || "";
  const email    = wEmailInput?.value.trim() || "";
  const password = wPasswordInput?.value || "";
  const confirm  = wPasswordConfirm?.value || "";
  if (username.length < 3)  { setFieldError("w-username-error", "Username must be at least 3 characters.", "w-username"); return false; }
  if (username.length > 20) { setFieldError("w-username-error", "Username must be 20 characters or fewer.", "w-username"); return false; }
  if (!email.includes("@")) { setFieldError("w-email-error",    "Enter a valid email address.",             "w-email");    return false; }
  if (password.length < 6)  { setFieldError("w-password-error", "Password must be at least 6 characters.", "w-password"); return false; }
  if (password !== confirm)  { setFieldError("w-confirm-error",  "Passwords do not match.",                 "w-password-confirm"); return false; }
  wData.username = username; wData.email = email;
  wData.password = password; wData.referral = wReferralInput?.value.trim() || "";
  return true;
}

async function submitStep2() {
  const data = await apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      username: wData.username,
      email: wData.email,
      password: wData.password,
      referralCode: wData.referral || undefined,
    }),
  });
  setAuthState(data.user);
  // Show dev code if no email
  if (data.verificationCode) {
    setWizardError(3, `Dev mode — your code: ${data.verificationCode}`);
  }
  const emailDisplay = document.getElementById("w-verify-email-display");
  if (emailDisplay) emailDisplay.textContent = wData.email;
  return true;
}

// ── Step 3: Email Verification ────────────────────────────────────────────
const wVerifyCodeInput = document.getElementById("w-verify-code");
const wResendCodeBtn   = document.getElementById("w-resend-code");

wResendCodeBtn?.addEventListener("click", async () => {
  setWizardError(3, "");
  const res = await fetch("/api/auth/resend", { method: "POST", headers: { "Content-Type": "application/json" } });
  const data = await res.json();
  if (!res.ok) { setWizardError(3, data.error || "Could not resend code."); return; }
  setWizardError(3, data.verificationCode ? `Dev mode — new code: ${data.verificationCode}` : "Code resent — check your inbox.");
});

async function submitStep3() {
  setFieldError("w-verify-code-error", "", "w-verify-code");
  const code = wVerifyCodeInput?.value.trim() || "";
  if (code.length !== 6) { setFieldError("w-verify-code-error", "Enter the 6-digit code from your email.", "w-verify-code"); return false; }
  const res = await fetch("/api/auth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  const data = await res.json();
  if (!res.ok) { setFieldError("w-verify-code-error", data.error || "Verification failed.", "w-verify-code"); return false; }
  setAuthState(data.user);
  return true;
}

// ── Step 4: KYC ───────────────────────────────────────────────────────────
function validateStep4() {
  ["w-first-name-error","w-last-name-error","w-dob-error","w-address-error","w-city-error","w-zip-error","w-phone-error"]
    .forEach(id => setFieldError(id, "", id.replace("-error", "")));
  const firstName = document.getElementById("w-first-name")?.value.trim() || "";
  const lastName  = document.getElementById("w-last-name")?.value.trim() || "";
  const dob       = document.getElementById("w-dob")?.value || "";
  const address   = document.getElementById("w-address")?.value.trim() || "";
  const city      = document.getElementById("w-city")?.value.trim() || "";
  const zip       = document.getElementById("w-zip")?.value.trim() || "";
  const phone     = document.getElementById("w-phone")?.value.trim() || "";
  if (!firstName) { setFieldError("w-first-name-error", "Enter your legal first name.", "w-first-name"); return false; }
  if (!lastName)  { setFieldError("w-last-name-error",  "Enter your legal last name.",  "w-last-name");  return false; }
  if (!dob)       { setFieldError("w-dob-error",        "Enter your date of birth.",    "w-dob");        return false; }
  const age = (Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  if (age < 18)   { setFieldError("w-dob-error", "You must be 18 or older to continue.", "w-dob");       return false; }
  if (!address)   { setFieldError("w-address-error", "Enter your street address.",  "w-address");        return false; }
  if (!city)      { setFieldError("w-city-error",    "Enter your city.",            "w-city");           return false; }
  if (!zip)       { setFieldError("w-zip-error",     "Enter your ZIP code.",        "w-zip");            return false; }
  if (!phone)     { setFieldError("w-phone-error",   "Enter your phone number.",    "w-phone");          return false; }
  Object.assign(wData, { firstName, lastName, dob, address, city, zip, phone });
  return true;
}

async function submitStep4() {
  const res = await fetch("/api/auth/kyc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: wData.firstName, lastName: wData.lastName,
      dob: wData.dob, address: wData.address, city: wData.city,
      state: wData.state, zip: wData.zip, phone: wData.phone,
    }),
  });
  const data = await res.json();
  if (!res.ok) { setWizardError(4, data.error || "Could not save identity information."); return false; }
  setAuthState(data.user);
  return true;
}

// ── Step 5: ID Upload ─────────────────────────────────────────────────────
document.getElementById("w-id-front")?.addEventListener("change", (e) => {
  const name = e.target.files[0]?.name || "";
  const el = document.getElementById("id-front-name");
  if (el) el.textContent = name;
  document.getElementById("id-front-slot")?.classList.toggle("has-file", !!name);
});
document.getElementById("w-id-back")?.addEventListener("change", (e) => {
  const name = e.target.files[0]?.name || "";
  const el = document.getElementById("id-back-name");
  if (el) el.textContent = name;
  document.getElementById("id-back-slot")?.classList.toggle("has-file", !!name);
});
document.getElementById("w-id-skip")?.addEventListener("click", () => {
  wizardIdSkipped = true;
  setWizardError(5, "");
  advanceWizard();
});

// ── Step 6: Tax ───────────────────────────────────────────────────────────
async function validateStep6() {
  setFieldError("w-ssn4-error", "", "w-ssn4");
  setFieldError("w-w9-error",   "", "w-w9-confirm");
  const ssn4 = document.getElementById("w-ssn4")?.value.trim() || "";
  const confirmed = document.getElementById("w-w9-confirm")?.checked;
  if (!/^\d{4}$/.test(ssn4)) { setFieldError("w-ssn4-error", "Enter the last 4 digits of your SSN.", "w-ssn4"); return false; }
  if (!confirmed) { setFieldError("w-w9-error", "You must acknowledge the tax information statement.", "w-w9-confirm"); return false; }
  wData.ssn4 = ssn4; wData.w9Confirmed = true;
  return true;
}

async function submitStep6() {
  const res = await fetch("/api/auth/tax", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ssn4: wData.ssn4 }),
  });
  const data = await res.json();
  if (!res.ok) { setWizardError(6, data.error || "Could not save tax information."); return false; }
  return true;
}

// ── Step 7: Consent ───────────────────────────────────────────────────────
async function validateStep7() {
  setFieldError("w-consent-error", "");
  if (!document.getElementById("w-consent-tos")?.checked)     { setFieldError("w-consent-error", "You must agree to the Terms of Service."); return false; }
  if (!document.getElementById("w-consent-privacy")?.checked) { setFieldError("w-consent-error", "You must agree to the Privacy Policy."); return false; }
  if (!document.getElementById("w-consent-rwp")?.checked)     { setFieldError("w-consent-error", "You must agree to the Responsible Wagering Policy."); return false; }
  if (!document.getElementById("w-consent-state")?.checked)   { setFieldError("w-consent-error", "You must confirm your state eligibility."); return false; }
  wData.consentTos = wData.consentPrivacy = wData.consentRwp = wData.consentState = true;
  wData.depositLimit = Number(document.getElementById("w-deposit-limit")?.value) || 100;
  wData.crTag  = document.getElementById("w-cr-tag")?.value.trim() || "";
  wData.crLink = document.getElementById("w-cr-link")?.value.trim() || "";
  return true;
}

async function submitStep7() {
  const res = await fetch("/api/auth/consent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tos: true, privacy: true, rwp: true, stateConfirm: true,
      depositLimit: wData.depositLimit,
      dob: wData.dob || null,
      tag: wData.crTag, friendLink: wData.crLink,
    }),
  });
  const data = await res.json();
  if (!res.ok) { setWizardError(7, data.error || "Could not complete setup."); return false; }
  setAuthState(data.user);
  return true;
}

// ── Step 7 inline legal links ─────────────────────────────────────────────
document.querySelectorAll(".inline-link[data-legal]").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openLegalModal(btn.dataset.legal);
  });
});

// ── Wizard next / back wiring ─────────────────────────────────────────────
async function advanceWizard() {
  if (wizardNextBtn) { wizardNextBtn.disabled = true; wizardNextBtn.textContent = "Please wait…"; }
  setWizardLoading(true);
  try {
    let ok = true;
    if (wizardStep === 1) ok = validateStep1();
    if (wizardStep === 2) { ok = await validateStep2(); if (ok) ok = await submitStep2(); }
    if (wizardStep === 3) {
      ok = await submitStep3();
      if (ok) {
        // Basic signup complete — coins unlocked, real-money setup is optional later
        closeWizard();
        setActiveSection("profile");
        openOnboarding(currentUser?.id, true);
        return;
      }
    }
    if (wizardStep === 4) { ok = validateStep4(); if (ok) ok = await submitStep4(); }
    if (wizardStep === 5) { /* file upload optional; skip handled by w-id-skip btn */ }
    if (wizardStep === 6) { ok = await validateStep6(); if (ok) ok = await submitStep6(); }
    if (wizardStep === 7) {
      ok = await validateStep7();
      if (ok) ok = await submitStep7();
      if (ok) { closeWizard(); setActiveSection("shop"); return; }
    }
    if (ok) goToStep(wizardStep + 1);
  } catch (err) {
    const message = err?.message || "Something went wrong. Please try again.";
    setWizardError(wizardStep, message);
  } finally {
    setWizardLoading(false);
    if (wizardNextBtn) {
      wizardNextBtn.disabled = false;
      // Re-render label based on updated step
      const isLast = wizardMode === "basic" ? wizardStep === WIZARD_BASIC_TOTAL : wizardStep === WIZARD_FULL_TOTAL;
      wizardNextBtn.textContent = isLast ? (wizardMode === "basic" ? "Start Playing" : "Complete Setup") : "Continue";
    }
  }
}

wizardNextBtn?.addEventListener("click", advanceWizard);
wizardBackBtn?.addEventListener("click", () => { if (wizardStep > 1) goToStep(wizardStep - 1); });
wizardCloseBtn?.addEventListener("click", closeWizard);
wizardEl?.addEventListener("click", (e) => { if (e.target === wizardEl) closeWizard(); });

// Open wizard from hero and auth-panel buttons
document.getElementById("hero-signup-btn")?.addEventListener("click", () => openWizard("basic"));
document.getElementById("auth-signup-btn")?.addEventListener("click", () => openWizard("basic"));

// ── Cookie consent banner ─────────────────────────────────────────────────
(function initCookieBanner() {
  const banner = document.getElementById("cookie-banner");
  const acceptBtn = document.getElementById("cookie-accept");
  if (!banner) return;
  const showBanner = !localStorage.getItem("cookieConsent");
  document.body.classList.toggle("cookie-banner-active", showBanner);
  if (showBanner) {
    banner.classList.remove("hidden");
  }
  acceptBtn?.addEventListener("click", () => {
    localStorage.setItem("cookieConsent", "1");
    banner.classList.add("hidden");
    document.body.classList.remove("cookie-banner-active");
  });
})();

// ── Self-exclusion ────────────────────────────────────────────────────────
async function selfExclude() {
  const confirmed = window.confirm(
    "⚠ Self-Exclusion Confirmation\n\n" +
    "Self-exclusion will immediately prevent you from placing wagers for a minimum of 30 days. " +
    "To lift the exclusion you must contact support@betroyale.win after the cooling-off period.\n\n" +
    "Click OK to confirm self-exclusion."
  );
  if (!confirmed) return;
  try {
    await apiRequest("/api/auth/self-exclude", { method: "POST" });
    setAuthState({ ...currentUser, selfExcluded: true });
    showStatus("Self-exclusion applied. Wagering is disabled for 30 days. Contact support@betroyale.win to request reinstatement.", false);
  } catch (err) {
    showStatus(err.message || "Could not apply self-exclusion.", true);
  }
}
document.getElementById("self-exclude-btn")?.addEventListener("click", selfExclude);

// ══════════════════════════════════════════════════════════════════════════
