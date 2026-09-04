/**
 * LUNÉA SKIN — COD Orders — Web App entry points.
 *
 * Deploy → New deployment → Web app
 *   Execute as: Me
 *   Who has access: Anyone
 *
 * POST body (JSON, sent as text/plain to avoid CORS preflight):
 * {
 *   "fullName": "Ahmed Benali",
 *   "phone": "0612345678",
 *   "city": "Casablanca",
 *   "address": "Maarif, Casablanca",
 *   "product": "Niacinamide Serum",
 *   "quantity": 1,
 *   "notes": ""
 * }
 *
 * Success: { "success": true,  "orderId": "LS-00001", "message": "Order created successfully" }
 * Error:   { "success": false, "error": "Invalid phone number" }
 */

function doPost(e) {
  try {
    var raw = e && e.postData && e.postData.contents;
    if (!raw) return errorResponse('Empty request');

    var data;
    try {
      data = JSON.parse(raw);
    } catch (parseErr) {
      // Also accept application/x-www-form-urlencoded (e.parameter) as a fallback
      if (e.parameter && Object.keys(e.parameter).length) {
        data = e.parameter;
      } else {
        return errorResponse('Invalid JSON');
      }
    }

    var result = createOrder_(data);
    return jsonResponse(result);
  } catch (err) {
    logError('doPost failed', err);
    // Never expose stack traces or internal details to the client
    return errorResponse('Unable to process the order right now');
  }
}

/** Simple health check: open the Web App URL in a browser. */
function doGet() {
  var ok = true, brand = '';
  try {
    brand = getSettings().brandName;
  } catch (err) {
    ok = false;
  }
  return jsonResponse({ ok: ok, service: (brand || 'LUNÉA SKIN') + ' COD Orders API', method: 'Use POST to create orders' });
}

/**
 * Adds a "LUNÉA SKIN" menu to the spreadsheet for manual maintenance.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('LUNÉA SKIN')
    .addItem('Run setup / repair sheets', 'setupProject')
    .addItem('Clear settings cache', 'clearSettingsCache')
    .addItem('Insert test order', 'insertTestOrder')
    .addItem('Run self-tests', 'runAllTests')
    .addToUi();
}
