/**
 * Setup.gs — one-click project setup: setupProject()
 * Creates/repairs Orders, Settings and Dashboard sheets with formatting,
 * dropdowns, conditional formatting and live formulas. Safe to run again.
 */

function setupProject() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss.getName() || ss.getName() === 'Untitled spreadsheet') {
    ss.rename('LUNÉA SKIN — COD Orders');
  }

  setupSettingsSheet_(ss);
  clearSettingsCache();
  var settings = getSettings();
  try { ss.setSpreadsheetTimeZone(settings.timezone); } catch (err) { /* ignore */ }

  setupOrdersSheet_(ss, settings);
  setupDashboardSheet_(ss, settings);

  // Order the tabs: Dashboard, Orders, Settings
  ss.setActiveSheet(ss.getSheetByName(SHEET.DASHBOARD)); ss.moveActiveSheet(1);
  ss.setActiveSheet(ss.getSheetByName(SHEET.ORDERS)); ss.moveActiveSheet(2);
  ss.setActiveSheet(ss.getSheetByName(SHEET.SETTINGS)); ss.moveActiveSheet(3);

  // Remove the default empty "Sheet1" if present and unused
  var def = ss.getSheetByName('Sheet1') || ss.getSheetByName('Feuille 1') || ss.getSheetByName('ورقة1');
  if (def && def.getLastRow() === 0 && ss.getSheets().length > 3) ss.deleteSheet(def);

  ss.setActiveSheet(ss.getSheetByName(SHEET.ORDERS));
  logInfo('setupProject complete');
  try { SpreadsheetApp.getUi().alert('LUNÉA SKIN setup complete ✅\nOrders, Settings and Dashboard are ready.'); } catch (err) { /* running headless */ }
}

/* ------------------------------------------------------------------ */
function getOrCreateSheet_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function styleHeader_(range) {
  range.setBackground('#2f4230').setFontColor('#ffffff').setFontWeight('bold')
    .setFontSize(10).setVerticalAlignment('middle').setWrap(false);
}

/* ------------------------------------------------------------------ */
function setupSettingsSheet_(ss) {
  var sheet = getOrCreateSheet_(ss, SHEET.SETTINGS);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, 3).setValues([['Key', 'Value', 'Description']]);
  }
  styleHeader_(sheet.getRange(1, 1, 1, 3));

  var descriptions = {
    'Brand Name': 'Displayed in API health response',
    'Product Name': 'The ONLY product accepted by the API',
    'Product Price': 'Unit price — server-side source of truth',
    'Currency': 'Currency code',
    'Default Status': 'Status assigned to new orders',
    'Order ID Prefix': 'e.g. LS- → LS-00001',
    'Allowed Quantity': 'min-max, e.g. 1-10',
    'Timezone': 'IANA timezone for Date/Time columns',
    'Duplicate Window Minutes': 'Same phone+qty within this window = duplicate',
    'API Token': 'Optional shared secret (must match ORDER_API_TOKEN on the website)'
  };

  // Add any missing keys without overwriting existing values
  var existing = {};
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) existing[String(values[i][0]).trim()] = true;

  DEFAULT_SETTINGS.forEach(function (pair) {
    if (!existing[pair[0]]) sheet.appendRow([pair[0], pair[1], descriptions[pair[0]] || '']);
  });

  sheet.setFrozenRows(1);
  sheet.setColumnWidth(1, 220);
  sheet.setColumnWidth(2, 220);
  sheet.setColumnWidth(3, 420);
  sheet.getRange('A2:A').setFontWeight('bold');
  sheet.getRange('B2:B').setBackground('#f0f5ef');
  sheet.getRange('C2:C').setFontColor('#55635a').setFontStyle('italic');
}

/* ------------------------------------------------------------------ */
function setupOrdersSheet_(ss, settings) {
  var sheet = getOrCreateSheet_(ss, SHEET.ORDERS);
  var n = ORDER_HEADERS.length;

  sheet.getRange(1, 1, 1, n).setValues([ORDER_HEADERS]);
  styleHeader_(sheet.getRange(1, 1, 1, n));
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(1);

  // Filter over the whole table
  var filter = sheet.getFilter();
  if (filter) filter.remove();
  sheet.getRange(1, 1, Math.max(sheet.getMaxRows(), 2), n).createFilter();

  // Column widths
  var widths = [100, 100, 80, 180, 120, 130, 280, 160, 70, 90, 90, 110, 200, 200, 240];
  widths.forEach(function (w, i) { sheet.setColumnWidth(i + 1, w); });

  // Formats
  var maxRows = sheet.getMaxRows();
  sheet.getRange(2, COL['Date'], maxRows - 1).setNumberFormat('yyyy-mm-dd');
  sheet.getRange(2, COL['Time'], maxRows - 1).setNumberFormat('@');
  sheet.getRange(2, COL['Phone'], maxRows - 1).setNumberFormat('@');
  sheet.getRange(2, COL['Quantity'], maxRows - 1).setNumberFormat('0');
  var money = '#,##0 "' + settings.currency + '"';
  sheet.getRange(2, COL['Unit Price'], maxRows - 1).setNumberFormat(money);
  sheet.getRange(2, COL['Total'], maxRows - 1).setNumberFormat(money);
  sheet.getRange(2, 1, maxRows - 1, n).setVerticalAlignment('middle');
  sheet.getRange(2, COL['Address'], maxRows - 1).setWrap(true);

  // Status dropdown
  var statusRange = sheet.getRange(2, COL['Status'], maxRows - 1);
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(STATUSES, true)
    .setAllowInvalid(false)
    .setHelpText('Choose: ' + STATUSES.join(', '))
    .build();
  statusRange.setDataValidation(rule);

  // Conditional formatting by status
  var colors = { New: '#fff7d6', Confirmed: '#dbeafe', Shipped: '#ede9fe', Delivered: '#dcfce7', Cancelled: '#fee2e2' };
  var rules = [];
  STATUSES.forEach(function (s) {
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(s).setBackground(colors[s]).setRanges([statusRange]).build());
  });
  sheet.setConditionalFormatRules(rules);

  // Protect header row from accidental edits (warning only)
  sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE).forEach(function (p) { p.remove(); });
  sheet.getRange(1, 1, 1, n).protect().setDescription('Header — do not edit').setWarningOnly(true);
}

/* ------------------------------------------------------------------ */
function setupDashboardSheet_(ss, settings) {
  var sheet = getOrCreateSheet_(ss, SHEET.DASHBOARD);
  sheet.clear();
  sheet.clearConditionalFormatRules();

  var O = "'" + SHEET.ORDERS + "'!";
  var id = O + 'A2:A', date = O + 'B2:B', total = O + 'K2:K', status = O + 'L2:L';

  sheet.getRange('A1').setValue(settings.brandName + ' — Dashboard').setFontSize(18).setFontWeight('bold').setFontColor('#2f4230');
  sheet.getRange('A2').setValue('Updates automatically from the Orders sheet.').setFontColor('#55635a').setFontStyle('italic');

  var rows = [
    ['Metric', 'Value'],
    ['Total Orders', '=COUNTA(' + id + ')'],
    ['New Orders', '=COUNTIF(' + status + ',"New")'],
    ['Confirmed Orders', '=COUNTIF(' + status + ',"Confirmed")'],
    ['Shipped Orders', '=COUNTIF(' + status + ',"Shipped")'],
    ['Delivered Orders', '=COUNTIF(' + status + ',"Delivered")'],
    ['Cancelled Orders', '=COUNTIF(' + status + ',"Cancelled")'],
    ['Total Revenue (Delivered)', '=SUMIF(' + status + ',"Delivered",' + total + ')'],
    ['Potential Revenue (New + Confirmed + Shipped)', '=SUMIF(' + status + ',"New",' + total + ')+SUMIF(' + status + ',"Confirmed",' + total + ')+SUMIF(' + status + ',"Shipped",' + total + ')'],
    ['Orders Today', '=COUNTIF(' + date + ',TODAY())'],
    ['Revenue Today (all non-cancelled)', '=SUMIFS(' + total + ',' + date + ',TODAY(),' + status + ',"<>Cancelled")'],
    ['Average Order Value (Delivered)', '=IFERROR(' + 'SUMIF(' + status + ',"Delivered",' + total + ')/COUNTIF(' + status + ',"Delivered"),0)'],
    ['Delivery Rate', '=IFERROR(COUNTIF(' + status + ',"Delivered")/(COUNTA(' + id + ')-COUNTIF(' + status + ',"Cancelled")),0)']
  ];
  sheet.getRange(4, 1, rows.length, 2).setValues(rows);
  styleHeader_(sheet.getRange(4, 1, 1, 2));

  var money = '#,##0 "' + settings.currency + '"';
  sheet.getRange('B11:B12').setNumberFormat(money);
  sheet.getRange('B14:B15').setNumberFormat(money);
  sheet.getRange('B16').setNumberFormat('0.0%');
  sheet.getRange(5, 1, rows.length - 1, 1).setFontWeight('bold');
  sheet.getRange(5, 2, rows.length - 1, 1).setHorizontalAlignment('right').setFontSize(12);
  sheet.getRange(5, 1, rows.length - 1, 2).setBackgrounds(
    rows.slice(1).map(function (_, i) { return i % 2 ? ['#ffffff', '#ffffff'] : ['#f6f8f5', '#f6f8f5']; })
  );

  // Orders per city (top 10) — live QUERY
  sheet.getRange('D4:E4').setValues([['City', 'Orders']]);
  styleHeader_(sheet.getRange('D4:E4'));
  sheet.getRange('D5').setFormula(
    '=IFERROR(QUERY(' + O + 'F2:L, "select F, count(F) where F is not null and L <> \'Cancelled\' group by F order by count(F) desc limit 10 label count(F) \'\'", 0), "")'
  );

  // Last 7 days
  sheet.getRange('G4:H4').setValues([['Date', 'Orders']]);
  styleHeader_(sheet.getRange('G4:H4'));
  for (var i = 0; i < 7; i++) {
    sheet.getRange(5 + i, 7).setFormula('=TODAY()-' + i).setNumberFormat('yyyy-mm-dd');
    sheet.getRange(5 + i, 8).setFormula('=COUNTIF(' + date + ',G' + (5 + i) + ')');
  }

  sheet.setColumnWidth(1, 330); sheet.setColumnWidth(2, 140);
  sheet.setColumnWidth(3, 30);
  sheet.setColumnWidth(4, 180); sheet.setColumnWidth(5, 90);
  sheet.setColumnWidth(6, 30);
  sheet.setColumnWidth(7, 120); sheet.setColumnWidth(8, 90);
  sheet.setHiddenGridlines(true);
}
