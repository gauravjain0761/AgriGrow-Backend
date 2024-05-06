const multer = require('multer');
const path = require('path');
const moment = require('moment');

// -------------------------------------------------------------------------------------

const profileImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/profileImages/'));
    },
    filename: function (req, file, cb) {
        cb(null, moment().unix() + "-" + file.originalname);
    },
});

exports.uploadProfileImage = multer({
    storage: profileImageStorage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
}).single("image");


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

const certificateStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/farmerCertificates/'));
    },
    filename: function (req, file, cb) {
        // console.log( file );
        cb(null, moment().unix() + "-" + file.originalname);
    },
});

exports.uploadCertificates = multer({
    storage: certificateStorage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
}).fields([
    { name: 'Aadhaar_Card_Front', maxCount: 1 },
    { name: 'Aadhaar_Card_Back', maxCount: 1 },
    { name: 'PAN_Card', maxCount: 1 },
    { name: 'India_Organic_Certificate', maxCount: 1 },
    { name: 'Organic_Farmer_And_Growers', maxCount: 1 },
    { name: 'National_Program_For_Sustainable_Aquaculture', maxCount: 1 },
    { name: 'Spices_BoardOrganic_Certification', maxCount: 1 },
    { name: 'Fair_Trade_India_Certification', maxCount: 1 },
    { name: 'India_Good_Agricultural_Practices', maxCount: 1 },
    { name: 'Participatory_Guarantee_System', maxCount: 1 },
    { name: 'National_Programme_On_Organic_Production', maxCount: 1 },
    { name: 'Bureau_Of_Indian_Standards', maxCount: 1 },
    { name: 'Rainfed_Area_Authority', maxCount: 1 },
    { name: 'Any_Other_Certificate', maxCount: 1 },
]);

// } ).fields( [
//     { name: 'qualificationCertificate', maxCount: 1 },
//     { name: 'residentialCertificate', maxCount: 1 },
// ] );



// -------------------------------------------------------------------------------------

const productImagesStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/productImages/'));
    },
    filename: function (req, file, cb) {
        cb(null, moment().unix() + "-" + file.originalname);
    }
});

exports.uploadProductImages = multer({
    storage: productImagesStorage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB
}).array('images', 3);

// -------------------------------------------------------------------------------------


const addOnImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/productImages/addOnImages/'));
    },
    filename: function (req, file, cb) {
        cb(null, moment().unix() + "-" + file.originalname);
    },
});

exports.uploadAddOnImage = multer({
    storage: addOnImageStorage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
}).single("image");


// -------------------------------------------------------------------------------------


const collectionCenterImagesStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/collectionCenterImages/'));
    },
    filename: function (req, file, cb) {
        // console.log( file );
        cb(null, moment().unix() + "-" + file.originalname);
    },
});

exports.uploadCollectionCenterImages = multer({
    storage: collectionCenterImagesStorage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
}).fields([
    { name: 'aadhaarCardFront', maxCount: 1 },
    { name: 'aadhaarCardBack', maxCount: 1 },
    { name: 'licenseImage', maxCount: 1 },
]);


// --------------------------------------------------------------------------------