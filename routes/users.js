var express = require('express');
var router = express.Router();
var bodyParser = require( 'body-parser' );
var User = require( './../models/user' );
var passport = require( 'passport' );
var authenticate = require( './../authenticate' );
var cors = require( './cors' );

var mutlter = require( 'multer' );
var fs = require( 'fs' );


var storage = mutlter.diskStorage( {

  destination: ( req, file, cb ) => {
      let dir = extraireUsenamewithArrobase( req.headers.authorization, 'users' );
      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
      }
      cb( null, dir );
  },
  filename: ( req, file, cb ) => {
      cb( null, file.originalname );
  }
} );

const imageFilter = ( req, file, cb ) => {
  if( !file.originalname.match( /\.(jpg|jpeg|png|gif)$/) ) {
      return cb( 'Vous ne pouvez télécharger que des fichiers: jpg, jpeg, png et gif', null );
  }
  cb( null, true)
};
var upload = mutlter({ storage: storage, fileFilter: imageFilter });

router.use( bodyParser.json() )

/* GET users listing. */

router.get( '/',  (req, res, next) => {
  User.find( {} )
  .then( ( utilisateur ) =>{
      res.json( utilisateur )
      }, ( err ) => { next( err ) 
  },  (err) => { res.json( { statusText: err.message, statusCode: err.status } ) })
  .catch((err) => next( err ) );//{ res.json( { statusText: err.message, statusCode: err.status } ) });
});
/* GET user by id. */
router.get( '/:id',  (req, res, next) => {
  User.findById( {_id: req.params.id} )
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
  var avatar = '/images/users/avatar.png';
  if( req.file ) {
    user.avatar = req.file.path.substr( "public".length );
  }
   
  User.register(new User(
                      {
                        username: req.body.username,
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        emails: req.body.emails,
                        phones: req.body.phones,
                        avatar: avatar,
                        cin: req.body.cin
                      }), 
    req.body.password, (err, user) => {
    if(err) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: true, status: 'Inscription réussi!'});
    }
    else {
      if (req.body.firstname)
        user.firstname = req.body.firstname;
      if (req.body.lastname)
        user.lastname = req.body.lastname;
      if (req.body.email)
        user.email = req.body.email;
      if (req.body.phone)
        user.phone = req.body.phone;
      if (req.body.cin)
        user.cin = req.body.cin;
      
      User.save((err, user) => {
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
    }
  });
});

router.post( '/login', passport.authenticate('local') , ( req, res ) => {
  res.setHeader( 'Content-Type', 'application/json' );
  if ( req.body.password === undefined || req.body.password == null) {
    let err = new Error( 'username et le mot de passe sont réquis' );
    err.status = 403;
    res.statusCode = 403;
    res.statusCode = 200;
    res.json({ statusCode: res.statusCode, statusText: err.message })
  } else {
    var token = authenticate.getToken( { _id: req.user._id, username: req.user.username, admin: req.user.admin } )
    res.statusCode = 200;
    res.json( { 
      success: true, 
      token: token,
      message: 'Vous êtes connectés avec succès !', 
      status: res.statusCode 
    } );
  }
} );



router.put("/reset-password/:id", function(req, res) {
  var userid = req.params.id;
  var username = req.body.username;
  var newPass = req.body.password;
  User.findByUsername(username).then(function(sanitizedUser) {
      if (sanitizedUser) {
          sanitizedUser.setPassword(newPass, function() {
              sanitizedUser.save();
              res.send('réinitialisation du mot de passe réussie');
          });
      } else {
          res.send('L\'utilisateur n\'existe pas');
      }
  }, ( err ) => {
     next(err)
  })
})



router.put('/update/:id', cors.corsWithOptions, ( req, res, next ) => {
  User.findOneAndUpdate( {_id: req.params.id} , {
    $set: req.body
  }, { new: true })
  .then( ( user ) => {
    res.json( user );
  }, ( err ) => next( err ) )
   .catch( ( err ) => next( err ) );     
} )


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