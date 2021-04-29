var express = require( 'express' );
var bodyParser = require( 'body-parser' );
const Reseau = require('../models/reseau');

var reseauRouter = express.Router();
reseauRouter.use( bodyParser.json() );




/* GET /reseaux */
reseauRouter.route( '/' )
    .all( ( req, res, next ) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        next();
    } )
    .get( (req, res, next) => {
        Reseau.find( {} )
        .then( ( reseau ) =>{
            res.json( reseau )
            }, ( err ) => { next( err ) 
        },  (err) => next(err))
        .catch((err) => next(err));
    })
    .post( ( req, res, next ) =>{
        if( req.body.url != undefined ) {
            Reseau.create( req.body )
            .then(( reseau ) => {
                console.log( 'reseau crée ', reseau );
                res.json( reseau );
            }, (err) => next( err ) )
            .catch( ( err ) => next( err ) );  
        } else {
            res.statusCode = 404;
            err = new Error('Aucun lien trouvé');
            err.status = 404;
            res.json({'message': err.message, 'status': res.statusCode });
        }
    } )
    .put( ( req, res, next ) => {
        res.statusCode = 403;
        res.json({'message': 'La methode PUT n\'est pas supporté', 'status': res.statusCode } )
    } )
    .delete( ( req, res, next ) => {
        Reseau.remove({})
        .then( ( resp ) => {
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));    
    });

/* GET /reseaux/:id */
reseauRouter.route( '/:id' )
    .all( ( req, res, next ) => {
        res.statusCode = 200;
        res.setHeader( 'Content-type',  'application/json' );
        next();
    } )
    .get( (req, res, next) => {
        Reseau.findById( req.params.id )
            .then( ( reseau ) => {
                res.json( reseau );
            }, (err) => {
                res.statusCode = 404;
                err = new Error('Le lien ' + req.params.id + ' non trouvé');
                err.status = 404;
                res.json({'message': err.message, 'status': err.status });
            } )
            .catch( ( err ) => next( err ) );
    })
    .post( ( req, res, next ) =>{
        res.statusCode = 403;
        res.json({'message': 'La methode POST n\'est pas supporté.', 'status': res.statusCode } )
    } )
    .put( ( req, res, next ) => {
        Reseau.findByIdAndUpdate( req.params.id, {
            $set: req.body
        }, { new: true })
        .then( ( reseau ) => {
            res.json( reseau );
        }, ( err ) => {
            res.statusCode = 404;
            err = new Error('Le lien ' + req.params.id + ' non trouvé');
            err.status = 404;
            res.json({'message': err.message, 'status': res.statusCode });
        } )
        .catch( ( err ) => next( err ) );
    } )
    .delete( ( req, res, next ) => {
        Reseau.findByIdAndRemove(req.params.id)
            .then( ( resp ) => {
                res.json(resp);
            }, ( err ) => {
                res.statusCode = 404;
                err = new Error('Le lien ' + req.params.id + ' non trouvé');
                err.status = 404;
                res.json({'message': err.message, 'status': err.status });
            } )
            .catch( ( err ) => next( err ) );
    } );

module.exports = reseauRouter;
