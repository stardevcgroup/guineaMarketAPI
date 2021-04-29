const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

const utilisateurShema = new Schema( {
    avatar: {
        type: String,
        require: false
    },
    nom: {
        type: String,
        require: true
    },
    prenom: {
        type: String,
        require: true
    },
    cin: {
        type: String,
        require: true,
        unique: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    motDePasse: {
        type: String,
        require: true
    },
    telephone: {
        type: String,
        require: true,
        unique: true
    }

}, {
    timestamps: true
} );

var Utilisateur = mongoose.model('Utilisateur', utilisateurShema);
module.exports = Utilisateur;