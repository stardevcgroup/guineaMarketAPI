var express = require( 'express' );
var bodyParser = require( 'body-parser' );
const Utilisateur = require('./../models/utilisateur');

var utilisateurRouter = express.Router();
utilisateurRouter.use( bodyParser.json() );




/* GET /utilisateurs */
utilisateurRouter.route( '/' )
    .all( ( req, res, next ) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        next();
    } )
    .get( (req, res, next) => {
        Utilisateur.find( {} )
        .then( ( utilisateur ) =>{
            res.json( utilisateur )
            }, ( err ) => { next( err ) 
        },  (err) => next(err))
        .catch((err) => next(err));
    })
    .post( ( req, res, next ) =>{
        if( req.body.nom != undefined ) {
            Utilisateur.create( req.body )
            .then(( utilisateur ) => {
                console.log( 'Utilisatteur crée ', utilisateur );
                res.json( utilisateur );
            }, (err) => next( err ) )
            .catch( ( err ) => next( err ) );  
        } else {
            res.statusCode = 404;
            err = new Error('Aucun utilisateur trouvé');
            err.status = 404;
            res.json({'message': err.message, 'status': res.statusCode });    
        }
    } )
    .put( ( req, res, next ) => {
        res.statusCode = 403;
        res.end( 'La methode PUT n\'est pas supporté' )
    } )
    .delete( ( req, res, next ) => {
        Utilisateur.remove({})
        .then( ( resp ) => {
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));    
    });

/* GET /utilisateurs/:id */
utilisateurRouter.route( '/:id' )
    .all( ( req, res, next ) => {
        res.statusCode = 200;
        res.setHeader( 'Content-type',  'application/json' );
        next();
    } )
    .get( (req, res, next) => {
        Utilisateur.findById( req.params.id )
            .then( ( utilisateur ) => {
                res.json( utilisateur );
            }, (err) => {
                res.statusCode = 404;
                err = new Error('L\'utilisateur ' + req.params.id + ' non trouvé');
                err.status = 404;
                res.json({'message': err.message, 'status': err.status });
            } )
            .catch( ( err ) => next( err ) );
    })
    .post( ( req, res, next ) =>{
        res.statusCode = 403;
        res.json({'message': 'La methode POST n\'est pas supporté.', 'status': res.statusCode} )
    } )
    .put( ( req, res, next ) => {
        Utilisateur.findByIdAndUpdate( req.params.id, {
            $set: req.body
        }, { new: true })
        .then( ( utilisateur ) => {
            res.json( utilisateur );
        }, ( err ) => {
            res.statusCode=404;
            err = new Error('L\'utilisateur ' + req.params.id + ' non trouvé');
            err.status = 404;
            res.json({'message': err.message, 'status': res.statusCode });
        } )
        .catch( ( err ) => {} );
    } )
    .delete( ( req, res, next ) => {
        Utilisateur.findByIdAndRemove(req.params.id)
            .then( ( resp ) => {
                res.json(resp);
            }, ( err ) => {
                res.statusCode = 404;
                err = new Error('L\'utilisateur ' + req.params.id + ' non trouvé');
                err.status = 404;
                res.json({'message': err.message, 'status': err.status });
            } )
            .catch( ( err ) => next( err ) );
    } );

module.exports = utilisateurRouter;
