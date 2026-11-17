const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const SECRET = 'dev-secret'; // à changer hors du cadre d'un exercice
const UPLOAD_DIR = path.join(__dirname, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Configuration de la réception des images
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) =>
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo
  fileFilter: (req, file, cb) =>
    /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Format d’image non supporté (jpeg, png, webp ou gif).')),
});

const server = jsonServer.create();
const router = jsonServer.router('db.json');

// Vérifie le token JWT et place l'utilisateur dans req.user
function requireAuth(req, res, next) {
  try {
    req.user = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), SECRET);
    next();
  } catch (err) {
    // Log de diagnostic (tu pourras le supprimer une fois le problème réglé)
    console.log(
      `[401] ${req.method} ${req.originalUrl} →`,
      req.headers.authorization
        ? `en-tête reçu (${req.headers.authorization.slice(0, 20)}...) mais invalide : ${err.message}`
        : 'aucun en-tête Authorization reçu'
    );
    res.status(401).json({ message: 'Non authentifié' });
  }
}

// Si la requête est un envoi "formulaire avec fichier" (multipart), on extrait
// l'image, on la range dans uploads/ et on met son adresse dans req.body.img
function parseImage(req, res, next) {
  if (!['POST', 'PUT'].includes(req.method) || !req.is('multipart/form-data')) return next();

  upload.single('image')(req, res, (err) => {
    if (err) {
      const message = err.code === 'LIMIT_FILE_SIZE' ? 'Image trop lourde (5 Mo maximum).' : err.message;
      return res.status(400).json({ message });
    }
    // img vient uniquement du fichier reçu, jamais d'un champ texte envoyé par le client
    req.body.img = req.file
      ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
      : undefined;
    next();
  });
}

server.use(jsonServer.defaults()); // inclut CORS
server.use(jsonServer.bodyParser); // JSON uniquement : le multipart est géré par multer

// Inscription
server.post('/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if ([name, email, password].some((v) => typeof v !== 'string' || !v.trim()))
    return res.status(400).json({ message: 'Nom, email et mot de passe (texte) requis' });
  const users = router.db.get('users');
  if (users.find({ email }).value())
    return res.status(409).json({ message: 'Email déjà utilisé' });
  const user = { id: Date.now(), name, email, passwordHash: bcrypt.hashSync(password, 10) };
  users.push(user).write();
  res.status(201).json({ id: user.id, name: user.name, email: user.email });
});

// Connexion
server.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string')
    return res.status(400).json({ message: 'Email et mot de passe requis' });
  const user = router.db.get('users').find({ email }).value();
  if (!user || !bcrypt.compareSync(password, user.passwordHash))
    return res.status(401).json({ message: 'Identifiants invalides' });
  const token = jwt.sign({ id: user.id, name: user.name }, SECRET, { expiresIn: '2h' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// Utilisateur connecté
server.get('/me', requireAuth, (req, res) => {
  const user = router.db.get('users').find({ id: req.user.id }).value();
  if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
  const { passwordHash, ...safeUser } = user; // on ne renvoie jamais le hash
  res.json(safeUser);
});

// Articles de l'utilisateur connecté
server.get('/me/articles', requireAuth, (req, res) => {
  const articles = router.db
    .get('articles')
    .filter({ authorId: req.user.id })
    .orderBy('createdAt', 'desc')
    .value();
  res.json(articles);
});

// On cache la table users (sinon elle serait exposée avec les hashs)
server.use('/users', (req, res) => res.status(404).end());

// Servir les images
server.use('/uploads', express.static(UPLOAD_DIR));

// Articles : lecture (GET) publique, écriture/suppression protégées par connexion
server.use(
  '/articles',
  (req, res, next) => (req.method === 'GET' ? next() : requireAuth(req, res, next)),
  parseImage,
  (req, res, next) => {
    if (req.method === 'POST') {
      req.body.img = req.body.img ?? null;
      req.body.authorId = req.user.id;
      req.body.authorName = req.user.name;
      req.body.createdAt = new Date().toISOString();
    }

    if (['PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      const id = parseInt(req.url.split('/')[1], 10);
      const article = router.db.get('articles').find({ id }).value();
      if (!article) return res.status(404).json({ message: 'Introuvable' });
      if (article.authorId !== req.user.id)
        return res.status(403).json({ message: 'Interdit : ce n’est pas ton article' });
      if (req.method !== 'DELETE') {
        req.body.authorId = article.authorId;
        req.body.authorName = article.authorName;
        req.body.createdAt = article.createdAt;
        // sans nouvelle image, on garde l'ancienne
        if (req.body.img === undefined) req.body.img = article.img ?? null;
      }
    }
    next();
  }
);

server.use(router);
server.listen(3000, () => console.log('API sur http://localhost:3000'));
