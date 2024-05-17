const cartModel = require('../models/cart.model');
const productModel = require('../models/product.model');
const moment = require('moment');

// add product to cart
const addProductToCart = async (req, res) => {
    try {
        const user = req.user;
        const { productId, quantity } = req.body;
        if (!productId || !quantity) {
            return res.status(400).json({
                status: false,
                message: "please provide both productId & quantity"
            })
        };

        const product = await productModel.findOne({ _id: productId });
        if (!product) {
            return res.status(404).json({
                status: false,
                message: 'product not found'
            })
        };
        if (quantity <= 0) {
            return res.status(400).json({
                status: false,
                message: 'please add minimum 1 quantity'
            })
        };
        // if ( product.availableQuantity < quantity )
        // {
        //     return res.status( 400 ).json( {
        //         status: false,
        //         message: `available product quantity is ${ product.availableQuantity }`
        //     } )
        // };

        // const totalPrice = quantity * product.price;
        const addProduct = new cartModel({
            userId: user._id,
            productId: productId,
            farmerId: product.farmerId,
            quantity: quantity,
            // totalPrice: totalPrice,
            time: moment().unix()
        });

        if (!addProduct) {
            return res.status(400).json({
                status: false,
                message: `can't add product to cart`
            })
        };

        // product.availableQuantity = product.availableQuantity - quantity;
        // await product.save();


        // const addOnProducts = await addOnsProductModel.find( { _id: { $in: req.body.addOnsProductIds } } );
        // if ( !addOnProducts )
        // {
        //     return res.status( 404 ).json( {
        //         status: false,
        //         message: 'addOn product not found'
        //     } )
        // };


        await addProduct.save();
        return res.status(201).json({
            status: true,
            message: 'successfully added to cart',
            data: addProduct
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};

// getAllCartProducts
const getAllCartProducts = async (req, res) => {
    try {
        const productList = await cartModel.find({ userId: req.user._id });
        if (!productList) {
            return res.status(404).json({
                status: false,
                message: 'cart list not found'
            })
        };

        const getDate = productList.map(data => {
            const date = new Date(data.time * 1000);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();

            const formattedDate = `${day < 10 ? '0' : ''}${day}-${month < 10 ? '0' : ''}${month}-${year}`;
            const formattedTime = moment(date).format('hh:mm A');

            return {
                ...data.toObject(),
                addProductToCartDate: formattedDate,
                addProductToCartTime: formattedTime,
            };
        });

        return res.status(200).json({
            status: true,
            message: 'all products in the cart fetched successfully',
            // data: productList
            data: getDate
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};

// updateCartProduct
const updateCartProduct = async (req, res) => {
    try {
        const { quantity } = req.body;
        const { id } = req.params;
        console.log(id);
        const cartProduct = await cartModel.findOne({ _id: id, userId: req.user._id });
        if (!cartProduct) {
            return res.status(404).json({
                status: false,
                message: 'cart product not found'
            })
        };

        // console.log( 1111111, cartProduct );
        // console.table( cartProduct );
        return res.status(200).json({
            status: true,
            message: 'all products in the cart fetched successfully',
            data: cartProduct
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};

// removeProductFromCart
const removeProductFromCart = async (req, res) => {
    try {
        const { quantity } = req.body;
        const { id } = req.params;
        // console.log( id );
        const cartProduct = await cartModel.findOne({ _id: id, userId: req.user._id });
        if (!cartProduct) {
            return res.status(404).json({
                status: false,
                message: 'cart product not found'
            })
        };

        const product = await productModel.findOne({ _id: cartProduct.productId, isAvailable: true });
        if (!product) {
            return res.status(404).json({
                status: false,
                message: "product not found!",
            })
        };

        if (quantity > cartProduct.quantity) {
            return res.status(400).json({
                status: false,
                message: `can't remove more than ${cartProduct.quantity} quantity`,
            })
        };

        cartProduct.quantity = quantity ? quantity : cartProduct.quantity;
        await cartProduct.save();


        // console.log( 1111111, cartProduct );
        // console.table( cartProduct );
        return res.status(200).json({
            status: true,
            message: 'all products in the cart fetched successfully',
            data: cartProduct
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


module.exports = {
    addProductToCart,
    getAllCartProducts,
    updateCartProduct,
    removeProductFromCart,
};

