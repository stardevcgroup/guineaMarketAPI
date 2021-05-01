var passport = require( 'passport' );
var localStrategy = require( 'passport-local' ).Strategy;
var User = require( './models/user' );
var JwtStrategy = require( 'passport-jwt' ).Strategy;
var ExtractJwt = require( 'passport-jwt' ).ExtractJwt;
var jwt = require( 'jsonwebtoken' );
var Produit = require( './models/produit' );
var jwt_decode = require( 'jwt-decode' );
var FacebookTokenStrategy = require( 'passport-facebook-token' );

var config = require( './config' );

exports.local = passport.use( new localStrategy( User.authenticate() ) );
passport.serializeUser( User.serializeUser() );
passport.deserializeUser( User.deserializeUser() );

//Créetion de JWTToken avec passportJwt, jsonwebtoken
exports.getToken = ( user ) => {
    return jwt.sign( user, config.secretKey, { expiresIn: 7200 } )
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(  );
opts.secretOrKey = config.secretKey;

exports.jwtPasssport = passport.use( new JwtStrategy( opts, ( jwt_payload, done ) => { 
                                console.log( 'JWT payload: ' + jwt_payload );
                                User.findOne( { _id: jwt_payload._id }, ( err, user ) => {
                                    if( err ) {
                                        err.status = 403;
                                        return done( err, false )
                                    } else  if( user ) {
                                        return done( null, user );
                                    } else {
                                        return done( null, false )
                                    }
                                } )
                        } ) );

//Cette méthode vérifie l'utilisateur en desactivant la session
exports.verifyUser = passport.authenticate( 'jwt', { session: false } );

exports.verifyAdmin = ( req, res, next ) => {
    var user = jwt_decode(req.headers.authorization);
    var admin = user.admin ;
	if ( admin ) {
		next();
	} else {
		var err = new Error('Vous n\'êtes pas autorisé à effectuer cette opération, devez être admin!!');
		err.status = 403;
        res.statusCode = 403;
		return res.json({statusCode: err.status, statusText: err.message});
	}
};

exports.productOwner = ( req, res, next ) => {
    if ( req.user._id != null ) {
        next()
    }  else {
        err = new Error( 'Veuillez vous connectez d\'abord' );
        err.status = 403;
        res.status = 403;
        res.json({ statusCode: res.statusCode, statusText: err.message } );
    }
}

/*exports.facebookPassport = passport.use(new FacebookTokenStrategy({
    clientID: config.facebook.clientId,
    clientSecret: config.facebook.clientSecret
}, (accessToken, refreshToken, profile, done) => {
    User.findOne({facebookId: profile.id}, (err, user) => {
        if (err) {
            return done(err, false);
        }
        if (!err && user !== null) {
            return done(null, user);
        }
        else {
            user = new User({ username: profile.displayName });
            user.facebookId = profile.id;
            user.firstname = profile.name.givenName;
            user.lastname = profile.name.familyName;
            user.save((err, user) => {
                if (err)
                    return done(err, false);
                else
                    return done(null, user);
            })
        }
    });
}
));*/

exports.facebookPassoprt = passport.use( 
         new FacebookTokenStrategy( {
             clientID: config.facebook.clientId,
             clientSecret: config.facebook.clientSecret
         }, 
          ( accessToken, refreshToken, profile, done ) => {
              User.findOne( { facebookId: profile.id }, ( err, user ) => {
                  if ( err ) {
                      return done( err, false )
                  } 
                  if ( !err && user !== null ) {
                      return done( null, user );
                  } else {
                      user = new User( 
                          { username: profile.displayName} );
                          user.firstname = profile.name.givenName;
                          user.lastname = profile.name.familyName;
                          profile.emails.forEach( email => user.emails.push(email.value) );
                          user.avar = profile.photos[0];
                          user.gender = profile.gender;
                          user.phones = profile.phones;
                          user.facebookId = profile.facebookId;
                          user.save( ( err, user ) => {
                              if( err ) {
                                  return done( err, false );
                              } else {
                                  return done( null, user );
                              }
                          } )
                  }
              } )
          }
         )
    );