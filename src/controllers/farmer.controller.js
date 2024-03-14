const farmerModel = require( '../models/farmer.model' );
const crypto = require( 'crypto-js' );
const jwt = require( 'jsonwebtoken' );
const { generateRandomNumber } = require( "../../helpers/randomNumber.helper" );
const { sendOtp } = require( "../../helpers/sendEmail.helper" );


const { uploadImage } = require( '../../helpers/multer' );
const fs = require( 'fs' );
const path = require( 'path' );
const moment = require( 'moment' );

// signup
const farmerSignUp = async ( req, res ) =>
{
    try
    {
        const { name, email, password, mobile, Aadhaar_Card_Number, PAN_Card_Number,
            state, city, postalCode, streetAddress, farmLocation, deviceToken } = req.body;

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
            deviceToken: deviceToken
        } );

        await farmer.save();
        return res.status( 201 ).send( {
            status: true,
            message: 'successfully created',
            data: farmer
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


module.exports = {
    farmerSignUp,
    farmerLogin,
};

