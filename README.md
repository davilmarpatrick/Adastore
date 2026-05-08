# ADASTORE — Backend Node.js
## Affiliation Amazon & AliExpress avec reversement automatique

---

## 📁 Structure des fichiers

```
adastore/
├── server.js              ← Serveur principal
├── package.json           ← Dépendances Node.js
├── .env.example           ← Modèle de configuration (à copier en .env)
├── .env                   ← VOS clés API (à créer, ne pas commiter)
├── routes/
│   ├── amazon.js          ← API Amazon Product Advertising 5.0
│   └── aliexpress.js      ← API AliExpress Affiliate
└── public/
    └── index.html         ← Frontend ADASTORE
```

---

## 🚀 Installation

### 1. Prérequis
- **Node.js** version 18+ → https://nodejs.org
- Un compte **Amazon Partenaires** → https://affiliate-program.amazon.fr
- Un compte **AliExpress Affiliate** → https://portals.aliexpress.com

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer les clés API
```bash
cp .env.example .env
```
Ouvrez `.env` et remplissez vos clés (voir section ci-dessous).

### 4. Démarrer le serveur
```bash
node server.js
```
Ouvrez **http://localhost:3000** dans votre navigateur.

---

## 🔑 Obtention des clés API

### Amazon Product Advertising API 5.0

1. Rendez-vous sur **https://affiliate-program.amazon.fr**
2. Créez un compte Partenaire (si pas encore fait)
3. Une fois approuvé, allez dans **Outils → Product Advertising API**
4. Cliquez **S'inscrire** et créez vos identifiants
5. Notez :
   - `Access Key ID` → `AMAZON_ACCESS_KEY`
   - `Secret Access Key` → `AMAZON_SECRET_KEY`
   - Votre **Tag Partenaire** (ex: `monsite-21`) → `AMAZON_PARTNER_TAG`

⚠️ **Important** : Votre compte Amazon Partenaires doit être actif et avoir réalisé au moins 3 ventes qualifiées dans les 180 jours pour maintenir l'accès API.

### AliExpress Affiliate API

1. Rendez-vous sur **https://portals.aliexpress.com**
2. Connectez-vous avec votre compte AliExpress
3. Allez dans **Developer Center → My Applications**
4. Cliquez **Create App** et remplissez les informations
5. Notez :
   - `App Key` → `ALI_APP_KEY`
   - `App Secret` → `ALI_APP_SECRET`
6. Activez les permissions : `aliexpress.affiliate.product.query`

---

## ⚙️ Fichier .env à remplir

```env
PORT=3000

# Amazon
AMAZON_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
AMAZON_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AMAZON_PARTNER_TAG=votresite-21
AMAZON_MARKETPLACE=www.amazon.fr
AMAZON_REGION=eu-west-1

# AliExpress
ALI_APP_KEY=12345678
ALI_APP_SECRET=abcdef1234567890abcdef1234567890
ALI_TRACKING_ID=adastore
ALI_CURRENCY=EUR
ALI_LANG=fr

# PayPal (reversements)
PAYPAL_CLIENT_ID=votre_client_id
PAYPAL_SECRET=votre_secret
PAYPAL_MODE=sandbox
ADMIN_PAYPAL_EMAIL=admin@adastore.com
```

---

## 🌐 Endpoints API disponibles

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/api/health` | Statut des APIs configurées |
| GET | `/api/amazon/search?q=iphone` | Recherche Amazon |
| GET | `/api/amazon/product/:asin` | Détail produit Amazon |
| GET | `/api/aliexpress/search?q=iphone` | Recherche AliExpress |
| GET | `/api/aliexpress/product/:itemId` | Détail produit AliExpress |

---

## ☁️ Déploiement en production

### Option A — Render.com (gratuit)
1. Créez un compte sur **https://render.com**
2. Nouveau Web Service → connectez votre repo GitHub
3. Build Command : `npm install`
4. Start Command : `node server.js`
5. Ajoutez vos variables d'environnement dans le dashboard Render

### Option B — VPS (DigitalOcean, OVH, etc.)
```bash
# Sur le serveur
git clone votre-repo
cd adastore
npm install
cp .env.example .env
nano .env  # Remplir les clés
# Avec PM2 pour rester actif
npm install -g pm2
pm2 start server.js --name adastore
pm2 startup
```

### Option C — Railway.app
1. **https://railway.app** → New Project → Deploy from GitHub
2. Ajoutez les variables d'environnement
3. Railway détecte Node.js automatiquement

---

## 💰 Taux de commissions indicatifs

| Plateforme | Catégorie | Commission |
|-----------|-----------|-----------|
| Amazon | Électronique | 3–5% |
| Amazon | Informatique | 4–6% |
| Amazon | Audio/Vidéo | 4–6% |
| AliExpress | Électronique | 4–9% |
| AliExpress | Téléphonie | 5–12% |
| AliExpress | Accessoires | 8–15% |

---

## 📞 Support

Pour toute question sur la configuration, consultez :
- Amazon PA API : https://webservices.amazon.com/paapi5/documentation/
- AliExpress Affiliate : https://developers.aliexpress.com/en/doc.htm
