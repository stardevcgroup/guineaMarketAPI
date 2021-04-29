const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

const reseauSchema = new Schema( {
    nom: {
        type: String,
        require: true
    },
    url: {
        type: String,
        require: true
    }

}, {
    timestamps: true
} );

var Reseau = mongoose.model('Reseau', reseauSchema);
module.exports = Reseau;