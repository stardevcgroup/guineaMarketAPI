var express = require( 'express' );
var bodyParser = require( 'body-parser' );
const Service = require('./../models/service');
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



var serviceRouter = express.Router();
serviceRouter.use( bodyParser.json() );



/* GET /services */
serviceRouter.route( '/' )
    .options( cors.corsWithOptions, ( req, res ) => { res.sendStatus( 200 ); } )
    .all( cors.corsWithOptions, ( req, res, next ) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        next();
    } )
    .get( cors.corsWithOptions,  (req, res, next) => {
        Service.find( {} )
        .then( ( services ) =>{
            res.json( services )
            }, ( err ) => { next( err ) 
        },  (err) => next(err))
        .catch((err) => next(err));
    })
    .post( cors.corsWithOptions, authenticate.verifyUser, ( req, res, next ) =>{
        
        if( req.body != undefined ) {
            Service.create( req.body )
                .then(( service ) => {
                    res.json( service );
                }, (err) => next( err ) )
                .catch( ( err ) => next( err ) );
        } else {
            err = new Error('service  non trouvé');
            err.status = 404;
            res.json({'message': err.message, 'status': err.status });
        } 
    } )
    .put( cors.corsWithOptions,  authenticate.verifyUser, authenticate.verifyAdmin, ( req, res, next ) => {
        res.statusCode = 403;
        res.json({'message': 'La methode PUT n\'est pas supporté', 'status': res.statusCode } ); 
    } )
    .delete( cors.corsWithOptions,  authenticate.verifyUser,  ( req, res, next ) => {
        Service.remove({})
        .then( ( resp ) => {
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));    
    });

/* GET /services/:id */
serviceRouter.route( '/:id' )
    .options( cors.corsWithOptions, ( req, res ) => { res.sendStatus( 200 ); } )
    .all( cors.cors,  ( req, res, next ) => {
        res.statusCode = 200;
        res.setHeader( 'Content-type',  'application/json' );
        next();
    } )
    .get( cors.cors, (req, res, next) => {
        Service.findById( req.params.id )
            .then( ( service ) => {
                res.json( service );
            }, (err) => next( err ) )
            .catch( ( err ) => {
                err = new Error('service ' + req.params.id + ' non trouvé'); next( err );
                err.status = 404;
                res.json({'message': err.message, 'status': err.status });
            } );
    })
    .post( cors.corsWithOptions, authenticate.verifyUser, ( req, res, next ) =>{
        res.statusCode = 403;
        res.json({'message': 'La methode POST n\'est pas supporté.', 'status': res.statusCode } )
    } )
    .put( cors.corsWithOptions, authenticate.verifyUser, authenticate.productOwner, ( req, res, next ) => {
        Service.findById( req.params.id )
            .then( ( service ) => {

                    if( service ) {
                        Service.findOneAndUpdate( {_id: req.params.id} , {
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
                        err = new Error('service ' + req.params.id + ' non trouvé'); next( err );
                        err.status = 404;
                        res.json({'message': err.message, 'status': err.status });
                } );
    } )
    .delete( cors.corsWithOptions, authenticate.verifyAdmin, ( req, res, next ) => {
        Service.findById( req.params.id )
                .then( ( service ) => {
                    if( service ) {
                        Service.findByIdAndRemove(req.params.id)
                            .then( ( resp ) => {
                                res.json(resp);
                            }, ( err ) => {
                                err = new Error('service ' + req.params.id + ' non trouvé'); next( err );
                                err.status = 404;
                                res.json({'message': err.message, 'status': err.status });
                            } )
                            .catch( ( err ) => next( err ) );
                    } else {
                        let err = new Error( 'Vous ne pouvez pas supprimer ' + service.nom + ', ça ne vous appartient pas ?' );
                        err.status = 403;
                        res.statusCode = 403;
                        res.json( {statusCode: res.statusCode, statusText: err.message } );
                    } 
                }, err => { next( err ) } );
                
    } );

module.exports = serviceRouter;