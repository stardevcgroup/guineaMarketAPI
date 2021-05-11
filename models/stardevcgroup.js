var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;



var stardevcgroupSshema = new Schema( {
    logos: [{
        type: String,
        require: true,
        default: '/images/login/logo.png'
    }],
    images: [
        { type: String }
    ],
    slogans: [
       {
           type: String
       } 
    ],
    nom: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    apropos: {
        type: String,
        require: true
    },
    technologies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Technologie'
    }],
    contact: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact'

    },
    services: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service'
        }
    ],
} );


var Stardevcgroup = mongoose.model( 'Stardevcgroup', stardevcgroupSshema );
module.exports = Stardevcgroup;
