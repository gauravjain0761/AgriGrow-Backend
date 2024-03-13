const { check, validationResult } = require( 'express-validator' );

const userSignUp = [
    check( 'name' ).trim().notEmpty().withMessage( 'Name is required' )/* .matches( /^[a-zA-Z\s]+$/ ).withMessage( 'Name can only contain letters' ) */,
    check( 'email' ).trim().notEmpty().withMessage( 'Email is required' ).isEmail().withMessage( 'Invalid Email' ),
    check( 'password' ).trim().notEmpty().withMessage( 'Password is required' ).isLength( { min: 9 } ).withMessage( 'Password must be at least 9 characters long' )
        .matches( /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])/ ).withMessage( 'Password must contain at least one number, one special character, and one uppercase letter' ),
    check( 'mobile' ).optional().trim().isMobilePhone().withMessage( 'Invalid Contact Number' ),
    check( 'deviceToken' ).optional().trim().notEmpty().withMessage( 'Device Token is required' ),

    ( req, res, next ) =>
    {
        const errors = validationResult( req );
        if ( !errors.isEmpty() )
        {
            return res.status( 400 ).json( {
                status: false,
                errors: errors.array()
            } );
        }
        return next();
    }
];

const userLogin = [
    check( 'email' ).optional().trim().notEmpty().withMessage( 'Email is required' ).isEmail().withMessage( 'Invalid Email' ),
    check( 'mobile' ).optional().trim().isMobilePhone().withMessage( 'Invalid Contact Number' ),
    check( 'password' ).trim().notEmpty().withMessage( 'Password is required' ).isLength( { min: 9 } ).withMessage( 'Password must be at least 9 characters long' )
        .matches( /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])/ ).withMessage( 'Password must contain at least one number, one special character, and one uppercase letter' ),
    check( 'deviceToken' ).optional().trim().notEmpty().withMessage( 'Device Token is required' ),

    ( req, res, next ) =>
    {
        const errors = validationResult( req );
        if ( !errors.isEmpty() )
        {
            return res.status( 400 ).json( {
                status: false,
                errors: errors.array()
            } );
        }
        return next();
    }
];

const sendResetPasswordOtp = [
    check( 'email' ).trim().notEmpty().withMessage( 'Email is required' ).isEmail().withMessage( 'Invalid Email' ),

    ( req, res, next ) =>
    {
        const errors = validationResult( req );
        if ( !errors.isEmpty() )
        {
            return res.status( 400 ).json( {
                status: false,
                errors: errors.array()
            } );
        }
        return next();
    }
];

const resetPassword = [
    check( 'email' ).trim().notEmpty().withMessage( 'Email is required' ).isEmail().withMessage( 'Invalid Email' ),
    check( 'newPassword' ).trim().notEmpty().withMessage( 'Password is required' ).isLength( { min: 9 } ).withMessage( 'Password must be at least 9 characters long' )
        .matches( /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])/ ).withMessage( 'Password must contain at least one number, one special character, and one uppercase letter' ),
    check( 'confirmPassword' ).trim().notEmpty().withMessage( 'confirmPassword is required' ).isLength( { min: 9 } ).withMessage( 'confirmPassword must be at least 9 characters long' )
        .matches( /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])/ ).withMessage( 'confirmPassword must contain at least one number, one special character, and one uppercase letter' ),
    check( 'otp' ).trim().notEmpty().withMessage( 'OTP is required' ),

    ( req, res, next ) =>
    {
        const errors = validationResult( req );
        if ( !errors.isEmpty() )
        {
            return res.status( 400 ).json( {
                status: false,
                errors: errors.array()
            } );
        }
        return next();
    }
];

const loginWithMobileNumber = [
    check( 'mobile' ).trim().notEmpty().withMessage( 'Mobile is required' ).isMobilePhone().withMessage( 'Invalid Contact Number' ),

    ( req, res, next ) =>
    {
        const errors = validationResult( req );
        if ( !errors.isEmpty() )
        {
            return res.status( 400 ).json( {
                status: false,
                errors: errors.array()
            } );
        }
        return next();
    }
];

const verifyVerificationCode = [
    check( 'mobile' ).trim().notEmpty().withMessage( 'Mobile is required' ).isMobilePhone().withMessage( 'Invalid Contact Number' ),
    check( 'otp' ).trim().notEmpty().withMessage( 'OTP is required' ),
    check( 'deviceToken' ).optional().trim().notEmpty().withMessage( 'Device Token is required' ),

    ( req, res, next ) =>
    {
        const errors = validationResult( req );
        if ( !errors.isEmpty() )
        {
            return res.status( 400 ).json( {
                status: false,
                errors: errors.array()
            } );
        }
        return next();
    }
];

const signInWithGoogle = [
    check( 'email' ).trim().notEmpty().withMessage( 'Email is required' ).isEmail().withMessage( 'Invalid Email' ),
    check( 'deviceToken' ).optional().trim().notEmpty().withMessage( 'Device Token is required' ),

    ( req, res, next ) =>
    {
        const errors = validationResult( req );
        if ( !errors.isEmpty() )
        {
            return res.status( 400 ).json( {
                status: false,
                errors: errors.array()
            } );
        }
        return next();
    }
];

const signInWithFacebook = [
    check( 'email' ).optional().trim().notEmpty().withMessage( 'Email is required' ).isEmail().withMessage( 'Invalid Email' ),
    check( 'mobile' ).optional().trim().isMobilePhone().withMessage( 'Invalid Contact Number' ),
    check( 'deviceToken' ).optional().trim().notEmpty().withMessage( 'Device Token is required' ),

    ( req, res, next ) =>
    {
        const errors = validationResult( req );
        if ( !errors.isEmpty() )
        {
            return res.status( 400 ).json( {
                status: false,
                errors: errors.array()
            } );
        }
        return next();
    }
];

const updateProfile = [
    check( 'name' ).optional().trim().notEmpty().withMessage( 'Name is required' ),
    check( 'email' ).optional().trim().notEmpty().withMessage( 'Email is required' ).isEmail().withMessage( 'Invalid Email' ),
    check( 'mobile' ).optional().trim().isMobilePhone().withMessage( 'Invalid Contact Number' ),
    // check( 'image' ).optional().trim().notEmpty().withMessage( 'Image is required' ),

    ( req, res, next ) =>
    {
        const errors = validationResult( req );
        if ( !errors.isEmpty() )
        {
            return res.status( 400 ).json( {
                status: false,
                errors: errors.array()
            } );
        }
        return next();
    }
];


module.exports = {
    userSignUp,
    userLogin,
    sendResetPasswordOtp,
    resetPassword,
    loginWithMobileNumber,
    verifyVerificationCode,
    signInWithGoogle,
    signInWithFacebook,
    updateProfile,
};
