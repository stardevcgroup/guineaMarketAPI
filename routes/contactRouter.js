var express = require( 'express' );
var bodyParser = require( 'body-parser' );
const Contact = require('./../models/contact');
var authenticate = require( './../authenticate' );
var mongoose = require('mongoose');
const cors  = require('./cors');
const extraireUsenamewithArrobase = require( './../extraireUsername' );

var mutlter = require( 'multer' );
var fs = require( 'fs' );


var storage = mutlter.diskStorage( {

  destination: ( req, file, cb ) => {
      let dir = extraireUsenamewithArrobase( req.headers.authorization, 'stardevcgroups' );
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



var contactRouter = express.Router();
contactRouter.use( bodyParser.json() );



/* GET /contact */
contactRouter.route( '/' )
    .options( cors.corsWithOptions, ( req, res ) => { res.sendStatus( 200 ); } )
    .all( cors.corsWithOptions, ( req, res, next ) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        next();
    } )
    .get( cors.corsWithOptions,  (req, res, next) => {
        Contact.find( {} )
        .populate(['reseaux'])
        .then( ( contacts ) =>{
            res.json( contacts )
            }, ( err ) => { next( err ) 
        },  (err) => next(err))
        .catch((err) => next(err));
    })
    .post( cors.corsWithOptions, authenticate.verifyUser, ( req, res, next ) =>{
        
        if( req.body != undefined ) {
            Contact.create( req.body )
                .then(( contact ) => {
                    res.json( contact );
                }, (err) => next( err ) )
                .catch( ( err ) => next( err ) );
        } else {
            err = new Error('contact  non trouvé');
            err.status = 404;
            res.json({'message': err.message, 'status': err.status });
        } 
    } )
    .put( cors.corsWithOptions,  authenticate.verifyUser, authenticate.verifyAdmin, ( req, res, next ) => {
        res.statusCode = 403;
        res.json({'message': 'La methode PUT n\'est pas supporté', 'status': res.statusCode } ); 
    } )
    .delete( cors.corsWithOptions,  authenticate.verifyUser,  ( req, res, next ) => {
        Contact.remove({})
        .then( ( resp ) => {
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));    
    });

/* GET /contact/:id */
contactRouter.route( '/:id' )
    .options( cors.corsWithOptions, ( req, res ) => { res.sendStatus( 200 ); } )
    .all( cors.cors,  ( req, res, next ) => {
        res.statusCode = 200;
        res.setHeader( 'Content-type',  'application/json' );
        next();
    } )
    .get( cors.cors, (req, res, next) => {
        Contact.findById( req.params.id )
            .populate([ 'reseau'])
            .then( ( contact ) => {
                res.json( contact );
            }, (err) => next( err ) )
            .catch( ( err ) => {
                err = new Error('contact ' + req.params.id + ' non trouvé'); next( err );
                err.status = 404;
                res.json({'message': err.message, 'status': err.status });
            } );
    })
    .post( cors.corsWithOptions, authenticate.verifyUser, ( req, res, next ) =>{
        res.statusCode = 403;
        res.json({'message': 'La methode POST n\'est pas supporté.', 'status': res.statusCode } )
    } )
    .put( cors.corsWithOptions, authenticate.verifyUser, authenticate.productOwner, ( req, res, next ) => {
        Contact.findById( req.params.id )
            .then( ( contact ) => {

                    if( contact ) {
                        Contact.findOneAndUpdate( {_id: req.params.id} , {
                                $set: req.body
                            }, { new: true })
                            .then( ( cont ) => {
                                res.json( cont );
                            }, ( err ) => next( err ) )
                            .catch( ( err ) => next( err ) );
                    } else {
                        let err = new Error( 'Vous ne pouvez pas mettre à jour un ' + req.body.nom + ', ça ne vous appartient pas ?' );
                        err.status = 403;
                        res.statusCode = 403;
                        res.json( {statusCode: res.statusCode, statusText: err.message } );
                        }
                }, (err) => next( err ) )
                .catch( ( err ) => {
                        err = new Error('contact ' + req.params.id + ' non trouvé'); next( err );
                        err.status = 404;
                        res.json({'message': err.message, 'status': err.status });
                } );
    } )
    .delete( cors.corsWithOptions, authenticate.verifyAdmin, ( req, res, next ) => {
        Contact.findById( req.params.id )
        .then( ( contact ) => {
            if( contact ) {
                Contact.findByIdAndRemove(req.params.id)
                    .then( ( resp ) => {
                        res.json(resp);
                    }, ( err ) => {
                        err = new Error('contact ' + req.params.id + ' non trouvé'); next( err );
                        err.status = 404;
                        res.json({'message': err.message, 'status': err.status });
                    } )
                    .catch( ( err ) => next( err ) );
            } else {
                let err = new Error( 'Vous ne pouvez pas supprimer ' + contact.nom + ', ça ne vous appartient pas ?' );
                err.status = 403;
                res.statusCode = 403;
                res.json( {statusCode: res.statusCode, statusText: err.message } );
            } 
        }, err => { next( err ) } );
        
    } );

module.exports = contactRouter;