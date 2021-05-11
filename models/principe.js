const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

const principeSchema = new Schema( {
    titre: {
        type: String,
        require: true
    },
    contenu: {
        type: String,
        require: true
    }
}, {
    timestamps: true
} );

var Principe = mongoose.model('Principe', principeSchema);
module.exports = Principe;