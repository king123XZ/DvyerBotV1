const cooldown = new Map();

module.exports = (jid, cmd, sec = 5) => {
  const key = jid + cmd;
  const now = Date.now();

  if (cooldown.has(key)) {
    const t = cooldown.get(key) - now;
    if (t > 0) return Math.ceil(t / 1000);
  }

  cooldown.set(key, now + sec * 1000);
  return false;
};