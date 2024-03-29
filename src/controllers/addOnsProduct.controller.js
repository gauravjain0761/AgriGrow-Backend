const productModel = require( '../models/product.model' );
const addOnsProductModel = require( '../models/addOnsProduct.model' );

const { uploadAddOnImage } = require( '../../helpers/multer' );
// const fs = require( 'fs' );
// const path = require( 'path' );
const moment = require( 'moment' );


// add addOns product on product data
const productAddOns = async ( req, res ) =>
{
    try
    {
        const user = req.user;
        const { productId } = req.params;
        const product = await productModel.findOne( { _id: productId } );

        if ( !product )
        {
            return res.status( 404 ).json( {
                status: false,
                message: 'product data not found!'
            } )
        };
        if ( product.farmerId.toString() !== user.id.toString() )
        {
            return res.status( 403 ).json( {
                status: false,
                message: "Only the farmer who created the product has access to add addOns product.",
            } )
        };
        uploadAddOnImage( req, res, async ( err ) =>
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

                const { name, price } = req.body;
                if ( !name || !price )
                {
                    return res.json( {
                        status: false,
                        message: "field can't be empty"
                    } )
                }

                const imageFilePath = req.file ? `/uploads/productImages/addOnImages/${ moment().unix() }-${ req.file.originalname }` : null;

                const addOnProduct = new addOnsProductModel( {
                    farmerId: user._id,
                    productId: productId,
                    name: name,
                    price: price,
                    image: imageFilePath,
                } );

                await addOnProduct.save();
                return res.status( 201 ).json( {
                    status: true,
                    message: 'successfully added',
                    data: addOnProduct
                } );
            } catch ( error )
            {
                console.log( error );
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
            message: error.message,
        } );
    }
};

// get all add ons products
const getAllAddOnsProducts = async ( req, res ) =>
{
    try
    {
        const page = parseInt( req.query.page ) || 1;
        const limit = parseInt( req.query.limit ) || 10;

        const { productId } = req.params;
        const product = await addOnsProductModel.find( { productId: productId, farmerId: req.user._id } )
            .sort( { createdAt: -1 } )
            .skip( ( page - 1 ) * limit )
            .limit( limit )
            .exec();

        if ( !product )
        {
            return res.status( 404 ).json( {
                status: false,
                message: "not found!",
            } )
        };
        const totalDocuments = await addOnsProductModel.countDocuments( { productId: productId, farmerId: req.user._id } );

        return res.status( 200 ).json( {
            status: true,
            message: 'successfully fetched',
            totalDocuments: totalDocuments,
            data: product
        } );
    } catch ( error )
    {
        return res.status( 500 ).json( {
            status: false,
            message: error.message,
        } );
    }
};



module.exports = {
    productAddOns,
    getAllAddOnsProducts,
}