const cartModel = require('../models/cart.model');
const productModel = require('../models/product.model');
const farmerOrderModel = require('../models/farmerOrder.model');
const moment = require('moment');
var QRCode = require('qrcode')
const constants = require("../../config/constants.json");


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
        if (product.quantity < quantity) {
            return res.status(400).json({
                status: false,
                message: `available product quantity is ${product.quantity}`
            })
        };

        const totalPrice = quantity * product.offerPrice;
        // const qrCodeData = await QRCode.toDataURL(product._id.toString());

        const existingCartData = await cartModel.findOne({ userId: user._id });

        if (existingCartData) {
            existingCartData.productDetails.push({
                productId: productId,
                farmerId: product.farmerId,
                quantity: quantity,
                totalPrice: totalPrice,
                time: moment().unix().toString(),
            });

            await existingCartData.save();

            return res.status(201).json({
                status: true,
                message: 'successfully added to cart',
                data: existingCartData
            });
        };

        const newCart = new cartModel({
            userId: user._id,
            productDetails: [{
                productId: productId,
                farmerId: product.farmerId,
                quantity: quantity,
                totalPrice: totalPrice,
                time: moment().unix().toString(),
                // QRCode: qrCodeData
            }]
        });

        await newCart.save();

        return res.status(201).json({
            status: true,
            message: 'successfully added to cart',
            data: newCart
        });
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
        const productList = await cartModel.find({
            userId: req.user._id,
            // 'productDetails.status': 'AddedToCart'
        })
            .populate('productDetails.productId')
            .exec();

        const getProductDetails = productList.flatMap(cart =>
            cart.productDetails.filter(product => product.status === 'AddedToCart')
        );
        console.log(getProductDetails);
        console.log(getProductDetails.length);


        if (!productList || productList.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Cart list not found'
            });
        };

        return res.status(200).json({
            status: true,
            message: 'all added products to the cart fetched successfully',
            // data: productList,
            data: getProductDetails
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};



// getAllPlacedOrdersList
const getAllPlacedOrdersList = async (req, res) => {
    try {
        const productList = await cartModel.find({ userId: req.user._id })
            .populate('productDetails.productId')
            .exec();

        const orderList = productList.flatMap(cart =>
            cart.productDetails.filter(detail => detail.status === 'PlacedOrder')
        );
        // console.log('orderList---->', orderList);

        const getDate = orderList.map(data => {
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
            message: 'all placed order product in the cart fetched successfully',
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


// // buy product
// const buyProduct = async (req, res) => {
//     try {
//         const user = req.user;
//         const { cartId } = req.body;

//         // if (!cartId) {
//         //     return res.status(400).json({
//         //         status: false,
//         //         message: "please provide cartId"
//         //     })
//         // };

//         const cart = await cartModel.findOne({ _id: cartId, userId: user._id });
//         if (!cart) {
//             return res.status(404).json({
//                 status: false,
//                 message: 'product not found'
//             })
//         };

//         const product = await productModel.findOne({ _id: cart.productId });

//         // // const totalPrice = quantity * product.price;
//         // const addProduct = new cartModel({
//         //     userId: user._id,
//         //     productId: productId,
//         //     farmerId: product.farmerId,
//         //     quantity: quantity,
//         //     // totalPrice: totalPrice,
//         //     time: moment().unix()
//         // });

//         // if (!addProduct) {
//         //     return res.status(400).json({
//         //         status: false,
//         //         message: `can't add product to cart`
//         //     })
//         // };


//         product.userId.push(user._id);
//         product.quantity = product.quantity - cart.quantity;
//         product.quantity == 0 ? product.status = constants.PRODUCT_STATUS.SOLD : constants.PRODUCT_STATUS.AVAILABLE;

//         await product.save();


//         const generateQRCodeForTheData = { productId: cart.productId, userId: cart.userId };
//         const qrCode = await QRCode.toDataURL(generateQRCodeForTheData);

//         cart.QRCode = qrCode;
//         cart.status = 'PlacedOredr';
//         await cart.save();

//         return res.status(201).json({
//             status: true,
//             message: 'Order Placed successfully',
//             data: cart,
//             qrCodeData: qrCode
//         })
//     } catch (error) {
//         return res.status(500).json({
//             status: false,
//             message: error.message
//         })
//     }
// };





// buy product API
const buyProduct = async (req, res) => {
    try {
        const user = req.user;
        const { productIds } = req.body; // Array of productIds

        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({
                status: false,
                message: "please provide an array of productIds"
            });
        }

        const cartData = await cartModel.findOne({ userId: user._id });
        if (!cartData) {
            return res.status(404).json({
                status: false,
                message: 'cart not found'
            });
        };
        console.log('cartData---->', cartData);
        // console.log('cartData---->', cartData.status);

        // if (cartData.status != 'AddedToCart') {
        //     return res.status(400).json({
        //         status: false,
        //         message: `cart status is ${cartData.status}`
        //     });
        // };

        const productsToBuy = cartData.productDetails.filter(productDetail =>
            productIds.includes(productDetail.productId.toString())
        );

        console.log('productsToBuy ---->', productsToBuy);

        if (productsToBuy.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'none of the products are in the cart'
            });
        };

        for (let productDetail of productsToBuy) {
            const product = await productModel.findOne({ _id: productDetail.productId });
            console.log('product  ----->', product);
            console.log('productDetail  ----->', productDetail);
            if (!product) {
                return res.status(404).json({
                    status: false,
                    message: `product with id ${productDetail.productId} not found`
                });
            };

            if (product.quantity < productDetail.quantity) {
                return res.status(400).json({
                    status: false,
                    message: `insufficient quantity for product with id ${productDetail.productId}, the avaailable quantity is ${productDetail.quantity} `
                });
            };

            // -----------------------------------------------------------------------------------
            product.quantity -= productDetail.quantity;
            if (product.quantity === 0) {
                product.status = constants.PRODUCT_STATUS.SOLD;
            };
            await product.save();

            // ------------------------------------------------------------------------------------
            const farmerOrder = new farmerOrderModel({
                userId: user._id,
                productId: productDetail.productId,
                farmerId: productDetail.farmerId,
                status: 'New',
                quantity: productDetail.quantity,
                totalPrice: productDetail.totalPrice,
                time: moment().unix()
            });
            console.log('farmerOrder---->', farmerOrder);
            await farmerOrder.save();

            // --------------------------------------------------------------------------------------
            const qrCodeData = await QRCode.toDataURL(productIds.toString());

            productDetail.time = moment().unix();
            productDetail.status = 'PlacedOrder';
            productDetail.QRCode = qrCodeData;
        }

        await cartData.save();

        return res.status(200).json({
            status: true,
            message: 'products bought successfully',
            data: cartData
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};









module.exports = {
    addProductToCart,
    getAllCartProducts,
    getAllPlacedOrdersList,
    updateCartProduct,
    removeProductFromCart,
    buyProduct,
};

