const multer = require('multer');

//stockage de nos MINE_TYPES
const MINE_TYPES = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
};

//storage contient la logique  pour indiquer à multer où enregistrer les fichiers entrants
const storage = multer.diskStorage({
  //l'objet passé à diskStorage a besoin de 2 éléments: destination et filename
  //la fonction destination indique à multer d'enregistrer les fichiers dans le dossier images
  destination: (req, file, callback) => {
    //null pour dire qu'il n'y a pas eu d'erreurs, nom du dossier en 2ème argument
    callback(null, 'images');
  },
  // fonction filename: crée le nom du fichier
  filename: (req, file, callback) => {
    //le split pour enlever les espaces puis join avec underscore
    const name = file.originalname.split(' ').join('_');
    //extension = élément de la variable qui match file.mimetype
    const extension = MINE_TYPES[file.mimetype];
    //null en 1er argument pour dire qu'il n'y a pas d'erreur
    //2ème argument: filename: ajout de la date à la ms près pour le rendre unique
    callback(null, name + Date.now() + '.' + extension);
  },
});

//exportation du middleware multer: appel de la méthode multer, on lui passe l'objet storage
//et appel de la méthode single pour dire qu'il s'agit d'un fichier unique VS groupe de fichiers
//valeur de single = image
module.exports = multer({ storage }).single('image');
