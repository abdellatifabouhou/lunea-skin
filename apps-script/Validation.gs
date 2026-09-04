/**
 * Validation.gs — authoritative server-side validation.
 * The frontend is never trusted: product and price come from Settings.
 */

/**
 * @param {Object} data     Parsed JSON body from the request.
 * @param {Object} settings Result of getSettings().
 * @returns {{ok: boolean, error?: string, order?: Object}}
 */
function validateOrder(data, settings) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { ok: false, error: 'Invalid request body' };
  }

  // Optional shared secret (set "API Token" in Settings + ORDER_API_TOKEN in the site env).
  if (settings.apiToken && String(data.token || '') !== settings.apiToken) {
    return { ok: false, error: 'Unauthorized' };
  }

  // Honeypot — bots fill it, humans never see it.
  if (data.website && String(data.website).trim() !== '') {
    return { ok: false, error: 'Rejected' };
  }

  var fullName = cleanText(data.fullName, 80);
  if (fullName.length < 3) return { ok: false, error: 'Full name is required' };

  var phone = normalizePhone(data.phone);
  if (!phone) return { ok: false, error: 'Invalid phone number' };

  var city = cleanText(data.city, 60);
  if (city.length < 2) return { ok: false, error: 'City is required' };

  var address = cleanText(data.address, 300);
  if (address.length < 5) return { ok: false, error: 'Address is required' };

  var qtyRaw = normalizeDigits(data.quantity);
  var quantity = Number(qtyRaw);
  if (!/^\d+$/.test(qtyRaw) || !isFinite(quantity) || quantity < settings.minQty || quantity > settings.maxQty) {
    return { ok: false, error: 'Quantity must be between ' + settings.minQty + ' and ' + settings.maxQty };
  }

  // Product must equal the configured product (case/whitespace-insensitive).
  var product = cleanText(data.product || settings.productName, 120);
  if (product.toLowerCase() !== settings.productName.toLowerCase()) {
    return { ok: false, error: 'Invalid product' };
  }

  var notes = cleanText(data.notes, 300);
  var source = cleanText(data.source, 200);
  var userAgent = cleanText(data.userAgent, 300);

  return {
    ok: true,
    order: {
      fullName: fullName,
      phone: phone,
      city: city,
      address: address,
      product: settings.productName, // canonical name from Settings
      quantity: quantity,
      notes: notes,
      source: source,
      userAgent: userAgent
    }
  };
}
