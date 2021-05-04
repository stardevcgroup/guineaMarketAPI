var express = require( 'express' );
var bodyParser = require( 'body-parser' );
const Categorie = require('./../models/categorie');
const cors = require( './cors' );
const Produit = require('../models/produit');

var categorieRouter = express.Router();
categorieRouter.use( bodyParser.json() );




/* GET /categories */
categorieRouter.route( '/' )
    .all( ( req, res, next ) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        next();
    } )
    .get( cors.corsWithOptions, async (req, res, next) => {
        if ( req.url.indexOf('libele') > 0 ) {  
            await Categorie.find( { libele:  { $regex: '.*' + req.query['libele'] + '.*', $options: 'i' } } )
               .populate(['user'])
               .then( categories => {
                    Categorie.find({})
                            .then(c => {
                                if(categories.length != c.length) {
                                    categories.forEach( c => {
                                        Produit.find( )
                                               .then( p => {
                                                    p.forEach( pp => {
                                                        if ( pp.categorie.toString() === c._id.toString() ) {
                                                            res.json(pp);
                                                        }
                                                    } )
                                               } )                                             
                                    } )
                                } else {
                                    res.statusCode = 404;
                                    res.json({statusCode: res.statusCode, statusText: 'Categorie non trouvée'})
                                }
                            })
               }, err => next(err) );
        } else {
            Categorie.find( {} )
            .then( ( categories ) =>{
                res.json( categories )
                }, ( err ) => { next( err ) 
            },  (err) => next(err))
            .catch((err) => next(err));
        }
    })
    .post( ( req, res, next ) =>{
        if( req.body.libele != undefined ) {
            Categorie.create( req.body )
                .then(( categorie ) => {
                    res.json( categorie );
                }, (err) => {
                    err = new Error('Catégroie  non trouvé'); 
                    err.status = 404;
                    res.json({'message': err.message, 'status': err.status });
                } )
                .catch( ( err ) => next( err ) );
        } else {
            err = new Error('Catégroie  non trouvé'); 
            err.status = 404;
            res.json({'message': err.message, 'status': err.status });
        }
    } )
    .put( ( req, res, next ) => {
        res.statusCode = 403;
        res.json({'message': 'La methode PUT n\'est pas supporté', 'status': res.statusCode} )
    } )
    .delete( ( req, res, next ) => {
        Categorie.remove({})
        .then( ( resp ) => {
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));  
    });

/* GET /categories/:id */
categorieRouter.route( '/:id' )
    .all( ( req, res, next ) => {
        res.statusCode = 200;
        res.setHeader( 'Content-type',  'application/json' );
        next();
    } )
    .get( (req, res, next) => {
        Categorie.findById( req.params.id )
            .then( ( categorie ) => {

                res.json( categorie );
            }, (err) =>{ 
                err = new Error('Catégroie ' + req.params.id + ' non trouvé'); next( err );
                err.status = 404;
                res.json({'message': err.message, 'status': err.status } )
            } )
            .catch( ( err ) => next( err ) );
    })
    .post( ( req, res, next ) =>{
        res.statusCode = 403;
        res.json({'message': 'La methode POST n\'est pas supporté.', 'status': res.statusCode})
    } )
    .put( ( req, res, next ) => {
        Categorie.findByIdAndUpdate( req.params.id, {
            $set: req.body
        }, { new: true })
        .then( ( categorie ) => {
                res.json( categorie );
        }, ( err ) => {
            err = new Error('Catégroie ' + req.params.id + ' non trouvé'); next( err );
                err.status = 404;
                res.json({'message': err.message, 'status': err.status })
        } )
        .catch( ( err ) => next( err ) );
    } )
    .delete( ( req, res, next ) => {
        Categorie.findByIdAndRemove(req.params.id)
            .then( ( resp ) => {
                if ( resp != null ) {
                    res.json(resp);
                } else {
                    err = new Error('Catégroie ' + req.params.id + ' non trouvé');
                    err.status = 404;
                    return next(err); 
                }
            }, ( err ) => {
                err = new Error('Catégroie ' + req.params.id + ' non trouvé'); next( err );
                err.status = 404;
                res.json({'message': err.message, 'status': err.status });
            } )
            .catch( ( err ) => next( err ) );
    } );

module.exports = categorieRouter;
