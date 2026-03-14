/* haptics.js — vibration feedback for BetRoyale (mobile/PWA) */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function canVibrate() {
    return !prefersReducedMotion && 'vibrate' in navigator;
  }

  window.Haptics = {
    // Light tick — keypad presses
    tick: function () {
      if (canVibrate()) navigator.vibrate(10);
    },

    // Subtle confirmation — drawer open/close
    light: function () {
      if (canVibrate()) navigator.vibrate(20);
    },

    // Clear confirmation — queue joined, wager locked
    confirm: function () {
      if (canVibrate()) navigator.vibrate([50, 30, 100]);
    },

    // Strong positive — win, payment success, cashout success
    win: function () {
      if (canVibrate()) navigator.vibrate([100, 50, 100, 50, 200]);
    },

    // Dull negative — loss
    loss: function () {
      if (canVibrate()) navigator.vibrate(300);
    },

    // Warning pattern — error states, insufficient funds
    error: function () {
      if (canVibrate()) navigator.vibrate([50, 30, 50, 30, 50]);
    },
  };
})();
