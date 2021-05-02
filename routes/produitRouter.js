var express = require( 'express' );
var bodyParser = require( 'body-parser' );
const Produit = require('./../models/produit');
var authenticate = require( './../authenticate' );
var mongoose = require('mongoose');
const cors  = require('./cors');

var upload = require( './../customMulter' )



var produitRouter = express.Router();
produitRouter.use( bodyParser.json() );



/* GET /produits */
produitRouter.route( '/' )
    .options( cors.corsWithOptions, ( req, res ) => { res.sendStatus( 200 ); } )
    .all( cors.corsWithOptions, ( req, res, next ) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        next();
    } )
    .get( cors.corsWithOptions,  (req, res, next) => {
        Produit.find( {} )
        .populate(['user'])
        .then( ( produit ) =>{
            res.json( produit )
            }, ( err ) => { next( err ) 
        },  (err) => next(err))
        .catch((err) => next(err));
    })
    .post( cors.corsWithOptions, authenticate.verifyUser, upload.array('images', 12), ( req, res, next ) =>{
        console.log( "*****", req.body )
        req.body.images = [];
        if( req.body.ville != undefined )
            req.body.ville = mongoose.Types.ObjectId( req.body.ville.trim() );
        if( req.body.user != undefined )
            req.body.user = mongoose.Types.ObjectId( req.body.user.trim() );
        if( req.files != undefined ) {
            req.files.forEach( file => {
                req.body.images.push(file.path.substr( 'public'.length ));
            } );
        }
        if( req.body != undefined ) {
            Produit.create( req.body )
                .then(( produit ) => {
                    console.log( 'produit crée ', produit );
                    res.json( produit );
                }, (err) => next( err ) )
                .catch( ( err ) => next( err ) );
        } else {
            err = new Error('Produit  non trouvé');
            err.status = 404;
            res.json({'message': err.message, 'status': err.status });
        } 
    } )
    .put( cors.corsWithOptions,  authenticate.verifyUser, authenticate.verifyAdmin, ( req, res, next ) => {
        res.statusCode = 403;
        res.json({'message': 'La methode PUT n\'est pas supporté', 'status': res.statusCode } )
    } )
    .delete( cors.corsWithOptions,  authenticate.verifyUser, ( req, res, next ) => {
        Produit.remove({})
        .then( ( resp ) => {
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));    
    });

/* GET /produits/:id */
produitRouter.route( '/:id' )
    .options( cors.corsWithOptions, ( req, res ) => { res.sendStatus( 200 ); } )
    .all( cors.cors,  ( req, res, next ) => {
        res.statusCode = 200;
        res.setHeader( 'Content-type',  'application/json' );
        next();
    } )
    .get( cors.cors, (req, res, next) => {
        Produit.findById( req.params.id )
            .populate([ 'user'])
            .then( ( produit ) => {
                res.json( produit );
            }, (err) => next( err ) )
            .catch( ( err ) => {
                err = new Error('Produit ' + req.params.id + ' non trouvé'); next( err );
                err.status = 404;
                res.json({'message': err.message, 'status': err.status });
            } );
    })
    .post( cors.corsWithOptions, authenticate.verifyUser, ( req, res, next ) =>{
        res.statusCode = 403;
        res.json({'message': 'La methode POST n\'est pas supporté.', 'status': res.statusCode } )
    } )
    .put( cors.corsWithOptions, authenticate.verifyUser, authenticate.productOwner, upload.array('images', 12), ( req, res, next ) => {
        Produit.findById( req.params.id )
            .then( ( produit ) => {
            
                if( req.body.user != undefined )
                    req.body.user = mongoose.Types.ObjectId( req.body.user.trim() );

                req.body.images = [];


                if( req.files.length > 0 || req.files != null ) {
                    req.files.forEach( file => {
                        req.body.images.push('/images/produits/' + file.originalname);
                    } );
                }

            if( produit.user.toString() === req.user._id.toString() ) {
                    Produit.findOneAndUpdate( {_id: req.params.id} , {
                        $set: req.body
                    }, { new: true })
                    .then( ( ville ) => {
                        res.json( ville );
                    }, ( err ) => next( err ) )
                    .catch( ( err ) => next( err ) );
            } else {
                let err = new Error( 'Vous ne pouvez pas mettre à jour un ' + req.body.designation + ', ça ne vous appartient pas ?' );
                err.status = 403;
                res.statusCode = 403;
                res.json( {statusCode: res.statusCode, statusText: err.message } );
                }
        }, (err) => next( err ) )
        .catch( ( err ) => {
                err = new Error('Produit ' + req.params.id + ' non trouvé'); next( err );
                err.status = 404;
                res.json({'message': err.message, 'status': err.status });
        } );
    } )
    .delete( cors.corsWithOptions, authenticate.verifyUser, ( req, res, next ) => {
        Produit.findById( req.params.id )
        .then( ( produit ) => {
            if( produit.user.toString() === req.user._id.toString() ) {
                console.log( produit.user +'=='+ req.user._id)
                Produit.findByIdAndRemove(req.params.id)
                    .then( ( resp ) => {
                        res.json(resp);
                    }, ( err ) => {
                        err = new Error('Produit ' + req.params.id + ' non trouvé'); next( err );
                        err.status = 404;
                        res.json({'message': err.message, 'status': err.status });
                    } )
                    .catch( ( err ) => next( err ) );
            } else {
                let err = new Error( 'Vous ne pouvez pas supprimé ' + produit.designation + ', ça ne vous appartient pas ?' );
                err.status = 403;
                res.statusCode = 403;
                res.json( {statusCode: res.statusCode, statusText: err.message } );
            } 
        }, err => { next( err ) } );
        
    } );

module.exports = produitRouter;