var express = require( 'express' );
var bodyParser = require( 'body-parser' );
const Commande = require('./../models/commande');
var authenticate = require( './../authenticate' );
const cors  = require('./cors');


var commandeRouter = express.Router();
commandeRouter.use( bodyParser.json() );



/* GET /commandes */
commandeRouter.route( '/' )
    .options( cors.corsWithOptions, ( req, res ) => { res.sendStatus( 200 ); } )
    .all( cors.corsWithOptions, ( req, res, next ) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        next();
    } )
    .get( cors.corsWithOptions, authenticate.verifyUser,  (req, res, next) => {
        Commande.find( {} )
        .populate(['produit'])
        .then( ( commandes ) =>{
                if (commandes != null ) {
                    myCommandes = [];
                    commandes.forEach( commande => {
                        if ( req.user._id.toString() === commande.user.toString() ) {
                            if( commande.produit == null ) {
                                commande.deleteOne( {_id: panier.id })
                                      .then( p => {  } )
                            }
                            myCommandes.push( commande );
                        }
                    } );

                    res.json( myCommandes )
                } else {
                    res.json(commandes)
                }
            }, ( err ) => { next( err ) 
        },  (err) => next(err))
        .catch((err) => next(err));
    })
    .post( cors.corsWithOptions, authenticate.verifyUser, ( req, res, next ) =>{
        
        if ( req.user._id !== null )
            req.body.user = req.user._id;
        
        
        if( req.body !== null ) {
           Commande.findOne( { user: req.user._id, produit: req.body.produit} )
                 .then( commandeUp => {
                     if ( commandeUp != null  ) {
                        Commande.findOneAndUpdate( 
                            { user: req.user._id, produit: req.body.produit}, 
                            {$set: {quantite: req.body.quantite}}, {new: true} )
                        .then(( commande ) => {
                            res.json( commande );
                        }, (err) => next( err ) )
                        .catch( ( err ) => next( err ) );
                     } else {
                        Commande.create( req.body )
                        .then(( commande ) => {
                            res.json( commande );
                        }, (err) => next( err ) )
                        .catch( ( err ) => next( err ) );
                     }
                 } )
        } else {
            err = new Error('Commande  non trouvée');
            err.status = 404;
            res.json({'message': err.message, 'status': err.status });
        } 
    } )
    .put( cors.corsWithOptions,  authenticate.verifyUser, authenticate.verifyAdmin, ( req, res, next ) => {
        res.statusCode = 403;
        res.json({'message': 'La methode PUT n\'est pas supporté', 'status': res.statusCode } ); 
    } )
    .delete( cors.corsWithOptions,  authenticate.verifyUser, authenticate.verifyAdmin, ( req, res, next ) => {
        Commande.remove({})
        .then( ( resp ) => {
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));    
    });

/* GET /commandes/:id */
commandeRouter.route( '/:id' )
    .options( cors.corsWithOptions, ( req, res ) => { res.sendStatus( 200 ); } )
    .all( cors.cors,  ( req, res, next ) => {
        res.statusCode = 200;
        res.setHeader( 'Content-type',  'application/json' );
        next();
    } )
    .get( cors.cors, (req, res, next) => {
        Commande.findById( req.params.id )
            .populate(['produit'])
            .then( ( commande ) => {
                res.json( commande );
            }, (err) => next( err ) )
            .catch( ( err ) => {
                err = new Error('Commande ' + req.params.id + ' non trouvée'); next( err );
                err.status = 404;
                res.json({'message': err.message, 'status': err.status });
            } );
    })
    .post( cors.corsWithOptions, authenticate.verifyUser, ( req, res, next ) =>{
        res.statusCode = 403;
        res.json({'message': 'La methode POST n\'est pas supporté.', 'status': res.statusCode } )
    } )
    .put( cors.corsWithOptions, authenticate.verifyUser, authenticate.productOwner, ( req, res, next ) => {
        Commande.findById( req.params.id )
                .then( ( commande ) => {            
                    if( commande.user.toString() === req.user._id.toString() ) {
                            Commande.findOneAndUpdate( {_id: req.params.id} , {
                                $set: req.body
                            }, { new: true })
                            .then( ( commande ) => {
                                res.json( commande );
                            }, ( err ) => next( err ) )
                            .catch( ( err ) => next( err ) );
                    } else {
                        let err = new Error( 'Vous ne pouvez pas mettre à jour  cette commande, ça ne vous appartient pas ?' );
                        err.status = 403;
                        res.statusCode = 403;
                        res.json( {statusCode: res.statusCode, statusText: err.message } );
                    }
        }, (err) => next( err ) )
        .catch( ( err ) => {
                err = new Error('Commande  non trouvé'); next( err );
                err.status = 404;
                res.json({'message': err.message, 'status': err.status });
        } );
    } )
    .delete( cors.corsWithOptions, authenticate.verifyUser, ( req, res, next ) => {
        Commande.findById( req.params.id )
                .then( ( commande ) => {
                    if( commande.user.toString() === req.user._id.toString() ) {
                        Commande.findByIdAndRemove(req.params.id)
                            .then( ( resp ) => {
                                res.json(resp);
                            }, ( err ) => {
                                err = new Error('Commande non trouvée'); next( err );
                                err.status = 404;
                                res.json({'message': err.message, 'status': err.status });
                            } )
                            .catch( ( err ) => next( err ) );
                    } else {
                        let err = new Error( 'Vous ne pouvez pas supprimer cette commande, ça ne vous appartient pas ?' );
                        err.status = 403;
                        res.statusCode = 403;
                        res.json( {statusCode: res.statusCode, statusText: err.message } );
                    } 
        }, err => { next( err ) } );
        
    } );

module.exports = commandeRouter;