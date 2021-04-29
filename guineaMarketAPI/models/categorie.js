const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

const categorieShema = new Schema( {
    libele: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    }
}, {
    timestamps: true
} );

var Categorie = mongoose.model('Categorie', categorieShema);
module.exports = Categorie;