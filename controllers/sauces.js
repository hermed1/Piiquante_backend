const Sauce = require('../models/Sauce');
//importation du package file system de node
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  //comprends pas le .sauce, quoi d'autre dans le body ?
  //parse pour convertir le json string en objet utilisable
  const sauceObject = JSON.parse(req.body.sauce);
  //supprimer l'id qui est généré automatiquement par la bdd
  delete sauceObject._id;
  //supprimer userId: de la personne qui crée l'objet pour utiliser le userId du token à la place
  delete sauceObject._userId;
  const sauce = new Sauce({
    ...sauceObject,
    //userId extrait de l'objet req, grâce au middleware auth
    userId: req.auth.userId,
    //génération de l'URL de l'image: propriété protocol de req, le nom d'hôte du serveur,
    //le dossier images, le nom de fichier donné par multer
    imageUrl: `${req.protocol}://${req.get('host')}/images/${
      req.file.filename
    }`,
  });
  sauce
    .save()
    .then(() => {
      res.status(201).json({ message: 'sauce enregistrée' });
    })
    .catch((error) => res.status(400).json({ error }));
};

// exports.modifySauce = (req, res, next) => {
//   //premier argument: objet à modifier, second argument: nouvel objet
//   Sauce.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
//     .then(() => res.status(200).json({ message: 'Sauce modifiée' }))
//     .catch((error) => res.status(400).json({ error }));
// };
exports.modifySauce = (req, res, next) => {
  //vérifie si la raq contient un fichier
  const sauceObject = req.file
    ? {
        //si oui, on parse le json string
        //à quoi sert le spread ici ?
        ...JSON.parse(req.body.sauce),
        //
        imageUrl: `${req.protocol}://${req.get('host')}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  //là encore, pourquoi le spread ? req.body suffit pas ?
  //suppression du _userId venant de la req
  delete sauceObject._userId;
  //récupération de l'objet que l'on veut modifier de la BDD
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      //vérifions que l'objet trouvé appartient à l'utilisateur qui envoie la req
      if (sauce.userId != req.auth.userId) {
        //err 401: problème d'authentification
        res.status(401).json({ message: 'non autorisé' });
      } else {
        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: 'sauce modifiée' }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => res.status(400).json({ error }));
};

// exports.deleteSauce = (req, res, next) => {
//   Sauce.deleteOne({ _id: req.params.id })
//     .then(() => res.status(200).json({ message: 'Sauce supprimée' }))
//     .catch((error) => res.status(400).json({ error }));
// };

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: 'non autorisé' });
      } else {
        //récupération du filename: split à "/images/", récupération du nom qui est juste après images
        const filename = sauce.imageUrl.split('/images/')[1];
        // unlink prend le fichier à supprimer et le callback à exécuter une fois ce fichier supprimé.

        fs.unlink(`images/${filename}`, () => {
          //suppression de la sauce dans la BDD
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: 'sauce supprimée' });
            })
            .catch((error) => res.status(400).json({ error }));
        });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
  Sauce.find({})
    //envoi du tableau de toutes les sauces
    .then((sauces) => {
      res.status(200).json(sauces);
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.likeSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const likeNumber = req.body.like;
      if (likeNumber === 1) {
        //vérifions que le user n'a pas déjà liké la sauce
        if (sauce.usersLiked.includes(req.body.userId)) {
          res.status(401).json({ message: 'sauce déjà likée' });
        } else {
          Sauce.updateOne(
            { _id: req.params.id },
            {
              // Ajoute l'ID de l'utilisateur dans le tableau 'usersLiked' de la sauce
              $push: { usersLiked: req.body.userId },
              // Ajoute 1 au nombre de likes de la sauce
              $inc: { likes: +1 },
            }
          )
            .then(res.status(200).json({ message: "j'aime" }))
            .catch((error) => res.status(400).json({ error }));
        }
      } else if (likeNumber === -1) {
        //vérifions que le user n'a pas déjà disliké la sauce
        if (sauce.usersDisliked.includes(req.body.userId)) {
          res.status(401).json({ message: 'sauce déjà dislikée' });
        } else {
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $push: { usersDisliked: req.body.userId },
              $inc: { dislikes: +1 },
            }
          )
            .then(res.status(200).json({ message: "je n'aime pas" }))
            .catch((error) => res.status(400).json({ error }));
        }
      } else if (likeNumber === 0) {
        if (sauce.usersLiked.includes(req.body.userId)) {
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $pull: { usersLiked: req.body.userId },
              $inc: { likes: -1 },
            }
          )
            .then(res.status(200).json({ message: 'like supprimé' }))
            .catch((error) => res.status(400).json({ error }));
        } else if (sauce.usersDisliked.includes(req.body.userId)) {
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $pull: { usersDisliked: req.body.userId },
              $inc: { dislikes: -1 },
            }
          )
            .then(res.status(200).json({ message: 'dislike supprimé' }))
            .catch((error) => res.status(400).json({ error }));
        }
      }
    })
    .catch((error) => res.status(400).json({ error }));
};
