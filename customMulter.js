var mutlter = require( 'multer' );
var fs = require( 'fs' );
var jwt_decode = require( 'jwt-decode' );

var storage = mutlter.diskStorage( {
  
  destination: ( req, file, cb ) => {
      var username = jwt_decode(req.headers.authorization);
      username = JSON.stringify( username.username );
      username = ( username.indexOf('@') > 0 ) ? username.substr(1, (username.indexOf('@') -1 ) ): username;
      console.log( "++++" +username )
      let dir = 'public/images/' + username;
      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
      }
      cb( null, dir );
  },
  filename: ( req, file, cb ) => {
      cb( null, file.originalname );
  }
} );

const imageFilter = ( req, file, cb ) => {
  if( !file.originalname.match( /\.(jpg|jpeg|png|gif)$/) ) {
      return cb( 'Vous ne pouvez télécharger que des fichiers: jpg, jpeg, png et gif', null );
  } 
  cb( null, true)
};

var upload = mutlter({ storage: storage, fileFilter: imageFilter });
module.exports = upload;