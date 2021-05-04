var jwt_decode = require( 'jwt-decode' );
const extraireUsenamewithArrobase = (username, parents) => {
    var username = jwt_decode(username);
    username = JSON.stringify( username.username );
    username = username.replace(' ', '');
    username = username.replace('"', '');
    username = username.replace('"', '');
    username = username.toLowerCase();
    username = ( username.indexOf('@') > 0 ) ? username.substr(1, (username.indexOf('@') -1 ) ): username;
    let dir = 'public/images/' + parents +'/' + username;
    return dir;
}

module.exports = extraireUsenamewithArrobase;