const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

const villeShema = new Schema( {
    nom: {
        type: String,
        require: true
    },
    quartier: {
        type: String
    },
    adresse: {
        type: String,
        require: true
    },
    latitude: {
        type: Number,
        require: false
    },
    longitude: {
        type: Number,
        require: false
    }
}, {
    timestamps: true
} );

var Ville = mongoose.model('Ville', villeShema);
module.exports = Ville;