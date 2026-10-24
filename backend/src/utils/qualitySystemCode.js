function normalizeQualitySystemCode(value) {
  if (typeof value !== 'string') return null;
  const code = value.trim().toUpperCase();
  return /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(code) ? code : null;
}

module.exports = { normalizeQualitySystemCode };
