const assert = require( 'assert' );

exports.insertDocument = ( db, document, collection, callback ) => {
    const coll = db.collection( collection );
    return coll.insert( document )
};

exports.findDocuments = ( db, collections, callback ) => {
    const coll = db.collection( collections );
    return coll.find( {} ).toArray( )
};

exports.updateDocument = ( db, document, update, collection, callback ) => {
    const coll = db.collection( collection );
    coll.updateOne( document, { $set:  update }, null );
    
};

exports.removeDocument = ( db, document, collection, callback ) => {
    const coll = db.collection( collection );
    return coll.deleteOne( document );
};