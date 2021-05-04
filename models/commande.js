const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

const commandeShema = new Schema( {
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
    },
    valider: {
        type: Boolean,
        require: true,
        default: false
    }
}, {
    timestamps: true
} );

var Commande = mongoose.model('Commande', commandeShema);
module.exports = Commande;