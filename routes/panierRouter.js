var express = require( 'express' );
var bodyParser = require( 'body-parser' );
const Panier = require('./../models/panier');
var authenticate = require( './../authenticate' );
const cors  = require('./cors');


var panierRouter = express.Router();
panierRouter.use( bodyParser.json() );



/* GET /paniers */
panierRouter.route( '/' )
    .options( cors.corsWithOptions, ( req, res ) => { res.sendStatus( 200 ); } )
    .all( cors.corsWithOptions, ( req, res, next ) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        next();
    } )
    .get( cors.corsWithOptions, authenticate.verifyUser,  (req, res, next) => {
        Panier.find( {} )
        .populate(['produit'])
        .then( ( paniers ) =>{
                if (paniers != null ) {
                    MyPanirs = [];
                    paniers.forEach( panier => {
                        if ( req.user._id.toString() === panier.user.toString() ) {
                            if( panier.produit == null ) {
                                panier.deleteOne( {_id: panier.id })
                                      .then( p => {} )
                            }
                            MyPanirs.push( panier );
                        }
                    } );

                    res.json( MyPanirs )
                } else {
                    res.json(paniers)
                }
            }, ( err ) => { next( err ) 
        },  (err) => next(err))
        .catch((err) => next(err));
    })
    .post( cors.corsWithOptions, authenticate.verifyUser, ( req, res, next ) =>{
        
        if ( req.user._id !== null )
            req.body.user = req.user._id;
        
        
        if( req.body !== null ) {
           Panier.findOne( { user: req.user._id, produit: req.body.produit} )
                 .then( panierUp => {
                     if ( panierUp != null  ) {
                        Panier.findOneAndUpdate( 
                            { user: req.user._id, produit: req.body.produit}, 
                            {$set: {quantite: req.body.quantite}}, {new: true} )
                        .then(( panier ) => {
                            res.json( panier );
                        }, (err) => next( err ) )
                        .catch( ( err ) => next( err ) );
                     } else {
                        Panier.create( req.body )
                        .then(( panier ) => {
                            res.json( panier );
                        }, (err) => next( err ) )
                        .catch( ( err ) => next( err ) );
                     }
                 } )
        } else {
            err = new Error('Panier  non trouvé');
            err.status = 404;
            res.json({'message': err.message, 'status': err.status });
        } 
    } )
    .put( cors.corsWithOptions,  authenticate.verifyUser, authenticate.verifyAdmin, ( req, res, next ) => {
        res.statusCode = 403;
        res.json({'message': 'La methode PUT n\'est pas supporté', 'status': res.statusCode } ); 
    } )
    .delete( cors.corsWithOptions,  authenticate.verifyUser, authenticate.verifyAdmin, ( req, res, next ) => {
        Panier.remove({})
        .then( ( resp ) => {
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));    
    });

/* GET /paniers/:id */
panierRouter.route( '/:id' )
    .options( cors.corsWithOptions, ( req, res ) => { res.sendStatus( 200 ); } )
    .all( cors.cors,  ( req, res, next ) => {
        res.statusCode = 200;
        res.setHeader( 'Content-type',  'application/json' );
        next();
    } )
    .get( cors.cors, (req, res, next) => {
        Panier.findById( req.params.id )
            .populate([ 'user', 'produit'])
            .then( ( panier ) => {
                res.json( panier );
            }, (err) => next( err ) )
            .catch( ( err ) => {
                err = new Error('Panier ' + req.params.id + ' non trouvé'); next( err );
                err.status = 404;
                res.json({'message': err.message, 'status': err.status });
            } );
    })
    .post( cors.corsWithOptions, authenticate.verifyUser, ( req, res, next ) =>{
        res.statusCode = 403;
        res.json({'message': 'La methode POST n\'est pas supporté.', 'status': res.statusCode } )
    } )
    .put( cors.corsWithOptions, authenticate.verifyUser, authenticate.productOwner, ( req, res, next ) => {
        Panier.findById( req.params.id )
            .then( ( panier ) => {            
                if( panier.user.toString() === req.user._id.toString() ) {
                        Panier.findOneAndUpdate( {_id: req.params.id} , {
                            $set: req.body
                        }, { new: true })
                        .then( ( ville ) => {
                            res.json( ville );
                        }, ( err ) => next( err ) )
                        .catch( ( err ) => next( err ) );
                } else {
                    let err = new Error( 'Vous ne pouvez pas mettre à jour  ce panier, ça ne vous appartient pas ?' );
                    err.status = 403;
                    res.statusCode = 403;
                    res.json( {statusCode: res.statusCode, statusText: err.message } );
                }
        }, (err) => next( err ) )
        .catch( ( err ) => {
                err = new Error('Panier  non trouvé'); next( err );
                err.status = 404;
                res.json({'message': err.message, 'status': err.status });
        } );
    } )
    .delete( cors.corsWithOptions, authenticate.verifyUser, ( req, res, next ) => {
        Panier.findById( req.params.id )
                .then( ( panier ) => {
                    if( panier.user.toString() === req.user._id.toString() ) {
                        Panier.findByIdAndRemove(req.params.id)
                            .then( ( resp ) => {
                                res.json(resp);
                            }, ( err ) => {
                                err = new Error('Panier non trouvée'); next( err );
                                err.status = 404;
                                res.json({'message': err.message, 'status': err.status });
                            } )
                            .catch( ( err ) => next( err ) );
                    } else {
                        let err = new Error( 'Vous ne pouvez pas supprimer ce panier, ça ne vous appartient pas ?' );
                        err.status = 403;
                        res.statusCode = 403;
                        res.json( {statusCode: res.statusCode, statusText: err.message } );
                    } 
        }, err => { next( err ) } );
        
    } );

module.exports = panierRouter;