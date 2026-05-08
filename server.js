/**
 * ADASTORE — Serveur Backend Node.js
 * Intermédiaire entre le frontend et les APIs Amazon / AliExpress
 *
 * Démarrage : node server.js
 * Port       : 3000 (configurable dans .env)
 */

require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const path      = require('path');
const amazonAPI = require('./routes/amazon');
const aliAPI    = require('./routes/aliexpress');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares ──────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Routes API ───────────────────────────────────────────────
app.use('/api/amazon',     amazonAPI);
app.use('/api/aliexpress', aliAPI);

// Santé du serveur
app.get('/api/health', (req, res) => {
  res.json({
    status    : 'ok',
    amazon    : !!process.env.AMAZON_ACCESS_KEY,
    aliexpress: !!process.env.ALI_APP_KEY,
    time      : new Date().toISOString()
  });
});

// ── Démarrage ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 ADASTORE Backend démarré → http://localhost:${PORT}`);
  console.log(`   Amazon     : ${process.env.AMAZON_ACCESS_KEY ? '✅ Configuré' : '⚠️  Clé manquante dans .env'}`);
  console.log(`   AliExpress : ${process.env.ALI_APP_KEY       ? '✅ Configuré' : '⚠️  Clé manquante dans .env'}`);
  console.log(`\n   Ouvrez http://localhost:${PORT} dans votre navigateur\n`);
});
