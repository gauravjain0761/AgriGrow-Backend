const categoryModel = require( '../models/category.model' );
const productModel = require( '../models/product.model' );
const cartModel = require( '../models/cart.model' );

const { uploadImage } = require( '../../helpers/multer' );
const fs = require( 'fs' );
const path = require( 'path' );
const moment = require( 'moment' );


// addProduct
const addProduct = async ( req, res ) =>
{
    try
    {
        const { id } = req.params;
        const category = await categoryModel.findOne( { _id: id } );
        if ( !category )
        {
            return res.status( 404 ).json( {
                status: false,
                message: 'category data not found!'
            } )
        };

        uploadImage( req, res, async ( err ) =>
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

                const imageFilePath = req.file ? `/uploads/${ moment().unix() }-${ req.file.originalname }` : null;
                const { name, description, price, discount, totalQuantity, bestDealOfferProduct } = req.body;

                const product = new productModel( {
                    farmerId: req.user._id,
                    categoryId: category.id,
                    category: category.name,
                    name: name,
                    description: description,
                    totalQuantity: totalQuantity,
                    availableQuantity: totalQuantity,
                    price: price,
                    totalPrice: price * totalQuantity,
                    discount: discount,
                    image: imageFilePath,
                    bestDealOfferProduct: bestDealOfferProduct
                } );

                await product.save();
                return res.status( 201 ).json( {
                    status: true,
                    message: 'successfully created',
                    data: product
                } );
            } catch ( error )
            {
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

// updateProduct
const updateProduct = async ( req, res ) =>
{
    try
    {
        const { id } = req.params;
        const product = await productModel.findOne( { _id: id } );
        if ( !product )
        {
            return res.status( 404 ).json( {
                status: false,
                message: 'product data not found!'
            } )
        };

        uploadImage( req, res, async ( err ) =>
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

                const { name, description, totalQuantity, price, discount, bestDealOfferProduct } = req.body;
                if ( product.image )
                {
                    const oldImagePath = path.join( __dirname, '../../', product.image );
                    if ( fs.existsSync( oldImagePath ) )
                    {
                        fs.unlinkSync( oldImagePath );
                    }
                };

                const imageFilePath = req.file ? `/uploads/${ moment().unix() }-${ req.file.originalname }` : null;

                product.name = name ? name : product.name;
                product.description = description ? description : product.description;
                product.totalQuantity = totalQuantity ? totalQuantity : product.totalQuantity;
                product.availableQuantity = totalQuantity ? totalQuantity : product.availableQuantity;
                product.price = price ? price : product.price;
                product.totalPrice = price ? price * totalQuantity : product.totalPrice;
                product.discount = discount ? discount : product.discount;
                product.bestDealOfferProduct = bestDealOfferProduct ? bestDealOfferProduct : product.bestDealOfferProduct;
                product.image = imageFilePath ? imageFilePath : product.image;

                await product.save();
                return res.status( 200 ).json( {
                    status: true,
                    message: 'product successfully updated',
                    data: product
                } );
            } catch ( error )
            {
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

// get all products
const getAllProducts = async ( req, res ) =>
{
    try
    {
        const page = parseInt( req.query.page ) || 1;
        const limit = parseInt( req.query.limit ) || 10;

        const product = await productModel.find( { isAvailable: true } )
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
        const totalDocuments = await productModel.countDocuments();

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

// get all best deal offer products
const getAllBestDealProducts = async ( req, res ) =>
{
    try
    {
        const page = parseInt( req.query.page ) || 1;
        const limit = parseInt( req.query.limit ) || 10;

        const product = await productModel.find( { bestDealOfferProduct: true, isAvailable: true } )
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
        const totalDocuments = await productModel.find( { bestDealOfferProduct: true, isAvailable: true } ).countDocuments();

        return res.status( 200 ).json( {
            status: true,
            message: 'successfully fetched all best deal offer products',
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

// get product by product id
const getProductDetails = async ( req, res ) =>
{
    try
    {
        const productId = req.params.productId;
        const product = await productModel.findOne( { _id: productId, isAvailable: true } );
        if ( !product )
        {
            return res.status( 404 ).json( {
                status: false,
                message: "not found!",
            } )
        };

        return res.status( 200 ).json( {
            status: true,
            message: 'successfully fetched',
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

// search product
const searchProduct = async ( req, res ) =>
{
    try
    {
        // const user = await userModel.find(
        //     { name: { $regex: `${ name }`, $options: 'i' }, isAvailable: true },
        //     // { name: { $regex: `^${ name }`, $options: 'i' }, isAvailable: true },
        // );

        const { name, category } = req.body;
        const product = await productModel.find( {
            $or: [
                { name: { $regex: `${ name }`, $options: 'i' }, },
                { category: { $regex: `${ category }`, $options: 'i' }, },
            ]
        } );
        // console.log( product );
        if ( !product )
        {
            return res.status( 404 ).json( {
                status: false,
                message: 'not found!'
            } )
        };

        return res.status( 200 ).json( {
            status: true,
            message: 'searched successfully',
            data: product
        } );
    } catch ( error )
    {
        return res.status( 500 ).json( {
            status: false,
            message: error.message
        } )
    }
};

// get product all details
const productAllDetails = async ( req, res ) =>
{
    try
    {
        const productId = req.params.productId;
        const product = await cartModel.find( { productId: productId, /* userId: req.user._id */ } )
            .populate( {
                path: 'userId',
                select: 'name email mobile image state city postalCode streetAddress'
            } )
            .populate( {
                path: 'productId',
                select: 'categoryId category name description image price discount status'
            } )
            .exec();

        if ( !product )
        {
            return res.status( 404 ).json( {
                status: false,
                message: "not found!",
            } )
        };

        return res.status( 200 ).json( {
            status: true,
            message: 'fetched successfully',
            data: product
        } );
    } catch ( error )
    {
        console.log( error );
        return res.status( 500 ).json( {
            status: false,
            message: error.message
        } )
    }
};


module.exports = {
    addProduct,
    updateProduct,
    getAllProducts,
    getAllBestDealProducts,
    getProductDetails,
    searchProduct,
    productAllDetails,
};


