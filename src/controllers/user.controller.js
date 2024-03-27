const userModel = require( '../models/user.model' );
const crypto = require( 'crypto-js' );
const jwt = require( 'jsonwebtoken' );
const { generateRandomNumber } = require( "../../helpers/randomNumber.helper" );
const { sendOtp } = require( "../../helpers/sendEmail.helper" );


const { uploadProfileImage } = require( '../../helpers/multer' );
const fs = require( 'fs' );
const path = require( 'path' );
const moment = require( 'moment' );

// signup
const userSignUp = async ( req, res ) =>
{
    try
    {
        const { name, email, password, mobile, deviceToken } = req.body;

        const user = new userModel( {
            name: name,
            email: email.toLowerCase(),
            password: crypto.AES.encrypt(
                password,
                process.env.secretKey
            ).toString(),
            mobile: mobile,
            deviceToken: deviceToken
        } );

        await user.save();
        return res.status( 201 ).send( {
            status: true,
            message: 'successfully created',
            data: user
        } );
    } catch ( error )
    {
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
};

// login
const userLogin = async ( req, res ) =>
{
    try
    {
        const { email, mobile, password, deviceToken } = req.body;

        let query = {};
        if ( email )
        {
            query = { email: email.toLowerCase() };
        } else if ( mobile )
        {
            query = { mobile: mobile };
        } else
        {
            return res.status( 400 ).json( {
                status: false,
                message: "Email or mobile number is required."
            } );
        };

        const user = await userModel.findOne( { $or: [ query ] } );
        // console.log( user );
        // const user = await userModel.findOne( {
        //     $or: [
        //         { email: email },
        //         { mobile: mobile }
        //     ]
        // } );

        if ( !user )
        {
            return res.status( 404 ).send( {
                status: false,
                message: "not found!",
            } );
        }

        const decryptedPass = crypto.AES.decrypt(
            user.password,
            process.env.secretKey
        ).toString( crypto.enc.Utf8 );

        if ( password !== decryptedPass )
        {
            return res.status( 400 ).send( {
                status: false,
                message: "incorrect email or password!",
            } );
        };

        const token = jwt.sign(
            { id: user._id, email: user.email },
            "qwerty1234",
            { expiresIn: '24h' }
        );

        user.deviceToken = deviceToken;
        await user.save();

        return res.status( 200 ).send( {
            status: true,
            message: "login successfully",
            token: token,
            userData: user
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

// send reset password otp to email
const sendResetPasswordOtp = async ( req, res ) =>
{
    try
    {
        const { email } = req.body;

        const user = await userModel.findOne( { email: email.toLowerCase() } );

        if ( !user )
        {
            return res.status( 404 ).send( {
                status: false,
                message: "User Not Found!",
            } );
        };

        const getOtp = generateRandomNumber( 4 );
        user.otp = getOtp;
        const otpValidTill = new Date();
        otpValidTill.setMinutes( otpValidTill.getMinutes() + 10 );
        user.otpValidTill = otpValidTill;

        await user.save();
        sendOtp( user );

        return res.status( 200 ).send( {
            status: true,
            message: `Your OTP for Password Reset is send to ${ user.email } successfully`,
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

// reset password
const resetPassword = async ( req, res ) =>
{
    try
    {
        const { newPassword, confirmPassword, email, otp } = req.body;

        const user = await userModel.findOne( { email: email.toLowerCase() } );
        if ( !user )
        {
            return res.status( 404 ).send( {
                status: false,
                message: "User not found!"
            } );
        }
        if ( user.otpValidTill < new Date() )
        {
            return res.status( 404 ).send( {
                status: false,
                message: "OTP valid for only 10 minutes, please use new OTP!"
            } );
        }
        if ( user.otp !== otp )
        {
            return res.status( 404 ).send( {
                status: false,
                message: "OTP not matched!"
            } );
        }

        const decryptedPass = crypto.AES.decrypt( user.password, process.env.secretKey ).toString( crypto.enc.Utf8 );
        // console.log( decryptedPass );

        if ( decryptedPass === newPassword )
        {
            return res.status( 400 ).send( {
                status: false,
                message: "Your new password matches your existing password, please choose another password."
            } );
        }
        if ( newPassword !== confirmPassword )
        {
            return res.status( 400 ).send( {
                status: false,
                message: "Password not matched!"
            } );
        }
        const newEncryptPassword = crypto.AES.encrypt( newPassword, process.env.secretKey ).toString();
        user.password = newEncryptPassword;
        user.otp = null;
        user.otpValidTill = null;
        const newResetPassword = await user.save();
        return res.status( 200 ).send( {
            status: true,
            message: "Reset password successfully",
            newPassword: newResetPassword,
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

// login with mobile
const loginWithMobileNumber = async ( req, res ) =>
{
    try
    {
        const { mobile } = req.body;

        const user = await userModel.findOne( { mobile: mobile } )
        if ( !user )
        {
            return res.status( 404 ).send( {
                status: false,
                message: "User Not Found!",
            } );
        };

        const getOtp = generateRandomNumber( 4 );
        user.otp = getOtp;
        const otpValidTill = new Date();
        otpValidTill.setMinutes( otpValidTill.getMinutes() + 10 );
        user.otpValidTill = otpValidTill;

        await user.save();
        return res.status( 200 ).send( {
            status: true,
            message: `registration otp send to ${ user.mobile } successfully`,
            data: user
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

// verify verification code
const verifyVerificationCode = async ( req, res ) =>
{
    try
    {
        const { mobile, otp, deviceToken } = req.body;

        const user = await userModel.findOne( { mobile: mobile } );
        if ( !user )
        {
            return res.status( 404 ).send( {
                status: false,
                message: "User Not Found!",
            } );
        };
        if ( user.otp !== otp )
        {
            return res.status( 404 ).send( {
                status: false,
                message: "OTP not matched!"
            } );
        };
        if ( user.otpValidTill < new Date() )
        {
            return res.status( 404 ).send( {
                status: false,
                message: "OTP valid for only 10 minutes, please use new OTP!"
            } );
        };

        const token = jwt.sign(
            { id: user._id, mobile: user.mobile }, "qwerty1234", { expiresIn: '24h' }
        );

        user.deviceToken = deviceToken;
        user.otp = null;
        await user.save();

        return res.status( 200 ).send( {
            status: true,
            message: "verify otp successfully",
            token: token,
            data: user,
        } );
    } catch ( error )
    {
        return res.status( 500 ).send( {
            status: false,
            message: error.message
        } )
    }
};

// sign-in with Google
const signInWithGoogle = async ( req, res ) =>
{
    try
    {
        const { email, deviceToken } = req.body;
        const user = await userModel.findOne( { email: email.toLowerCase() } );
        if ( !user )
        {
            return res.status( 404 ).json( {
                status: false,
                message: 'not found!'
            } )
        };

        const token = jwt.sign(
            { id: user._id, email: user.email }, "qwerty1234", { expiresIn: '24h' }
        );

        user.deviceToken = deviceToken;
        user.socialLogin = true;
        await user.save();

        return res.status( 200 ).send( {
            status: true,
            message: "login successfully",
            token: token,
            data: user,
        } );
    } catch ( error )
    {
        return res.status( 500 ).json( {
            status: false,
            message: error.message
        } )
    }
};

// sign-in with Facebook
const signInWithFacebook = async ( req, res ) =>
{
    try
    {
        const { email, mobile, deviceToken } = req.body;

        let query = {};
        if ( email )
        {
            query = { email: email.toLowerCase() };
        } else if ( mobile )
        {
            query = { mobile: mobile };
        } else
        {
            return res.status( 400 ).json( {
                status: false,
                message: "Email or mobile number is required."
            } );
        };

        const user = await userModel.findOne( query );


        if ( !user )
        {
            return res.status( 404 ).json( {
                status: false,
                message: 'not found!'
            } )
        };

        const token = jwt.sign(
            { id: user._id, email: user.email }, "qwerty1234", { expiresIn: '24h' }
        );

        user.deviceToken = deviceToken;
        user.socialLogin = true;
        await user.save();

        return res.status( 200 ).send( {
            status: true,
            message: "login successfully",
            token: token,
            data: user,
        } );
    } catch ( error )
    {
        return res.status( 500 ).json( {
            status: false,
            message: error.message
        } )
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
    userSignUp,
    userLogin,
    sendResetPasswordOtp,
    resetPassword,
    loginWithMobileNumber,
    verifyVerificationCode,
    signInWithGoogle,
    signInWithFacebook,
    getProfile,
    updateProfile,
};

