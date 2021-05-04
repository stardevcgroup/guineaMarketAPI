var express = require( 'express' );
var bodyParser = require( 'body-parser' );
const Stardevcgroup = require('./../models/stardevcgroup');
var authenticate = require( './../authenticate' );
var mongoose = require('mongoose');
var upload = require( './../customMulter' );
const cors  = require('./cors');


var upload = upload;
var stardevcgroupRouter = express.Router();
stardevcgroupRouter.use( bodyParser.json() );




/* GET /stardevs */
stardevcgroupRouter.route( '/' )
    .options( cors.corsWithOptions, ( req, res ) => { res.sendStatus( 200 ); } )
    .all( cors.cors, ( req, res, next ) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        next();
    } )
    .get( cors.cors,  (req, res, next) => {
        Stardevcgroup.find( {} )
        .then( ( stardevcgroup ) =>{
            res.json( stardevcgroup )
            }, ( err ) => { next( err ) 
        },  (err) => next(err))
        .catch((err) => next(err));
    })
    .post( cors.corsWithOptions, authenticate.verifyAdmin, ( req, res, next ) =>{ 
        if( req.body.designation != undefined ) {
            Stardevcgroup.create( req.body )
                .then(( stardevcgroup ) => {
                    res.json( stardevcgroup );
                }, (err) => next( err ) )
                .catch( ( err ) => next( err ) );
        } else {
            err = new Error('stardevcgroup  non trouvé');
            err.status = 404;
            res.json({'message': err.message, 'status': err.status });
        } 
    } )
    .put( cors.corsWithOptions,  authenticate.verifyUser, authenticate.verifyAdmin, ( req, res, next ) => {
        res.statusCode = 403;
        res.json({'message': 'La methode PUT n\'est pas supporté', 'status': res.statusCode } )
    } )
    .delete( cors.corsWithOptions,  authenticate.verifyAdmin, ( req, res, next ) => {
        Produit.remove({})
        .then( ( resp ) => {
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));    
    });

/* GET /stardevcgroup/:id */
stardevcgroupRouter.route( '/:id' )
    .options( cors.corsWithOptions, ( req, res ) => { res.sendStatus( 200 ); } )
    .all( cors.cors,  ( req, res, next ) => {
        res.statusCode = 200;
        res.setHeader( 'Content-type',  'application/json' );
        next();
    } )
    .get( cors.cors, (req, res, next) => {
        Stardevcgroup.findById( req.params.id )
            .then( ( stardevcgroup ) => {
                res.json( stardevcgroup );
            }, (err) => next( err ) )
            .catch( ( err ) => {
                err = new Error('stardevcgroup ' + req.params.id + ' non trouvé'); next( err );
                err.status = 404;
                res.json({'message': err.message, 'status': err.status });
            } );
    })
    .post( cors.corsWithOptions, authenticate.verifyUser, ( req, res, next ) =>{
        res.statusCode = 403;
        res.json({'message': 'La methode POST n\'est pas supporté.', 'status': res.statusCode } )
    } )
    .put( cors.corsWithOptions, authenticate.verifyUser, ( req, res, next ) => {
        Stardevcgroup.findByIdAndUpdate( req.params.id, {
            $set: req.body
        }, { new: true })
        .then( ( stardevcgroup ) => {
            res.json( stardevcgroup );
        }, ( err ) => next( err ) )
        .catch( ( err ) => next( err ) );
    } )
    .delete( cors.corsWithOptions, authenticate.verifyAdmin, ( req, res, next ) => {
        Produit.findByIdAndRemove(req.params.id)
            .then( ( resp ) => {
                res.json(resp);
            }, ( err ) => {
                err = new Error('stardevcgroup ' + req.params.id + ' non trouvé'); next( err );
                err.status = 404;
                res.json({'message': err.message, 'status': err.status });
            } )
            .catch( ( err ) => next( err ) );
    } );

module.exports = stardevcgroupRouter;
