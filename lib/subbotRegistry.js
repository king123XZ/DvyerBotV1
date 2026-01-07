// lib/subbotRegistry.js
if (!global.subBotState) global.subBotState = new Map();

function setState(number, patch = {}) {
  const prev = global.subBotState.get(number) || {
    number,
    status: "starting", // starting | open | closed | error
    startedAt: Date.now(),
    lastChange: Date.now(),
    reconnects: 0,
    lastError: null,
  };

  const next = {
    ...prev,
    ...patch,
    lastChange: Date.now(),
  };

  global.subBotState.set(number, next);
  return next;
}

function getState(number) {
  return global.subBotState.get(number);
}

function allStates() {
  return Array.from(global.subBotState.values());
}

module.exports = { setState, getState, allStates };
