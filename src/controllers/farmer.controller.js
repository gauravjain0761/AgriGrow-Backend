const farmerModel = require( '../models/farmer.model' );
const crypto = require( 'crypto-js' );
const jwt = require( 'jsonwebtoken' );
// const { generateRandomNumber } = require( "../../helpers/randomNumber.helper" );
// const { sendOtp } = require( "../../helpers/sendEmail.helper" );


const { uploadProfileImage, uploadCertificates } = require( '../../helpers/multer' );
const fs = require( 'fs' );
const path = require( 'path' );
const moment = require( 'moment' );



// const storage = multer.diskStorage( {
//     destination: function ( req, file, cb )
//     {
//         cb( null, path.join( __dirname, '../../uploads/feedFiles/' ) );
//     },
//     filename: function ( req, file, cb )
//     {
//         cb( null, moment().unix() + "-" + file.originalname );
//     },
// } );

// const upload = multer( {
//     storage: storage,
//     fileFilter: function ( req, file, cb )
//     {
//         // if ( !file.originalname.match( /jpeg|jpg|png|gif|mp4|avi|mkv/ ) )
//         // {
//         //     return cb( new Error( "Only image & video files (jpeg, jpg, png, gif, mp4, avi, mkv) are allowed!" ) );
//         // }
//         cb( null, true );
//     },
//     limits: {
//         fileSize: 100 * 1024 * 1024,
//     },
//     // } ).single( "imagePath" );
// } ).fields( [
//     { name: 'imagePath', maxCount: 1 },
//     { name: 'videoPath', maxCount: 1 },
//     { name: 'thumbnailPath', maxCount: 1 },
// ] );





// signup
const farmerSignUp = async ( req, res ) =>
{
    try
    {
        uploadCertificates( req, res, async ( err ) =>
        {
            try
            {
                console.log( 2222, req.files );
                if ( err )
                {
                    console.log( 'Error during file upload:', err );
                    // deleteUploadedFiles( req.files );
                    return res.status( 500 ).send( {
                        status: false,
                        message: 'Error during file upload: ' + err.message,
                    } );
                };

                const { name, email, password, mobile, Aadhaar_Card_Number, PAN_Card_Number,
                    state, city, postalCode, streetAddress, farmLocation, village, deviceToken } = req.body;

                const farmer = new farmerModel( {
                    name: name,
                    email: email.toLowerCase(),
                    password: crypto.AES.encrypt( password, process.env.secretKey ).toString(),
                    mobile: mobile,
                    Aadhaar_Card_Number: Aadhaar_Card_Number,
                    PAN_Card_Number: PAN_Card_Number,
                    state: state,
                    city: city,
                    postalCode: postalCode,
                    streetAddress: streetAddress,
                    farmLocation: farmLocation,
                    deviceToken: deviceToken,
                    village: village,
                } );

                const certificates = {};
                if ( req.files )
                {
                    certificates.Aadhaar_Card_Front = req.files[ 'Aadhaar_Card_Front' ] ? `/uploads/farmerCertificates/${ moment().unix() }-${ req.files[ 'Aadhaar_Card_Front' ][ 0 ].originalname }` : null;
                    certificates.Aadhaar_Card_Back = req.files[ 'Aadhaar_Card_Back' ] ? `/uploads/farmerCertificates/${ moment().unix() }-${ req.files[ 'Aadhaar_Card_Back' ][ 0 ].originalname }` : null;
                    certificates.PAN_Card = req.files[ 'PAN_Card' ] ? `/uploads/farmerCertificates/${ moment().unix() }-${ req.files[ 'PAN_Card' ][ 0 ].originalname }` : null;
                    // certificates.PAN_Card = req.files[ 'PAN_Card' ] ? req.files[ 'PAN_Card' ][ 0 ].path : null;
                };

                farmer.certificates = certificates;

                await farmer.save();
                return res.status( 201 ).send( {
                    status: true,
                    message: 'successfully created',
                    data: farmer
                } );
            } catch ( error )
            {
                // deleteUploadedFiles( req.files );
                console.log( error );
                if ( error.code === 11000 && error.keyPattern && ( error.keyPattern.email || error.keyPattern.mobile ) )
                {
                    const violatedKeys = Object.keys( error.keyPattern );
                    console.log( violatedKeys );
                    return res.status( 400 ).json( {
                        status: false,
                        message: `${ violatedKeys } is already registered. Please use a different ${ violatedKeys }.`,
                    } );
                }
                return res.status( 500 ).send( {
                    status: false,
                    message: error.message,
                } );
            }
        } );
    } catch ( error )
    {
        console.log( 2222, error );
        return res.status( 500 ).json( {
            status: false,
            message: error.message
        } )
    }
};

// login
const farmerLogin = async ( req, res ) =>
{
    try
    {
        const { email, mobile, password, deviceToken } = req.body;

        const farmer = await farmerModel.findOne( {
            $or: [
                { email: email },
                { mobile: mobile }
            ]
        } );

        if ( !farmer )
        {
            return res.status( 404 ).send( {
                status: false,
                message: "not found!",
            } );
        }

        const decryptedPass = crypto.AES.decrypt(
            farmer.password,
            process.env.secretKey
        ).toString( crypto.enc.Utf8 );

        if ( password !== decryptedPass )
        {
            return res.status( 400 ).send( {
                status: false,
                message: "incorrect email or password!",
            } );
        }

        const token = jwt.sign(
            { id: farmer._id, email: farmer.email },
            "qwerty1234",
            { expiresIn: '24h' }
        );

        farmer.deviceToken = deviceToken;
        await farmer.save();

        return res.status( 200 ).send( {
            status: true,
            message: "login successfully",
            token: token,
            farmerData: farmer
        } );
    } catch ( error )
    {
        console.log( error );
        return res.status( 500 ).send( {
            status: false,
            message: error.message,
        } );
    }
};

// get profile
const getProfile = async ( req, res ) =>
{
    try
    {
        return res.status( 200 ).json( {
            status: true,
            message: "profile fetched successfully",
            data: req.user
        } )
    } catch ( error )
    {
        return res.status( 500 ).json( {
            status: false,
            message: error.message
        } )
    }
};

// update profile
const updateProfile = async ( req, res ) =>
{
    try
    {
        const user = await req.user;
        uploadProfileImage( req, res, async ( err ) =>
        {
            try
            {
                if ( err )
                {
                    return res.status( 500 ).send( {
                        status: false,
                        message: 'Error during file upload: ' + err.message,
                    } );
                };

                const { name, email, mobile } = req.body;
                if ( user.image )
                {
                    const oldImagePath = path.join( __dirname, '../../', user.image );
                    // const oldImagePath = path.join( __dirname, '../../', user.image );
                    if ( fs.existsSync( oldImagePath ) )
                    {
                        fs.unlinkSync( oldImagePath );
                    }
                };
                const imageFilePath = req.file ? `/uploads/profileImages/${ moment().unix() }-${ req.file.originalname }` : null;

                user.email = email ? email.toLowerCase() : user.email;
                user.mobile = mobile ? mobile : user.mobile;
                user.name = name ? name : user.name;
                user.image = imageFilePath ? imageFilePath : user.image;

                await user.save();

                return res.status( 200 ).json( {
                    status: true,
                    message: "data updated successfully",
                    data: user
                } );
            } catch ( error )
            {
                console.log( error );
                if ( error.code === 11000 && error.keyPattern && ( error.keyPattern.email || error.keyPattern.mobile ) )
                {
                    const violatedKeys = Object.keys( error.keyPattern );
                    return res.status( 400 ).json( {
                        status: false,
                        message: `${ violatedKeys } is already registered. Please use a different ${ violatedKeys }.`,
                    } );
                }
                return res.status( 500 ).send( {
                    status: false,
                    message: error.message,
                } );
            }
        } );
    } catch ( error )
    {
        return res.status( 500 ).json( {
            status: false,
            message: error.message
        } )
    }
};



module.exports = {
    farmerSignUp,
    farmerLogin,
    getProfile,
    updateProfile,
};







// const addProduct = async (req, res) => {
//     try {
//         // Your existing code

//         uploadImages(req, res, async (err) => { // Change uploadImage to uploadImages
//             try {
//                 if (err) {
//                     return res.status(500).send({
//                         status: false,
//                         message: 'Error during file upload: ' + err.message,
//                     });
//                 }

//                 const imageFilePaths = req.files.map(file => `/uploads/${moment().unix()}-${file.originalname}`);
//                 // Process each image file path as needed
//             } catch (error) {
//                 return res.status(500).send({
//                     status: false,
//                     message: error.message,
//                 });
//             }
//         });
//     } catch (error) {
//         return res.status(500).json({
//             status: false,
//             message: error.message,
//         });
//     }
// };














// // signup
// const farmerSignUp = async ( req, res ) =>
// {
//     try
//     {
//         uploadCertificates( req, res, async ( err ) =>
//         {
//             try
//             {
//                 if ( err )
//                 {
//                     console.log( 'Error during file upload:', err );
//                     // Delete uploaded files if an error occurred
//                     deleteUploadedFiles( req.files );
//                     return res.status( 500 ).send( {
//                         status: false,
//                         message: 'Error during file upload: ' + err.message,
//                     } );
//                 };

//                 const { name, email, password, mobile, Aadhaar_Card_Number, PAN_Card_Number,
//                     state, city, postalCode, streetAddress, farmLocation, deviceToken } = req.body;

//                 const farmer = new farmerModel( {
//                     name: name,
//                     email: email.toLowerCase(),
//                     password: crypto.AES.encrypt( password, process.env.secretKey ).toString(),
//                     mobile: mobile,
//                     Aadhaar_Card_Number: Aadhaar_Card_Number,
//                     PAN_Card_Number: PAN_Card_Number,
//                     state: state,
//                     city: city,
//                     postalCode: postalCode,
//                     streetAddress: streetAddress,
//                     farmLocation: farmLocation,
//                     deviceToken: deviceToken,
//                 } );

//                 const certificates = {};
//                 if ( req.files )
//                 {
//                     certificates.Aadhaar_Card_Front = req.files[ 'Aadhaar_Card_Front' ] ? `/uploads/farmerCertificates/${ moment().unix() }-${ req.files[ 'Aadhaar_Card_Front' ][ 0 ].originalname }` : null;
//                     certificates.Aadhaar_Card_Back = req.files[ 'Aadhaar_Card_Back' ] ? `/uploads/farmerCertificates/${ moment().unix() }-${ req.files[ 'Aadhaar_Card_Back' ][ 0 ].originalname }` : null;
//                     certificates.PAN_Card = req.files[ 'PAN_Card' ] ? `/uploads/farmerCertificates/${ moment().unix() }-${ req.files[ 'PAN_Card' ][ 0 ].originalname }` : null;
//                 };

//                 farmer.certificates = certificates;

//                 await farmer.save();
//                 return res.status( 201 ).send( {
//                     status: true,
//                     message: 'successfully created',
//                     data: farmer
//                 } );
//             } catch ( error )
//             {
//                 console.log( error );
//                 // Delete uploaded files if an error occurred
//                 deleteUploadedFiles( req.files );
//                 if ( error.code === 11000 && error.keyPattern && ( error.keyPattern.email || error.keyPattern.mobile ) )
//                 {
//                     const violatedKeys = Object.keys( error.keyPattern );
//                     console.log( violatedKeys );
//                     return res.status( 400 ).json( {
//                         status: false,
//                         message: `${ violatedKeys } is already registered. Please use a different ${ violatedKeys }.`,
//                     } );
//                 }
//                 return res.status( 500 ).send( {
//                     status: false,
//                     message: error.message,
//                 } );
//             }
//         } );
//     } catch ( error )
//     {
//         console.log( 2222, error );
//         return res.status( 500 ).json( {
//             status: false,
//             message: error.message
//         } )
//     }
// };

// function deleteUploadedFiles ( files )
// {
//     if ( !files ) return;
//     for ( const file of Object.values( files ) )
//     {
//         if ( Array.isArray( file ) )
//         {
//             for ( const f of file )
//             {
//                 fs.unlink( f.path, ( err ) =>
//                 {
//                     if ( err )
//                     {
//                         console.error( 'Error deleting file:', err );
//                     } else
//                     {
//                         console.log( 'File deleted successfully:', f.path );
//                     }
//                 } );
//             }
//         } else
//         {
//             fs.unlink( file.path, ( err ) =>
//             {
//                 if ( err )
//                 {
//                     console.error( 'Error deleting file:', err );
//                 } else
//                 {
//                     console.log( 'File deleted successfully:', file.path );
//                 }
//             } );
//         }
//     }
// }
