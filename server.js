require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

try {
  const amazonAPI = require('./routes/amazon');
  app.use('/api/amazon', amazonAPI);
} catch(e) {
  console.log('Amazon routes non disponibles:', e.message);
}

try {
  const aliAPI = require('./routes/aliexpress');
  app.use('/api/aliexpress', aliAPI);
} catch(e) {
  console.log('AliExpress routes non disponibles:', e.message);
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    amazon: !!process.env.AMAZON_ACCESS_KEY,
    aliexpress: !!process.env.ALI_APP_KEY,
    time: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`ADASTORE démarré sur port ${PORT}`);
});
