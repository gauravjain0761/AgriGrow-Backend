const multer = require( 'multer' );
const path = require( 'path' );
const moment = require( 'moment' );


const imageStorage = multer.diskStorage( {
    destination: function ( req, file, cb )
    {
        cb( null, path.join( __dirname, '../uploads/' ) );
    },
    filename: function ( req, file, cb )
    {
        cb( null, moment().unix() + "-" + file.originalname );
    },
} );

exports.uploadImage = multer( {
    storage: imageStorage,
    fileFilter: function ( req, file, cb )
    {
        // if ( !file.originalname.match( /jpeg|jpg|png|gif|jfif/ ) )
        // {
        //     return cb( new Error( "Only image files (jpeg, jpg, png, gif) are allowed!" ) );
        // }
        cb( null, true );
    },
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
} ).single( "image" );
