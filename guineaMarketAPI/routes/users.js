var express = require('express');
var router = express.Router();
var bodyParser = require( 'body-parser' );
var User = require( './../models/user' );
var passport = require( 'passport' );
var authenticate = require( './../authenticate' );
var upload = require( './../customMulter' );
var cors = require( './cors' );

var upload = upload;
router.use( bodyParser.json() )

/* GET users listing. */

router.get( '/', authenticate.verifyAdmin, cors.corsWithOptions, (req, res, next) => {
  User.find( {} )
  .then( ( utilisateur ) =>{
      res.json( utilisateur )
      }, ( err ) => { next( err ) 
  },  (err) => { res.json( { statusText: err.message, statusCode: err.status } ) })
  .catch((err) => next( err ) );//{ res.json( { statusText: err.message, statusCode: err.status } ) });
});
router.get( '/facebook/token', passport.authenticate('facebook-token'), ( req, res ) => {
  if( req.user ) {
    var token = authenticate.getToken( { _id: req.user._id, username: req.user.username, admin: req.user.admin } )
   res.statusCode = 200;
   res.setHeader( 'Content-Type', 'application/json' );
   res.json( { 
               success: true, 
               token: token,
               message: 'Vous êtes connectés avec succès !', 
               status: res.statusCode 
             } );
  } else {}
} );


/*router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
  if (req.user) {
    var token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token: token, status: 'You are successfully logged in!'});
  }
});*/


router.post('/signup',  cors.corsWithOptions, upload.single( 'avatar'), (req, res, next) => {
   
  User.register(new User({
      username: req.body.username, 
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      emails: req.body.emails,
      phones: req.body.phones,
      cin: req.body.cin,
      avatar: req.file? req.file.path.substr( "public".length ): "/images/users/avatar.png",
      admin: true
    }), 
    req.body.password, (err, user) => {
      user.save((err, user) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});
          return ;
        }
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: true, status: 'Inscription réussi!'});
        });
      });
  });
});

router.post( '/login',  cors.corsWithOptions, passport.authenticate('local') , ( req, res ) => {
  var token = authenticate.getToken( { _id: req.user._id, username: req.user.username, admin: req.user.admin } )
  res.statusCode = 200;
  res.setHeader( 'Content-Type', 'application/json' );
  res.json( { 
              success: true, 
              token: token,
              message: 'Vous êtes connectés avec succès !', 
              status: res.statusCode 
            } );
} );

router.get( '/logout',  cors.corsWithOptions, ( req, res, next ) => {
  if( req.session ) {
    req.session.destroy();
    res.clearCookie( 'session-id' );
    res.redirect('/')
  } else {
    var err = new Error( 'Vous êtes connectés !' )
    err.status = 403;
    res.statusCode = 403;
    next(err);
  }
} );


module.exports = router;