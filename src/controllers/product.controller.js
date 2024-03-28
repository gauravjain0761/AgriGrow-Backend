const categoryModel = require( '../models/category.model' );
const productModel = require( '../models/product.model' );
const cartModel = require( '../models/cart.model' );

const { uploadProductImages } = require( '../../helpers/multer' );
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
        uploadProductImages( req, res, async ( err ) =>
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

                const images = req.files;

                const imageFilePaths = images.map( image => `/uploads/productImages/${ moment().unix() }-${ image.originalname }` );

                const { productName, description, originalPrice, offerPrice, discount, quantity,
                    name, price } = req.body;

                const product = new productModel( {
                    farmerId: req.user._id,
                    categoryId: category.id,
                    category: category.name,
                    productName: productName,
                    description: description,
                    images: imageFilePaths,
                    originalPrice: originalPrice,
                    offerPrice: offerPrice,
                    discount: discount,
                    quantity: quantity,
                    time: moment().unix(),
                    // addOns: [ {
                    //     image: 'imageFilePaths[ 0 ]',
                    //     name: name,
                    //     price: price
                    // } ]
                } );

                await product.save();
                return res.status( 201 ).json( {
                    status: true,
                    message: 'successfully created',
                    data: product
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
        uploadProductImages( req, res, async ( err ) =>
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

                const { productName, description, originalPrice, offerPrice, discount, quantity, } = req.body;

                if ( product.images && product.images.length > 0 )
                {
                    product.images.forEach( oldImagePath =>
                    {
                        const absolutePath = path.join( __dirname, '../../', oldImagePath );
                        if ( fs.existsSync( absolutePath ) )
                        {
                            fs.unlinkSync( absolutePath );
                        }
                    } );
                };

                const images = req.files;
                const imageFilePaths = images.map( image => `/uploads/productImages/${ moment().unix() }-${ image.originalname }` );

                product.productName = productName ? productName : product.productName;
                product.description = description ? description : product.description;
                product.originalPrice = originalPrice ? originalPrice : product.originalPrice;
                product.offerPrice = offerPrice ? offerPrice : product.offerPrice;
                product.discount = discount ? discount : product.discount;
                product.quantity = quantity ? quantity : product.quantity;
                product.images = imageFilePaths ? imageFilePaths : product.images;

                await product.save();
                return res.status( 200 ).json( {
                    status: true,
                    message: 'product successfully updated',
                    data: product
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

        const { productName, category } = req.body;
        const product = await productModel.find( {
            $or: [
                { productName: { $regex: `${ productName }`, $options: 'i' }, },
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

// delete product by Id
const deleteProduct = async ( req, res ) =>
{
    try
    {
        const { productId } = req.params;

        const product = await productModel.findOne( { _id: productId } );
        if ( !product )
        {
            return res.status( 404 ).json( {
                status: false,
                message: "Product not found!",
            } )
        };

        // if ( product.farmerId.toString() !== user._id.toString() )
        if ( !product.farmerId.equals( req.user._id ) )
        {
            return res.status( 403 ).json( {
                status: false,
                message: "Only the farmer who created the product has access to delete it.",
            } );
        };

        if ( product.images && product.images.length > 0 )
        {
            product.images.forEach( oldImagePath =>
            {
                const absolutePath = path.join( __dirname, '../../', oldImagePath );
                if ( fs.existsSync( absolutePath ) )
                {
                    fs.unlinkSync( absolutePath );
                }
            } );
        };

        await productModel.findByIdAndDelete( productId );

        return res.status( 200 ).send( {
            status: true,
            message: "Product Deleted Successfully",
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
    deleteProduct
};








// const addProduct = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const category = await categoryModel.findOne({ _id: id });
//         if (!category) {
//             return res.status(404).json({
//                 status: false,
//                 message: 'category data not found!'
//             });
//         };

//         uploadImage(req, res, async (err) => {
//             try {
//                 if (err) {
//                     return res.status(500).send({
//                         status: false,
//                         message: 'Error during file upload: ' + err.message,
//                     });
//                 };

//                 const images = req.files; // Assuming multiple images are uploaded
//                 if (!images || images.length === 0) {
//                     return res.status(400).json({
//                         status: false,
//                         message: 'Please upload at least one image.',
//                     });
//                 } else if (images.length > 3) {
//                     return res.status(400).json({
//                         status: false,
//                         message: 'Maximum of 3 images can be uploaded.',
//                     });
//                 }

//                 const imageFilePaths = images.map(image => `/uploads/${moment().unix()}-${image.originalname}`);

//                 const { name, description, price, discount, totalQuantity, bestDealOfferProduct } = req.body;

//                 const product = new productModel({
//                     farmerId: req.user._id,
//                     categoryId: category.id,
//                     category: category.name,
//                     name: name,
//                     description: description,
//                     totalQuantity: totalQuantity,
//                     availableQuantity: totalQuantity,
//                     price: price,
//                     totalPrice: price * totalQuantity,
//                     discount: discount,
//                     images: imageFilePaths, // Assuming 'images' field in your product model to store multiple images
//                     bestDealOfferProduct: bestDealOfferProduct,
//                     time: moment().unix()
//                 });

//                 await product.save();
//                 return res.status(201).json({
//                     status: true,
//                     message: 'successfully created',
//                     data: product
//                 });
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
