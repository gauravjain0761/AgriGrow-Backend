const multer = require( 'multer' );
const path = require( 'path' );
const moment = require( 'moment' );

// -------------------------------------------------------------------------------------

const profileImageStorage = multer.diskStorage( {
    destination: function ( req, file, cb )
    {
        cb( null, path.join( __dirname, '../uploads/profileImages/' ) );
    },
    filename: function ( req, file, cb )
    {
        cb( null, moment().unix() + "-" + file.originalname );
    },
} );

exports.uploadProfileImage = multer( {
    storage: profileImageStorage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
} ).single( "image" );


// exports.uploadImage = multer( {
//     storage: profileImageStorage,
//     // fileFilter: function ( req, file, cb )
//     // {
//     //     // if ( !file.originalname.match( /jpeg|jpg|png|gif|jfif/ ) )
//     //     // {
//     //     //     return cb( new Error( "Only image files (jpeg, jpg, png, gif) are allowed!" ) );
//     //     // }
//     //     cb( null, true );
//     // },
//     limits: {
//         fileSize: 10 * 1024 * 1024,
//     },
// } ).single( "image" );


// -------------------------------------------------------------------------------------

const certificateStorage = multer.diskStorage( {
    destination: function ( req, file, cb )
    {
        cb( null, path.join( __dirname, '../uploads/farmerCertificates/' ) );
    },
    filename: function ( req, file, cb )
    {
        // console.log( file );
        cb( null, moment().unix() + "-" + file.originalname );
    },
} );

exports.uploadCertificates = multer( {
    storage: certificateStorage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
} ).fields( [
    { name: 'Aadhaar_Card_Front', maxCount: 1 },
    { name: 'Aadhaar_Card_Back', maxCount: 1 },
    { name: 'PAN_Card', maxCount: 1 },
    // { name: 'India_Organic_Certificate', maxCount: 1 },
    // { name: 'Organic_Farmer_And_Growers', maxCount: 1 },
    // { name: 'National_Program_For_Sustainable_Aquaculture', maxCount: 1 },
    // { name: 'Spices_BoardOrganic_Certification', maxCount: 1 },
    // { name: 'Fair_Trade_India_Certification', maxCount: 1 },
    // { name: 'India_Good_Agricultural_Practices', maxCount: 1 },
    // { name: 'Participatory_Guarantee_System', maxCount: 1 },
    // { name: 'National_Programme_On_Organic_Production', maxCount: 1 },
    // { name: 'Bureau_Of_Indian_Standards', maxCount: 1 },
    // { name: 'Rainfed_Area_Authority', maxCount: 1 },
    // { name: 'Any_Other_Certificate', maxCount: 1 },
] );



// -------------------------------------------------------------------------------------

const productImagesStorage = multer.diskStorage( {
    destination: function ( req, file, cb )
    {
        cb( null, path.join( __dirname, '../uploads/productImages/' ) );
    },
    filename: function ( req, file, cb )
    {
        cb( null, moment().unix() + "-" + file.originalname );
    }
} );

exports.uploadProductImages = multer( {
    storage: productImagesStorage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB
} ).array( 'images', 3 );

// -------------------------------------------------------------------------------------


const addOnImageStorage = multer.diskStorage( {
    destination: function ( req, file, cb )
    {
        cb( null, path.join( __dirname, '../uploads/productImages/addOnImages/' ) );
    },
    filename: function ( req, file, cb )
    {
        cb( null, moment().unix() + "-" + file.originalname );
    },
} );

exports.uploadAddOnImage = multer( {
    storage: addOnImageStorage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
} ).single( "image" );


// -------------------------------------------------------------------------------------













// // Multer configuration
// exports.uploadImages = multer({
//     storage: imageStorage,
//     fileFilter: function(req, file, cb) {
//         // Add file filter logic if necessary
//         cb(null, true);
//     },
//     limits: {
//         fileSize: 10 * 1024 * 1024, // Adjust as needed
//     },
// }).array('images', 10); // 'images' is the field name for the array of images, 10 is the max number of files allowed




// const upload = multer({
//     storage: storage,
//     limits: { fileSize: 10 * 1024 * 1024 } // Limit file size to 10MB
// }).fields([
//     { name: 'imageFile', maxCount: 1 },
//     { name: 'IcardFile', maxCount: 1 },
//     { name: 'AadharCardImage', maxCount: 1 },
//     { name: 'PANImage', maxCount: 1 },
//     { name: 'passportImage', maxCount: 1 }
// ]);
















// // Check file type
// function checkFileType(file, cb) {
//     // Allowed filetypes
//     const filetypes = /jpeg|jpg|png/;
//     // Check extension
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//     // Check mime
//     const mimetype = filetypes.test(file.mimetype);

//     if (mimetype && extname) {
//         return cb(null, true);
//     } else {
//         cb('Error: Images only (jpeg, jpg, png)!');
//     }
// }

// // Middleware function for uploading images
// const uploadImage = (req, res, next) => {
//     upload(req, res, function(err) {
//         if (err instanceof multer.MulterError) {
//             // A Multer error occurred when uploading.
//             return res.status(500).json({
//                 status: false,
//                 message: 'Multer error: ' + err.message
//             });
//         } else if (err) {
//             // An unknown error occurred when uploading.
//             return res.status(500).json({
//                 status: false,
//                 message: 'Unknown error: ' + err.message
//             });
//         }
//         // Everything went fine.
//         next();
//     });
// };

// module.exports = uploadImage;
