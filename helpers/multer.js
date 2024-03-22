const multer = require( 'multer' );
const path = require( 'path' );
const moment = require( 'moment' );


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
        fileSize: 10 * 1024 * 1024,
    },
} ).single( "image" );







exports.uploadImage = multer( {
    storage: profileImageStorage,
    // fileFilter: function ( req, file, cb )
    // {
    //     // if ( !file.originalname.match( /jpeg|jpg|png|gif|jfif/ ) )
    //     // {
    //     //     return cb( new Error( "Only image files (jpeg, jpg, png, gif) are allowed!" ) );
    //     // }
    //     cb( null, true );
    // },
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
} ).single( "image" );





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
        fileSize: 100 * 1024 * 1024,
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












// {
//     "name": "Aman Sharma Farmer",
//     "email":"a@gmail.com",
//     "password":"Aman@1234",
//     "mobile":"80554405444",
//     // "Aadhaar_Card_Number":"",
//     // "PAN_Card_Number":"",
//     "state":"Maharashtra",
//     "city":"Nagpur",
//     "postalCode":"440035",
//     "streetAddress":"26, Ram Nagar, CA Road, Nagpur",
//     "farmLocation":"Near Bhawani Mata Temple, Nagpur",
//     "deviceToken": "nnjnsknk"
// }