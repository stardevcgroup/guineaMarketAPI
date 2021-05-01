var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;
var passportLocalMongoose = require( 'passport-local-mongoose' );


var userSchema = new Schema( {
    avatar: {
        type: String,
        require: true,
        default: '/images/users/avatar.png'
    },
    firstname: {
        type: String,
        require: true
    },
    lastname: {
        type: String,
        require: true
    },
    emails: [],
    phones: [],
    cin: {
        type: String,
        require: true
    },
    admin: {
        type: Boolean,
        default: false
    },
    active: {
        type: Boolean,
        require: true,
        default: true
    },
    gender: {
      type: String,
      require: true,
      default: 'M'
    },
    profession: {
        type: String,
        require: true,
        default: 'N/A'
    },
    facebookId: String,
} );

userSchema.plugin( passportLocalMongoose );
var User = mongoose.model( 'User', userSchema );
module.exports = User;
