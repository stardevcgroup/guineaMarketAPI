var express = require( 'express' );
var bodyParser = require( 'body-parser' );
const Produit = require('./../models/produit');
var authenticate = require( './../authenticate' );
var mongoose = require('mongoose');
const cors  = require('./cors');
const url = require('url');
const aqp = require( 'api-query-params' );


var upload = require( './../customMulter' )



var produitRouter = express.Router();
produitRouter.use( bodyParser.json() );

const verifyField = ( field ) => ( field===undefined || field.length === 0) ? false : true;


/* GET /produits */
produitRouter.route( '/' )
    .options( cors.corsWithOptions, ( req, res ) => { res.sendStatus( 200 ); } )
    .all( cors.corsWithOptions, ( req, res, next ) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        next();
    } )
    .get( cors.corsWithOptions, async (req, res, next) => {
        if (
            req.url.indexOf('designation') > 0 || req.url.indexOf('description') > 0 ||
            req.url.indexOf('prix') > 0 || req.url.indexOf('nature') > 0 ||
            req.url.indexOf('quantite') > 0
        ) {  
            await Produit.find({
                $or: [
                    { designation: { $regex: '.*' +  req.query['designation'] + '.*',  $options: 'i' } },
                    { description:  { $regex: '.*' +  req.query['description']  + '.*', $options: 'i' } },
                    { nature:  { $regex: '.*' + req.query['nature']  + '.*', $options: 'i' } },
                    { prix:  req.query['prix']===Number.NaN? 0:req.query['prix']  }     
                ]
                })
               .populate(['user'])
               .then( produits => {
                                res.json( produits );
                        }, err => {
                                res.statusCode = 404;
                                res.json({statusCode: res.statusCode, statusText: 'Produit non trouvé'})
                        } );
        } else {
            Produit.find( {} )
            .populate(['user'])
            .then( ( produits ) =>{
                produits.forEach( produit => {
                    if( produit.quantite == 0 ) {
                        Produit.findOneAndDelete( {_id: produit} )
                            .then( prod => {}  );
                    }  
                } ) 
                res.json( produits )
                }, ( err ) => { next( err ) 
            },  (err) => next(err))
            .catch((err) => next(err));
        }
    })
    .post( cors.corsWithOptions, authenticate.verifyUser, upload.array('images', 12), ( req, res, next ) =>{
        req.body.images = [];
        if( req.body.ville != undefined )
            req.body.ville = mongoose.Types.ObjectId( req.body.ville.trim() );
        if( req.user._id != undefined )
            req.body.user = req.user._id;
        if( req.files != undefined ) {
            req.files.forEach( file => {
                req.body.images.push(file.path.substr( 'public'.length ));
            } );
        }
        if( req.body != undefined ) {
            Produit.create( req.body )
                .then(( produit ) => {
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
        res.json({'message': 'La methode PUT n\'est pas supporté', 'status': res.statusCode } ); 
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
        const queryObject = url.parse(req.url,true).query;
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