/**
 * LUNÉA SKIN — COD Orders
 * Config.gs — sheet names, headers, default settings and the settings reader.
 *
 * All business values (price, product name, prefix, quantity range, ...) live in
 * the "Settings" tab. Code reads them through getSettings(); nothing is duplicated.
 */

var SHEET = {
  ORDERS: 'Orders',
  SETTINGS: 'Settings',
  DASHBOARD: 'Dashboard'
};

var ORDER_HEADERS = [
  'Order ID', 'Date', 'Time', 'Full Name', 'Phone', 'City', 'Address',
  'Product', 'Quantity', 'Unit Price', 'Total', 'Status', 'Notes', 'Source', 'User Agent'
];

// Column indexes (1-based) — derived from ORDER_HEADERS so they never drift.
var COL = {};
ORDER_HEADERS.forEach(function (h, i) { COL[h] = i + 1; });

var STATUSES = ['New', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

// Key → default value. The Settings tab is created from this list by setupProject().
var DEFAULT_SETTINGS = [
  ['Brand Name', 'LUNÉA SKIN'],
  ['Product Name', 'Niacinamide Serum'],
  ['Product Price', 149],
  ['Currency', 'MAD'],
  ['Default Status', 'New'],
  ['Order ID Prefix', 'LS-'],
  ['Allowed Quantity', '1-10'],
  ['Timezone', 'Africa/Casablanca'],
  ['Duplicate Window Minutes', 10],
  ['API Token', ''] // optional shared secret; leave empty to disable the check
];

var SETTINGS_CACHE_KEY = 'lunea_settings_v1';
var SETTINGS_CACHE_SECONDS = 300;

/**
 * Reads the Settings tab into a typed object. Cached for 5 minutes.
 * Call clearSettingsCache() (or wait) after editing Settings.
 */
function getSettings() {
  var cache = CacheService.getScriptCache();
  var cached = cache.get(SETTINGS_CACHE_KEY);
  if (cached) {
    try { return JSON.parse(cached); } catch (err) { /* fall through and re-read */ }
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET.SETTINGS);
  if (!sheet) throw new Error('Settings sheet missing. Run setupProject() first.');

  var raw = {};
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    var key = String(values[i][0] || '').trim();
    if (key) raw[key] = values[i][1];
  }

  var qty = parseQuantityRange_(raw['Allowed Quantity']);
  var settings = {
    brandName: String(raw['Brand Name'] || 'LUNÉA SKIN'),
    productName: String(raw['Product Name'] || 'Niacinamide Serum').trim(),
    productPrice: Number(raw['Product Price']),
    currency: String(raw['Currency'] || 'MAD'),
    defaultStatus: String(raw['Default Status'] || 'New'),
    orderIdPrefix: String(raw['Order ID Prefix'] || 'LS-'),
    minQty: qty.min,
    maxQty: qty.max,
    timezone: String(raw['Timezone'] || 'Africa/Casablanca'),
    duplicateWindowMinutes: Number(raw['Duplicate Window Minutes']) > 0 ? Number(raw['Duplicate Window Minutes']) : 10,
    apiToken: String(raw['API Token'] || '').trim()
  };

  if (!(settings.productPrice > 0)) throw new Error('Settings: "Product Price" must be a positive number.');

  cache.put(SETTINGS_CACHE_KEY, JSON.stringify(settings), SETTINGS_CACHE_SECONDS);
  return settings;
}

function clearSettingsCache() {
  CacheService.getScriptCache().remove(SETTINGS_CACHE_KEY);
}

/** "1-10" → {min:1, max:10}. Falls back to 1–10 on bad input. */
function parseQuantityRange_(value) {
  var m = String(value || '').replace(/\s/g, '').match(/^(\d+)[-–](\d+)$/);
  if (!m) return { min: 1, max: 10 };
  var min = parseInt(m[1], 10), max = parseInt(m[2], 10);
  if (!(min >= 1) || !(max >= min)) return { min: 1, max: 10 };
  return { min: min, max: max };
}
