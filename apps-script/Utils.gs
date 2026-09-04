/**
 * Utils.gs — response helpers, phone normalisation, dates, logging.
 */

/** Build the JSON response returned by the Web App. */
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function successResponse(orderId, extra) {
  var body = { success: true, orderId: orderId, message: 'Order created successfully' };
  if (extra) for (var k in extra) body[k] = extra[k];
  return jsonResponse(body);
}

function errorResponse(message) {
  return jsonResponse({ success: false, error: String(message || 'Invalid request') });
}

/** Convert Arabic-Indic digits to Latin digits. */
function normalizeDigits(value) {
  var ar = '٠١٢٣٤٥٦٧٨٩', fa = '۰۱۲۳۴۵۶۷۸۹';
  return String(value == null ? '' : value).replace(/[٠-٩۰-۹]/g, function (d) {
    var i = ar.indexOf(d);
    return String(i >= 0 ? i : fa.indexOf(d));
  });
}

/**
 * Normalise Moroccan mobile numbers to 06XXXXXXXX / 07XXXXXXXX.
 * Accepts: 06…, 07…, +2126…, +2127…, 002126…, 2126…, with spaces/dashes/dots.
 * Returns null when invalid.
 */
function normalizePhone(phone) {
  var p = normalizeDigits(phone).replace(/[\s\-().]/g, '');
  if (p.indexOf('+') === 0) p = p.slice(1);
  if (p.indexOf('00212') === 0) p = p.slice(5);
  else if (p.indexOf('212') === 0) p = p.slice(3);
  if (/^[67]\d{8}$/.test(p)) p = '0' + p;
  return /^0[67]\d{8}$/.test(p) ? p : null;
}

/** Trim, collapse whitespace, strip control chars, cap length. */
function cleanText(value, maxLen) {
  var s = String(value == null ? '' : value)
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return maxLen ? s.slice(0, maxLen) : s;
}

/** Prevent spreadsheet formula injection when writing user text into cells. */
function safeCell(value) {
  var s = String(value == null ? '' : value);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

/** Date at local midnight (script timezone) — lets Dashboard use COUNTIF(...,TODAY()). */
function dateOnly(now, tz) {
  var parts = Utilities.formatDate(now, tz, 'yyyy-M-d').split('-');
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

function timeString(now, tz) {
  return Utilities.formatDate(now, tz, 'HH:mm:ss');
}

/** Mask phone for logs: 0612345678 → 06****5678 */
function maskPhone(phone) {
  var p = String(phone || '');
  return p.length >= 6 ? p.slice(0, 2) + '****' + p.slice(-4) : '****';
}

function logInfo(message, data) {
  console.log(message + (data ? ' ' + JSON.stringify(data) : ''));
}

function logError(message, err) {
  console.error(message + ' :: ' + (err && err.stack ? err.stack : String(err)));
}
