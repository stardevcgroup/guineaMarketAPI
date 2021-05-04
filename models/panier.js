const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

const panierShema = new Schema( {
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    produit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Produit'
    },
    quantite: {
        type: Number,
        require: true,
        default: 1
    }
}, {
    timestamps: true
} );

var Panier = mongoose.model('Panier', panierShema);
module.exports = Panier;