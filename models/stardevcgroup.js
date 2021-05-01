var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;



var stardevcgroupSshema = new Schema( {
    login: {
        type: String,
        require: true,
        default: '/images/login/logo.png'
    },
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
    technologies: {
        type: String,
        require: true
    },
    emails: [],
    phones: [],
} );


var Stardevcgroup = mongoose.model( 'Stardevcgroup', stardevcgroupSshema );
module.exports = Stardevcgroup;
