/**
 * Orders.gs — order ID generation, totals, duplicate detection, persistence.
 */

var COUNTER_PROP = 'LAST_ORDER_NUMBER';

/**
 * Returns the next sequential order number.
 * Uses a Script Property counter (not row numbers). On first use, or if the
 * counter is behind the sheet (e.g. rows pasted manually), it re-syncs from
 * the highest Order ID present in the Orders sheet.
 * MUST be called while holding the script lock (see createOrder_).
 */
function getNextOrderNumber() {
  var props = PropertiesService.getScriptProperties();
  var last = parseInt(props.getProperty(COUNTER_PROP) || '0', 10) || 0;
  var sheetMax = getMaxOrderNumberFromSheet_();
  var next = Math.max(last, sheetMax) + 1;
  props.setProperty(COUNTER_PROP, String(next));
  return next;
}

function getMaxOrderNumberFromSheet_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET.ORDERS);
  if (!sheet) return 0;
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  // Only scan the last 200 IDs — IDs are sequential, so the max is at the end.
  var start = Math.max(2, lastRow - 199);
  var ids = sheet.getRange(start, COL['Order ID'], lastRow - start + 1, 1).getValues();
  var max = 0;
  ids.forEach(function (r) {
    var n = parseInt(String(r[0]).replace(/\D/g, ''), 10);
    if (n > max) max = n;
  });
  return max;
}

/** LS-00001 style ID. */
function generateOrderId(settings) {
  var n = getNextOrderNumber();
  var padded = ('00000' + n).slice(-5);
  if (n > 99999) padded = String(n);
  return settings.orderIdPrefix + padded;
}

function calculateTotal(quantity, price) {
  var q = Number(quantity), p = Number(price);
  if (!(q > 0) || !(p > 0)) throw new Error('Invalid quantity or price');
  return Math.round(q * p * 100) / 100;
}

/**
 * Duplicate detection:
 * Same phone + same product + same quantity submitted within the
 * "Duplicate Window Minutes" (Settings, default 10) is treated as an accidental
 * re-submission (double click, page refresh, retry after a slow network).
 * We return the EXISTING order ID instead of creating a new row.
 * A different quantity, or the same order after the window, is accepted normally —
 * customers are never blocked from ordering again.
 */
function findRecentDuplicate(order, settings) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET.ORDERS);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;

  var rowsToScan = Math.min(100, lastRow - 1);
  var start = lastRow - rowsToScan + 1;
  var values = sheet.getRange(start, 1, rowsToScan, ORDER_HEADERS.length).getValues();
  var windowMs = settings.duplicateWindowMinutes * 60 * 1000;
  var now = new Date();

  for (var i = values.length - 1; i >= 0; i--) {
    var r = values[i];
    var phone = String(r[COL['Phone'] - 1]);
    var qty = Number(r[COL['Quantity'] - 1]);
    var product = String(r[COL['Product'] - 1]);
    if (phone !== order.phone || qty !== order.quantity || product !== order.product) continue;

    var ts = combineDateTime_(r[COL['Date'] - 1], r[COL['Time'] - 1]);
    if (ts && (now.getTime() - ts.getTime()) <= windowMs) {
      return { orderId: String(r[COL['Order ID'] - 1]), total: Number(r[COL['Total'] - 1]) };
    }
    if (ts && (now.getTime() - ts.getTime()) > windowMs) break; // rows older than window → stop
  }
  return null;
}

function combineDateTime_(dateCell, timeCell) {
  if (!(dateCell instanceof Date)) return null;
  var d = new Date(dateCell.getTime());
  var parts = String(timeCell || '00:00:00').split(':');
  d.setHours(Number(parts[0]) || 0, Number(parts[1]) || 0, Number(parts[2]) || 0, 0);
  return d;
}

/** Append the order row. Returns the row number written. */
function saveOrder(order) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET.ORDERS);
  var row = [
    order.orderId,
    order.date,
    order.time,
    safeCell(order.fullName),
    "'" + order.phone,          // keep leading zero as text
    safeCell(order.city),
    safeCell(order.address),
    order.product,
    order.quantity,
    order.unitPrice,
    order.total,
    order.status,
    safeCell(order.notes),
    safeCell(order.source),
    safeCell(order.userAgent)
  ];
  sheet.appendRow(row);
  var r = sheet.getLastRow();
  sheet.getRange(r, COL['Phone']).setNumberFormat('@');
  return r;
}

/**
 * Full pipeline: lock → validate → duplicate check → ID → total → save.
 * Returns a plain object (the caller wraps it with jsonResponse).
 */
function createOrder_(data) {
  var settings = getSettings();

  var v = validateOrder(data, settings);
  if (!v.ok) return { success: false, error: v.error };
  var order = v.order;

  var lock = LockService.getScriptLock();
  var locked = lock.tryLock(15000); // wait up to 15s for concurrent requests
  if (!locked) {
    logError('createOrder_: could not obtain lock', 'busy');
    return { success: false, error: 'Server busy, please try again' };
  }

  try {
    var dup = findRecentDuplicate(order, settings);
    if (dup) {
      logInfo('Duplicate suppressed', { orderId: dup.orderId, phone: maskPhone(order.phone) });
      return { success: true, orderId: dup.orderId, message: 'Duplicate order ignored', duplicate: true, total: dup.total };
    }

    var now = new Date();
    order.orderId = generateOrderId(settings);
    order.date = dateOnly(now, settings.timezone);
    order.time = timeString(now, settings.timezone);
    order.unitPrice = settings.productPrice;          // server price only
    order.total = calculateTotal(order.quantity, settings.productPrice);
    order.status = settings.defaultStatus;

    saveOrder(order);
    SpreadsheetApp.flush();

    logInfo('Order saved', { orderId: order.orderId, qty: order.quantity, city: order.city, phone: maskPhone(order.phone) });
    return { success: true, orderId: order.orderId, message: 'Order created successfully', total: order.total };
  } finally {
    lock.releaseLock();
  }
}
