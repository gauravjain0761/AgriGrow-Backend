const { check, validationResult } = require( 'express-validator' );

const farmerSignUp = [
    check( 'name' ).trim().notEmpty().withMessage( 'Name is required' )/* .matches( /^[a-zA-Z\s]+$/ ).withMessage( 'Name can only contain letters' ) */,
    check( 'email' ).trim().notEmpty().withMessage( 'Email is required' ).isEmail().withMessage( 'Invalid Email' ),
    check( 'password' ).trim().notEmpty().withMessage( 'Password is required' ).isLength( { min: 9 } ).withMessage( 'Password must be at least 9 characters long' )
        .matches( /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])/ ).withMessage( 'Password must contain at least one number, one special character, and one uppercase letter' ),
    // check( 'mobile' ).optional().trim().isMobilePhone().withMessage( 'Invalid Contact Number' ),
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

const farmerLogin = [
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

module.exports = {
    farmerSignUp,
    farmerLogin,
}