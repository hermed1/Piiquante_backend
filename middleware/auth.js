const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  //middleware pour extraire les infos du token et les transmettre aux autres middlewares
  try {
    //req.headers.authorization = deux strings, bearer + token en 2ème. split + 2ème élément du tableau
    const token = req.headers.authorization.split(' ')[1];
    //appel à la méthode verify de jwt: on lui passe le token récupéré et la clé secrète
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    //récupération du userId du token décodé
    const userId = decodedToken.userId;
    //On rajoute le userId à l'objet request qui est transmis aux routes appelées
    req.auth = {
      userId: userId,
    };
    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};
