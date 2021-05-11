const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

const technologieShema = new Schema( {
    nom: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    langages: [{
        type: String,
    }],
    frameworks: [{
        type: String,
    }]
}, {
    timestamps: true
} );

var Technologie = mongoose.model('Technologie', technologieShema);
module.exports = Technologie;