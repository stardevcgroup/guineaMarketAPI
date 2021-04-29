var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require( 'express-session' );
var FilleStore = require( 'session-file-store' )(session);
const dboperations = require('./crud/operations');
const mongoose = require('mongoose');
var passport = require( 'passport' );
var authenticate = require( './authenticate' );
var config = require( './config' );


var url = config.mongoUrl;
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var utilisateurRouter = require( './routes/utilisateurRouter' );
const categorieRouter = require('./routes/categorieRouter');
const reseauRouter = require('./routes/reseauRouter');
const villeRouter = require('./routes/villeRouter');
const produitRouter = require('./routes/produitRouter');
const uploadRouter = require( './routes/uploadRouter' );

const connect = mongoose.connect(url);

var app = express();

/*app.all( '*', ( req, res, next ) => {
  if( req.secure ) {
    return next();
  } else {
    res.redirect( 'https://' + req.hostname + ':' + app.get( 'secPort' ) + req.url );
  }
} );*/

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
///app.use(cookieParser('12345-67890-09876-54321'));
app.use(express.static(path.join(__dirname, 'public')));
//Utilisation de la session
/*app.use( session( {
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  saveUninitialized: false,
  resave: false,
  store: new FilleStore()
} ) );*/

app.use( passport.initialize( ) );
//app.use( passport.session( ) )


/*
* Ici je vais gérer l'authentification basic
* avc mon API
*/
app.use('/', indexRouter);
app.use('/auth', usersRouter);

/*const auth = ( req, res, next ) => {
  console.log(req.session);;
  
  if( !req.user ) {
    var err = new Error('Vous êtes pas connectés !');
    err.status = 403;
    res.statusCode = 403;
     return next( err );
  } else {
      next();
  }
}*/

//app.use( auth );
app.use( '/utilisateurs', utilisateurRouter );
app.use( '/categories', categorieRouter );
app.use( '/reseaux', reseauRouter );
app.use( '/villes', villeRouter );
app.use( '/produits', produitRouter );
app.use( '/uploadImage', uploadRouter );

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;