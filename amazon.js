require('dotenv').config();
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const https = require('https');

const ACCESS_KEY = process.env.AMAZON_ACCESS_KEY || '';
const SECRET_KEY = process.env.AMAZON_SECRET_KEY || '';
const PARTNER_TAG = process.env.AMAZON_PARTNER_TAG || '';
const MARKETPLACE = process.env.AMAZON_MARKETPLACE || 'www.amazon.fr';
const REGION = process.env.AMAZON_REGION || 'eu-west-1';
const SERVICE = 'ProductAdvertisingAPI';

function sign(key, msg) {
  return crypto.createHmac('sha256', key).update(msg).digest();
}

function getSignatureKey(key, dateStamp, region, service) {
  const kDate = sign(Buffer.from('AWS4' + key, 'utf8'), dateStamp);
  const kRegion = sign(kDate, region);
  const kService = sign(kRegion, service);
  return sign(kService, 'aws4_request');
}

function buildAmazonRequest(operation, payload) {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '').slice(0, 15) + 'Z';
  const dateStamp = amzDate.slice(0, 8);
  const endpoint = `webservices.${MARKETPLACE}`;
  const path_ = '/paapi5/' + operation.toLowerCase();
  const bodyStr = JSON.stringify(payload);
  const bodyHash = crypto.createHash('sha256').update(bodyStr).digest('hex');
  const headers = {
    'content-encoding': 'amz-1.0',
    'content-type': 'application/json; charset=utf-8',
    'host': endpoint,
    'x-amz-date': amzDate,
    'x-amz-target': `com.amazon.paapi5.v1.ProductAdvertisingAPIv1.${operation}`
  };
  const signedHeaders = Object.keys(headers).sort().join(';');
  const canonicalHeaders = Object.keys(headers).sort().map(k => `${k}:${headers[k]}\n`).join('');
  const canonicalRequest = ['POST', path_, '', canonicalHeaders, signedHeaders, bodyHash].join('\n');
  const credScope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
  const strToSign = ['AWS4-HMAC-SHA256', amzDate, credScope, crypto.createHash('sha256').update(canonicalRequest).digest('hex')].join('\n');
  const sigKey = getSignatureKey(SECRET_KEY, dateStamp, REGION, SERVICE);
  const sig = crypto.createHmac('sha256', sigKey).update(strToSign).digest('hex');
  const auth = `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY}/${credScope}, SignedHeaders=${signedHeaders}, Signature=${sig}`;
  return { endpoint, path: path_, headers: { ...headers, Authorization: auth }, body: bodyStr };
}

function callAmazon(operation, payload) {
  return new Promise((resolve, reject) => {
    const { endpoint, path: reqPath, headers, body } = buildAmazonRequest(operation, payload);
    const options = {
      hostname: endpoint, path: reqPath, method: 'POST',
      headers: { ...headers, 'content-length': Buffer.byteLength(body) }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(new Error('Réponse Amazon invalide')); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function formatAmazonProduct(item) {
  const info = item.ItemInfo || {};
  const offers = item.Offers?.Listings?.[0] || {};
  const images = item.Images?.Primary?.Large || {};
  const price = offers.Price?.Amount || null;
  const oldPrice = offers.Price?.SavingBasis?.Amount || null;
  const commission = Math.round((price || 0) * 0.05 * 100) / 100;
  return {
    id: item.ASIN,
    source: 'amazon',
    asin: item.ASIN,
    name: info.Title?.DisplayValue || 'Produit Amazon',
    brand: info.ByLineInfo?.Brand?.DisplayValue || '',
    price: price,
    oldPrice: oldPrice,
    image: images.URL || '',
    url: item.DetailPageURL || `https://www.amazon.fr/dp/${item.ASIN}?tag=${PARTNER_TAG}`,
    rating: item.CustomerReviews?.StarRating?.Value || null,
    reviews: item.CustomerReviews?.Count || 0,
    commission: commission,
    badge: oldPrice ? 'sale' : null,
    category: 'Electronics'
  };
}

router.get('/search', async (req, res) => {
  if (!ACCESS_KEY || !SECRET_KEY) {
    return res.status(503).json({ error: 'Clés Amazon non configurées dans .env' });
  }
  const q = req.query.q || 'smartphone';
  const category = req.query.category || 'Electronics';
  try {
    const payload = {
      Keywords: q,
      SearchIndex: category,
      PartnerTag: PARTNER_TAG,
      PartnerType: 'Associates',
      Marketplace: MARKETPLACE,
      Resources: [
        'ItemInfo.Title', 'ItemInfo.ByLineInfo',
        'Images.Primary.Large',
        'Offers.Listings.Price',
        'CustomerReviews.StarRating', 'CustomerReviews.Count'
      ]
    };
    const data = await callAmazon('SearchItems', payload);
    const items = data.SearchResult?.Items || [];
    const products = items.map(formatAmazonProduct);
    res.json({ source: 'amazon', total: products.length, products });
  } catch (err) {
    console.error('[Amazon] search error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/product/:asin', async (req, res) => {
  if (!ACCESS_KEY || !SECRET_KEY) {
    return res.status(503).json({ error: 'Clés Amazon non configurées dans .env' });
  }
  try {
    const payload = {
      ItemIds: [req.params.asin],
      PartnerTag: PARTNER_TAG,
      PartnerType: 'Associates',
      Marketplace: MARKETPLACE,
      Resources: [
        'ItemInfo.Title', 'ItemInfo.ByLineInfo',
        'Images.Primary.Large',
        'Offers.Listings.Price',
        'CustomerReviews.StarRating', 'CustomerReviews.Count'
      ]
    };
    const data = await callAmazon('GetItems', payload);
    const item = data.ItemsResult?.Items?.[0];
    if (!item) return res.status(404).json({ error: 'Produit introuvable' });
    res.json({ source: 'amazon', product: formatAmazonProduct(item) });
  } catch (err) {
    console.error('[Amazon] product error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
