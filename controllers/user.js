const User = require('../models/User');
const bcrypt = require('bcrypt');
//importation de jsonwebtoken
//quand l'utilisateur se connecte, il reçoit un token encodé depuis le serveur que le frontend lie à chaque
//requête. Le serveur peut donc vérifier ce token pour chaque requête authentifiée
const jwt = require('jsonwebtoken');

exports.signup = (req, res, next) => {
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      user
        .save()
        .then(() => res.status(201).json({ message: 'utilisateur créé' }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
  //vérifier que l'e-mail entré par l'utilisateur correspond à un utilisateur existant
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        res
          .status(401)
          .json({ message: 'Paire identifiant/mot de passe incorrecte' });
      } else {
        //si email ok, comparer le mot de passe entré par l'utilisateur avec le hash enregistré
        bcrypt
          .compare(req.body.password, user.password)
          .then((valid) => {
            //S'ils ne correspondent pas, nous renvoyons une erreur401 Unauthorized
            if (!valid) {
              res
                .status(401)
                .json({ message: 'Paire identifiant/mot de passe incorrecte' });
            } else {
              //si ok, réponse 200 contenant l'ID utilisateur et un token
              res.status(200).json({
                //le front qui récupère un objet avec userId et le token
                userId: user._id,
                //fonction sign pour chiffrer un nouveau token
                token: jwt.sign(
                  //1er argument: données à encoder = payload
                  //user_id encodé pour que seul le bon userid/utilisateur puisse modifiet/supprimer ses sauces
                  { userId: user._id },
                  //2ème argument: clé secrète pour l'encodage
                  'RANDOM_TOKEN_SECRET',
                  //3ème argument: expiration validité du token
                  {
                    expiresIn: '24h',
                  }
                ),
              });
            }
          })
          .catch((error) => res.status(500).json({ error }));
      }
    })
    .catch((error) => res.status(500).json({ error }));
};
