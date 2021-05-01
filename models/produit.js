const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

const produitShema = new Schema( {
    designation: {
        type: String,
        require: true,
        default: ''
    },
    prix: {
        type: Number,
        require: true,
        default: 0
    },
    description: {
        type: String,
        require: true,
        default: 'Veuille ajouter une description pour permetre aux internautes de comprendre votre produit'
    },
    quantite: {
        type: Number,
        require: true,
        min: 0,
        default: 1
    },
    disponible: {
        type: Boolean,
        require: true,
        default: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    images: [{
        type: String,
        require: true,
        default: '/image/produits/produit.png'
    }],
    ville: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ville'
    },
    categorie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categorie'
    },
    natutre: {
        type: String,
        require: true,
        default: 'Occasion'
    },
    reseau: [],
}, {
    timestamps: true
} );

var Produit = mongoose.model('Produit', produitShema);
module.exports = Produit;