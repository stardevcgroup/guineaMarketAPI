const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

const serviceSchema = new Schema( {
    nom: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    images: {
        type: String,
        require: true,
        default: 'images/service/service.png'
    },
    video: {
        type: String,
        require: true,
        default: ''
    }
}, {
    timestamps: true
} );

var Service = mongoose.model('Service', serviceSchema);
module.exports = Service;