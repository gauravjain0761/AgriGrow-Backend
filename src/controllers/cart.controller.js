const cartModel = require( '../models/cart.model' );
const productModel = require( '../models/product.model' );
const moment = require( 'moment' );

// add product to cart
const addProductToCart = async ( req, res ) =>
{
    try
    {
        const user = req.user;
        const { productId, quantity } = req.body;

        const product = await productModel.findOne( { _id: productId } );
        if ( !product )
        {
            return res.status( 404 ).json( {
                status: false,
                message: 'product not found'
            } )
        };
        if ( quantity <= 0 )
        {
            return res.status( 400 ).json( {
                status: false,
                message: 'please add minimum 1 quantity'
            } )
        };
        if ( product.availableQuantity < quantity )
        {
            return res.status( 400 ).json( {
                status: false,
                message: `available product quantity is ${ product.availableQuantity }`
            } )
        };

        const totalPrice = quantity * product.price;
        const addProduct = new cartModel( {
            userId: user._id,
            productId: productId,
            quantity: quantity,
            totalPrice: totalPrice,
            time: moment().unix()
        } );

        if ( !addProduct )
        {
            return res.status( 400 ).json( {
                status: false,
                message: `can't add product to cart`
            } )
        };

        product.availableQuantity = product.availableQuantity - quantity;
        await product.save();

        await addProduct.save();
        return res.status( 201 ).json( {
            status: true,
            message: 'successfully added to cart',
            data: addProduct
        } )
    } catch ( error )
    {
        return res.status( 500 ).json( {
            status: false,
            message: error.message
        } )
    }
};

// getAllCartProducts
const getAllCartProducts = async ( req, res ) =>
{
    try
    {
        const productList = await cartModel.find( { userId: req.user._id } );
        if ( !productList )
        {
            return res.status( 404 ).json( {
                status: false,
                message: 'cart list not found'
            } )
        };

        return res.status( 200 ).json( {
            status: true,
            message: 'all products in the cart fetched successfully',
            data: productList
        } )
    } catch ( error )
    {
        return res.status( 500 ).json( {
            status: false,
            message: error.message
        } )
    }
};


module.exports = {
    addProductToCart,
    getAllCartProducts,
};