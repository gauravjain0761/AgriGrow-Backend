// const { check, validationResult } = require( 'express-validator' );

// const addProduct = [
//     check( 'categoryId' ).trim().notEmpty().withMessage( 'Category Id is required' ),
//     check( 'name' ).trim().notEmpty().withMessage( 'Category Name is required' ).matches( /^[a-zA-Z\s]+$/ ).withMessage( 'Name can only contain letters' ),
//     check( 'description' ).trim().notEmpty().withMessage( 'Description is required' ),
//     check( 'price' ).trim().notEmpty().withMessage( 'Price is required' ).isNumeric().withMessage( 'Price must be a number' ),
//     check( 'discount' ).optional().trim().notEmpty().withMessage( 'Discount is required' ).isNumeric().withMessage( 'Discount must be a number' ),
//     check( 'totalQuantity' ).trim().notEmpty().withMessage( 'Total quantity is required' ).isNumeric().withMessage( 'Total quantity must be a number' ),

//     ( req, res, next ) =>
//     {
//         const errors = validationResult( req );
//         console.log( errors );
//         if ( !errors.isEmpty() )
//         {
//             return res.status( 400 ).json( {
//                 status: false,
//                 errors: errors.array()
//             } );
//         }
//         return next();
//     }
// ];


// module.exports = {
//     addProduct,
// };