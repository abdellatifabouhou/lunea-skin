/**
 * Tests.gs — self-tests you can run from the Apps Script editor.
 * Select runAllTests in the function dropdown → Run → View → Logs.
 * Tests 1 and 9 write real rows to the Orders sheet (delete them afterwards).
 */

function simulatePost_(body) {
  var e = { postData: { contents: typeof body === 'string' ? body : JSON.stringify(body), type: 'text/plain' }, parameter: {} };
  return JSON.parse(doPost(e).getContent());
}

function assert_(name, condition, actual) {
  console.log((condition ? '✅ PASS' : '❌ FAIL') + ' — ' + name + (condition ? '' : ' → ' + JSON.stringify(actual)));
  return condition;
}

function runAllTests() {
  var settings = getSettings();
  var base = {
    fullName: 'Test Client', phone: '0612345678', city: 'Casablanca',
    address: 'Maarif, Casablanca', product: settings.productName, quantity: 1, notes: 'TEST', token: settings.apiToken
  };
  var uniquePhone = '06' + String(Date.now()).slice(-8); // avoid duplicate-window collisions between runs
  var r;

  r = simulatePost_(Object.assign({}, base, { phone: uniquePhone }));
  assert_('Test 1 — valid order saved', r.success === true && /^LS-\d{5,}$/.test(r.orderId), r);

  r = simulatePost_(Object.assign({}, base, { phone: '0512345678' }));
  assert_('Test 2 — invalid phone rejected', r.success === false && r.error === 'Invalid phone number', r);

  r = simulatePost_(Object.assign({}, base, { fullName: '' }));
  assert_('Test 3 — missing name rejected', r.success === false, r);

  r = simulatePost_(Object.assign({}, base, { city: '' }));
  assert_('Test 4 — missing city rejected', r.success === false, r);

  r = simulatePost_(Object.assign({}, base, { quantity: 0 }));
  assert_('Test 5 — quantity 0 rejected', r.success === false, r);

  r = simulatePost_(Object.assign({}, base, { quantity: 11 }));
  assert_('Test 6 — quantity 11 rejected', r.success === false, r);

  r = simulatePost_(Object.assign({}, base, { product: 'Vitamin C Serum' }));
  assert_('Test 7 — invalid product rejected', r.success === false && r.error === 'Invalid product', r);

  r = simulatePost_('{"fullName": "broken json"');
  assert_('Test 8 — malformed JSON rejected safely', r.success === false && r.error === 'Invalid JSON', r);

  var p9 = '07' + String(Date.now() + 1).slice(-8);
  var first = simulatePost_(Object.assign({}, base, { phone: p9, quantity: 2 }));
  var second = simulatePost_(Object.assign({}, base, { phone: p9, quantity: 2 }));
  assert_('Test 9 — duplicate returns same ID', first.success && second.success && second.duplicate === true && first.orderId === second.orderId, { first: first, second: second });

  var ids = {};
  for (var i = 0; i < 3; i++) {
    var rr = simulatePost_(Object.assign({}, base, { phone: '06' + String(Date.now() + 10 + i).slice(-8) }));
    ids[rr.orderId] = true;
  }
  assert_('Test 10 — sequential IDs unique', Object.keys(ids).length === 3, ids);

  r = simulatePost_(Object.assign({}, base, { phone: '+212 6 98 76 54 32' }));
  assert_('Extra — +212 phone normalised & accepted', r.success === true, r);

  console.log('Done. Remove the TEST rows from the Orders sheet when finished.');
}

/** Inserts one test order via the menu. */
function insertTestOrder() {
  var settings = getSettings();
  var r = simulatePost_({
    fullName: 'Test Client', phone: '06' + String(Date.now()).slice(-8), city: 'Rabat',
    address: 'Agdal, Rabat', product: settings.productName, quantity: 1, notes: 'TEST ORDER', token: settings.apiToken
  });
  try { SpreadsheetApp.getUi().alert('Result: ' + JSON.stringify(r)); } catch (err) { console.log(JSON.stringify(r)); }
}
