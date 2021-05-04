const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

const ActualiteShema = new Schema( {
    titre: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    valide: {
        type: Boolean,
        require: true,
        default: false,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    image: {
        type: String,
        require: false
    }
}, {
    timestamps: true
} );

var Actualite = mongoose.model('Actualite', ActualiteShema);
module.exports = Actualite;