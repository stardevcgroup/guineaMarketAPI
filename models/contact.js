const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

const contactShema = new Schema( {
    telephones: [{
        type: String,
        require: true
    }],
    emails: [{
        type: String,
        require: true
    }],
    reseaux: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reseau'
    }]
}, {
    timestamps: true
} );

var Contact = mongoose.model('Contact', contactShema);
module.exports = Contact;