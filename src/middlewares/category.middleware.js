const { check, validationResult } = require( 'express-validator' );

const addCategory = [
    check( 'name' ).trim().notEmpty().withMessage( 'Category Name is required' ).matches( /^[a-zA-Z\s]+$/ ).withMessage( 'Name can only contain letters' ),

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
    addCategory,
};