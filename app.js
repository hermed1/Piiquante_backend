const express = require('express');
const app = express();
const mongoose = require('mongoose');

const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');
//importation du path du serveur
const path = require('path');
//connexion à la bdd

mongoose
  .connect(
    'mongodb+srv://Hermed:mGsG9AsPzWFOVWml@cluster0.juti8nj.mongodb.net/?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

//cors
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  next();
});

//intercepte les requêtes post qui ont un contenu json et mettre à dispo ce contenu dans req.body
app.use(express.json());

app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);
//dit à express de gérer la ressource images de manière statique:  __dirname: répertoire du serveur
//auquel on concatène "images"  pour obtenir le chemin complet
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;
