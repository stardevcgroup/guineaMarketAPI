var express = require( 'express' );
var bodyParser = require( 'body-parser' );
const Ville = require('./../models/ville');

var villeRouter = express.Router();
villeRouter.use( bodyParser.json() );




/* GET /villes */
villeRouter.route( '/' )
    .all( ( req, res, next ) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        next();
    } )
    .get( (req, res, next) => {
        Ville.find( {} )
        .then( ( ville ) =>{
            res.json( ville )
            }, ( err ) => { next( err ) 
        },  (err) => next(err))
        .catch((err) => next(err));
    })
    .post( ( req, res, next ) => {
        if ( req.body.nom != undefined ) {
            Ville.create( req.body )
                .then(( ville ) => {
                    res.json( ville );
                }, (err) => next( err ) )
                .catch( ( err ) => next( err ) );  
        } else {
            res.statusCode = 404;
            err = new Error('Aucune ville trouvée');
            err.status = 404;
            res.json({'message': err.message, 'status': res.statusCode });
        }
    } )
    .put( ( req, res, next ) => {
        res.statusCode = 403;
        res.end( 'La methode PUT n\'est pas supporté' )
    } )
    .delete( ( req, res, next ) => {
        Ville.remove({})
        .then( ( resp ) => {
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));    
    });

/* GET /villes/:id */
villeRouter.route( '/:id' )
    .all( ( req, res, next ) => {
        res.statusCode = 200;
        res.setHeader( 'Content-type',  'application/json' );
        next();
    } )
    .get( (req, res, next) => {
        Ville.findById( req.params.id )
            .then( ( ville ) => {
                res.json( ville );
            }, (err) => {
                res.statusCode = 404;
                err = new Error('La ville ' + req.params.id + ' non trouvé');
                err.status = 404;
                res.json({'message': err.message, 'status': err.status });
            } )
            .catch( ( err ) => next( err ) );
    })
    .post( ( req, res, next ) =>{
        res.statusCode = 403;
        res.json({'message': 'La methode POST n\'est pas supportée.', 'status': res.statusCode })
    } )
    .put( ( req, res, next ) => {
        Ville.findByIdAndUpdate( req.params.id, {
            $set: req.body
        }, { new: true })
        .then( ( ville ) => {
            res.json( ville );
        }, ( err ) => {
            res.statusCode = 404;
            err = new Error('La ville ' + req.params.id + ' non trouvée');
            err.status = 404;
            res.json({'message': err.message, 'status': err.status });
        } )
        .catch( ( err ) => next( err ) );
    } )
    .delete( ( req, res, next ) => {
        Ville.findByIdAndRemove(req.params.id)
            .then( ( resp ) => {
                res.json(resp);
            }, ( err ) => {
                res.statusCode = 404;
                err = new Error('La ville ' + req.params.id + ' non trouvée');
                err.status = 404;
                res.json({'message': err.message, 'status': err.status });
            } )
            .catch( ( err ) => next( err ) );
    } );

module.exports = villeRouter;
