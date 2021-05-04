var express = require( 'express' );
var bodyParser = require( 'body-parser' );
const Actualite = require('./../models/actualite');
var authenticate = require( './../authenticate' );
var mongoose = require('mongoose');
const cors  = require('./cors');
const extraireUsenamewithArrobase = require( './../extraireUsername' );

var mutlter = require( 'multer' );
var fs = require( 'fs' );


var storage = mutlter.diskStorage( {

  destination: ( req, file, cb ) => {
      let dir = extraireUsenamewithArrobase( req.headers.authorization, 'actualites' );
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



var actualiteRouter = express.Router();
actualiteRouter.use( bodyParser.json() );



/* GET /produits */
actualiteRouter.route( '/' )
    .options( cors.corsWithOptions, ( req, res ) => { res.sendStatus( 200 ); } )
    .all( cors.corsWithOptions, ( req, res, next ) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        next();
    } )
    .get( cors.corsWithOptions,  (req, res, next) => {
        Actualite.find( {} )
        .populate('user')
        .then( ( actualite ) =>{
            res.json( actualite )
            }, ( err ) => { next( err ) 
        },  (err) => next(err))
        .catch((err) => next(err));
    })
    .post( cors.corsWithOptions, authenticate.verifyUser, upload.single('image'), ( req, res, next ) =>{
        
        if ( req.user._id !== null )
            req.body.user = req.user._id;
        if( req.file !== null ) {
            req.body.image = req.file.path.substr( 'public'.length );
        }
        
        if( req.body != undefined ) {
            Actualite.create( req.body )
                .then(( actualite ) => {
                    res.json( actualite );
                }, (err) => next( err ) )
                .catch( ( err ) => next( err ) );
        } else {
            err = new Error('Actualité  non trouvée');
            err.status = 404;
            res.json({'message': err.message, 'status': err.status });
        } 
    } )
    .put( cors.corsWithOptions,  authenticate.verifyUser, authenticate.verifyAdmin, ( req, res, next ) => {
        res.statusCode = 403;
        res.json({'message': 'La methode PUT n\'est pas supporté', 'status': res.statusCode } ); 
    } )
    .delete( cors.corsWithOptions,  authenticate.verifyUser, authenticate.verifyAdmin, ( req, res, next ) => {
        Actualite.remove({})
        .then( ( resp ) => {
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));    
    });

/* GET /produits/:id */
actualiteRouter.route( '/:id' )
    .options( cors.corsWithOptions, ( req, res ) => { res.sendStatus( 200 ); } )
    .all( cors.cors,  ( req, res, next ) => {
        res.statusCode = 200;
        res.setHeader( 'Content-type',  'application/json' );
        next();
    } )
    .get( cors.cors, (req, res, next) => {
        Actualite.findById( req.params.id )
            .populate([ 'user'])
            .then( ( actualite ) => {
                res.json( actualite );
            }, (err) => next( err ) )
            .catch( ( err ) => {
                err = new Error('Actualité ' + req.params.id + ' non trouvée'); next( err );
                err.status = 404;
                res.json({'message': err.message, 'status': err.status });
            } );
    })
    .post( cors.corsWithOptions, authenticate.verifyUser, ( req, res, next ) =>{
        res.statusCode = 403;
        res.json({'message': 'La methode POST n\'est pas supporté.', 'status': res.statusCode } )
    } )
    .put( cors.corsWithOptions, authenticate.verifyUser, authenticate.productOwner, upload.single('image'), ( req, res, next ) => {
        Actualite.findById( req.params.id )
            .then( ( actualite ) => {
            
                if( req.body.user != undefined )
                    req.body.user = mongoose.Types.ObjectId( req.body.user.trim() );

                req.body.images = [];


                if( req.file > 0 || req.file != null ) {
                        req.body.image = '/images/actualites/' + file.originalname;
                }

            if( actualite.user.toString() === req.user._id.toString() ) {
                    Actualite.findOneAndUpdate( {_id: req.params.id} , {
                        $set: req.body
                    }, { new: true })
                    .then( ( ville ) => {
                        res.json( ville );
                    }, ( err ) => next( err ) )
                    .catch( ( err ) => next( err ) );
            } else {
                let err = new Error( 'Vous ne pouvez pas mettre à jour un ' + req.body.titre + ', ça ne vous appartient pas ?' );
                err.status = 403;
                res.statusCode = 403;
                res.json( {statusCode: res.statusCode, statusText: err.message } );
                }
        }, (err) => next( err ) )
        .catch( ( err ) => {
                err = new Error('Actualité ' + req.params.id + ' non trouvé'); next( err );
                err.status = 404;
                res.json({'message': err.message, 'status': err.status });
        } );
    } )
    .delete( cors.corsWithOptions, authenticate.verifyUser, ( req, res, next ) => {
        Actualite.findById( req.params.id )
        .then( ( actualite ) => {
            if( actualite.user.toString() === req.user._id.toString() ) {
                Produit.findByIdAndRemove(req.params.id)
                    .then( ( resp ) => {
                        res.json(resp);
                    }, ( err ) => {
                        err = new Error('Actualité ' + req.params.id + ' non trouvée'); next( err );
                        err.status = 404;
                        res.json({'message': err.message, 'status': err.status });
                    } )
                    .catch( ( err ) => next( err ) );
            } else {
                let err = new Error( 'Vous ne pouvez pas supprimer ' + actualite.titre + ', ça ne vous appartient pas ?' );
                err.status = 403;
                res.statusCode = 403;
                res.json( {statusCode: res.statusCode, statusText: err.message } );
            } 
        }, err => { next( err ) } );
        
    } );

module.exports = actualiteRouter;