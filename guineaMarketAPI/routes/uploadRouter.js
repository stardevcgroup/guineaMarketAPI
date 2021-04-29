const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const authenticate = require( './../authenticate' );
var costomMulterUpload = require( './../customMulter' );

var uploadRouter = express.Router();
uploadRouter.use( bodyParser.json() );


const upload = costomMulterUpload;

uploadRouter.use( bodyParser.json( ) )
uploadRouter.route( '/' )
            .all( ( req, res, next ) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                next();
            } )
            .get( authenticate.verifyUser, ( req, res, next ) => {
                res.statusCode = 403;
                res.json({'message': 'La methode GET n\'est pas supporté sur /imageUpload', 'status': res.statusCode } )
            } )
            .post( authenticate.verifyUser, upload.single( 'imageFile'), ( req, res, next ) => {
               res.statusCode = 200;
               res.setHeader( 'Content-Type', 'application/json' );
               res.json(req.file)
            } )
            .put( authenticate.verifyUser, ( req, res, next ) => {
                res.statusCode = 403;
                res.json({'message': 'La methode PUT n\'est pas supporté sur /imageUpload', 'status': res.statusCode } )
            } )
            .delete( authenticate.verifyUser, ( req, res, next ) => {
                res.statusCode = 403;
                res.json({'message': 'La methode GET n\'est pas supporté sur /imageUpload', 'status': res.statusCode } )
            } )
            


module.exports = uploadRouter;