const cartModel = require('../models/cart.model');
const productModel = require('../models/product.model');
const farmerOrderModel = require('../models/farmerOrder.model');
const moment = require('moment');
var QRCode = require('qrcode')
const constants = require("../../config/constants.json");


// 3 times, 04-06, 05-06-2024, 06-06-24

// add product to cart
const addProductToCart = async (req, res) => {
    try {
        const user = req.user;
        const { productId, addQuantityId } = req.body;

        if (!productId || !addQuantityId) {
            return res.status(400).json({
                status: false,
                message: "Please provide productId and addQuantityId"
            });
        };

        const product = await productModel.findOne({ _id: productId });
        if (!product) {
            return res.status(404).json({
                status: false,
                message: 'Product not found'
            });
        };

        const addQuantityObj = product.addQuantity.id(addQuantityId);
        if (!addQuantityObj) {
            return res.status(404).json({
                status: false,
                message: `AddQuantity object not found by this Id ${addQuantityId}`
            });
        };

        const quantity = addQuantityObj.quantity;

        if (quantity <= 0) {
            return res.status(400).json({
                status: false,
                message: `The avaialble product quantity is ${quantity}`
                // message: 'Please add a minimum of 1 quantity'
            });
        };

        const totalPrice = addQuantityObj.offerPrice;

        const existingCartData = await cartModel.findOne({ userId: user._id });

        if (existingCartData) {
            const existingFarmerIds = existingCartData.productDetails.map(detail => detail.farmerId.toString());
            const currentFarmerId = product.farmerId.toString();

            if (existingFarmerIds.length > 0 && existingFarmerIds[0] !== currentFarmerId) {
                return res.status(400).json({
                    status: false,
                    message: 'You can only add products from one farmer at a time to your cart'
                });
            }

            existingCartData.productDetails.push({
                productId: productId,
                addQuantityId: addQuantityId,
                farmerId: product.farmerId,
                quantity: 1,
                totalPrice: totalPrice * 1,
                time: moment().unix().toString(),
            });

            await existingCartData.save();

            return res.status(201).json({
                status: true,
                message: 'Successfully added to cart',
                data: existingCartData
            });
        };

        const newCart = new cartModel({
            userId: user._id,
            productDetails: [{
                productId: productId,
                addQuantityId: addQuantityId,
                farmerId: product.farmerId,
                quantity: 1,
                totalPrice: totalPrice * 1,
                time: moment().unix().toString(),
            }]
        });

        await newCart.save();

        return res.status(201).json({
            status: true,
            message: 'Successfully added to cart',
            data: newCart
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};



















// // add product to cart
// const addProductToCart = async (req, res) => {
//     try {
//         const user = req.user;
//         const { productId, addQuantityId, quantity } = req.body;

//         if (!productId || !addQuantityId || !quantity) {
//             return res.status(400).json({
//                 status: false,
//                 message: "Please provide productId, addQuantityId, and quantity"
//             });
//         };

//         const product = await productModel.findOne({ _id: productId });
//         if (!product) {
//             return res.status(404).json({
//                 status: false,
//                 message: 'Product not found'
//             });
//         };

//         const addQuantityObj = product.addQuantity.id(addQuantityId);
//         if (!addQuantityObj) {
//             return res.status(404).json({
//                 status: false,
//                 message: `AddQuantity object not found by this Id ${addQuantityId}`
//             });
//         };

//         if (quantity <= 0) {
//             return res.status(400).json({
//                 status: false,
//                 message: 'Please add a minimum of 1 quantity'
//             });
//         };

//         if (addQuantityObj.quantity < quantity) {
//             return res.status(400).json({
//                 status: false,
//                 message: `Available product quantity is ${addQuantityObj.quantity}`
//             });
//         };

//         const totalPrice = quantity * addQuantityObj.offerPrice;

//         const existingCartData = await cartModel.findOne({ userId: user._id });

//         if (existingCartData) {
//             const existingFarmerIds = existingCartData.productDetails.map(detail => detail.farmerId.toString());
//             const currentFarmerId = product.farmerId.toString();

//             if (existingFarmerIds.length > 0 && existingFarmerIds[0] !== currentFarmerId) {
//                 return res.status(400).json({
//                     status: false,
//                     message: 'You can only add products from one farmer at a time to your cart'
//                 });
//             }

//             existingCartData.productDetails.push({
//                 productId: productId,
//                 addQuantityId: addQuantityId,
//                 farmerId: product.farmerId,
//                 quantity: quantity,
//                 totalPrice: totalPrice,
//                 time: moment().unix().toString(),
//             });

//             await existingCartData.save();

//             return res.status(201).json({
//                 status: true,
//                 message: 'Successfully added to cart',
//                 data: existingCartData
//             });
//         };

//         const newCart = new cartModel({
//             userId: user._id,
//             productDetails: [{
//                 productId: productId,
//                 addQuantityId: addQuantityId,
//                 farmerId: product.farmerId,
//                 quantity: quantity,
//                 totalPrice: totalPrice,
//                 time: moment().unix().toString(),
//             }]
//         });

//         await newCart.save();

//         return res.status(201).json({
//             status: true,
//             message: 'Successfully added to cart',
//             data: newCart
//         });
//     } catch (error) {
//         return res.status(500).json({
//             status: false,
//             message: error.message
//         });
//     }
// };
















// const addProductToCart = async (req, res) => {
//     try {
//         const user = req.user;
//         const { productId, addQuantityId, quantity } = req.body;

//         if (!productId || !addQuantityId || !quantity) {
//             return res.status(400).json({
//                 status: false,
//                 message: "Please provide productId, addQuantityId, and quantity"
//             });
//         }

//         const product = await productModel.findOne({ _id: productId });
//         if (!product) {
//             return res.status(404).json({
//                 status: false,
//                 message: 'Product not found'
//             });
//         }

//         const addQuantityItem = product.addQuantity.id(addQuantityId);
//         if (!addQuantityItem) {
//             return res.status(404).json({
//                 status: false,
//                 message: 'AddQuantity item not found'
//             });
//         }

//         if (quantity <= 0) {
//             return res.status(400).json({
//                 status: false,
//                 message: 'Please add a minimum of 1 quantity'
//             });
//         }

//         if (addQuantityItem.quantity < quantity) {
//             return res.status(400).json({
//                 status: false,
//                 message: `Available product quantity is ${addQuantityItem.quantity}`
//             });
//         }

//         const totalPrice = quantity * addQuantityItem.offerPrice;

//         const existingCartData = await cartModel.findOne({ userId: user._id });

//         if (existingCartData) {
//             const existingFarmerIds = existingCartData.productDetails.map(detail => detail.farmerId.toString());
//             const currentFarmerId = product.farmerId.toString();

//             if (existingFarmerIds.length > 0 && existingFarmerIds[0] !== currentFarmerId) {
//                 return res.status(400).json({
//                     status: false,
//                     message: 'You can only add products from one farmer at a time to your cart'
//                 });
//             }

//             existingCartData.productDetails.push({
//                 productId: productId,
//                 farmerId: product.farmerId,
//                 quantity: quantity,
//                 totalPrice: totalPrice,
//                 time: moment().unix().toString(),
//             });

//             await existingCartData.save();

//             return res.status(201).json({
//                 status: true,
//                 message: 'Successfully added to cart',
//                 data: existingCartData
//             });
//         }

//         const newCart = new cartModel({
//             userId: user._id,
//             productDetails: [{
//                 productId: productId,
//                 farmerId: product.farmerId,
//                 quantity: quantity,
//                 totalPrice: totalPrice,
//                 time: moment().unix().toString(),
//             }]
//         });

//         await newCart.save();

//         return res.status(201).json({
//             status: true,
//             message: 'Successfully added to cart',
//             data: newCart
//         });
//     } catch (error) {
//         return res.status(500).json({
//             status: false,
//             message: error.message
//         });
//     }
// };








// // getAllCartProducts
// const getAllCartProducts = async (req, res) => {
//     try {
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;

//         const productList = await cartModel.find({
//             userId: req.user._id,
//             // 'productDetails.status': 'AddedToCart'
//         })
//             .populate('productDetails.productId')
//             .exec();

//         if (!productList || productList.length === 0) {
//             return res.status(404).json({
//                 status: false,
//                 message: 'Cart list not found'
//             });
//         };

//         const getProductDetails = productList.flatMap(cart =>
//             cart.productDetails.filter(product => product.status === 'AddedToCart')
//         );

//         const totalDocuments = getProductDetails.length;
//         const paginatedProductDetails = getProductDetails.slice((page - 1) * limit, page * limit);

//         return res.status(200).json({
//             status: true,
//             message: 'all added products to the cart fetched successfully',
//             totalDocuments: totalDocuments,
//             data: paginatedProductDetails
//         })
//     } catch (error) {
//         return res.status(500).json({
//             status: false,
//             message: error.message
//         })
//     }
// };




// updated 3 times
// get all cart products
// const getAllCartProducts = async (req, res) => {
//     try {
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;

//         const cart = await cartModel.findOne({
//             userId: req.user._id,
//             'productDetails.status': 'AddedToCart'
//         })
//             .populate('productDetails.productId')
//             .exec();

//         if (!cart || cart.productDetails.length === 0) {
//             return res.status(404).json({
//                 status: false,
//                 message: 'Cart list not found'
//             });
//         }

//         const getProductDetails = cart.productDetails.filter(product => product.status === 'AddedToCart');
//         console.log(getProductDetails);

//         const totalDocuments = getProductDetails.length;
//         const paginatedProductDetails = getProductDetails.slice((page - 1) * limit, page * limit);

//         return res.status(200).json({
//             status: true,
//             message: 'All added products to the cart fetched successfully',
//             totalDocuments: totalDocuments,
//             data: paginatedProductDetails
//         });
//     } catch (error) {
//         return res.status(500).json({
//             status: false,
//             message: error.message
//         });
//     }
// };






// get all cart products
const getAllCartProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const cart = await cartModel.findOne({ userId: req.user._id })
            .populate('userId')
            .populate('productDetails.productId')
            .exec();

        if (!cart || cart.productDetails.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Cart list not found'
            });
        };

        const productDetails = cart.productDetails.filter(product => product.status === 'AddedToCart');

        const enrichedProductDetails = productDetails.map(detail => {
            const product = detail.productId;
            const addQuantityObj = product.addQuantity.id(detail.addQuantityId);

            return {
                ...detail._doc,
                productId: {
                    _id: product._id,
                    farmerId: product.farmerId,
                    categoryId: product.categoryId,
                    category: product.category,
                    productName: product.productName,
                    description: product.description,
                    images: product.images,
                    addQuantity: addQuantityObj,
                    status: product.status
                }
            };
        });

        // Get user details to extract the delivery address
        const user = cart.userId;
        let deliveryAddress = user.deliveryAddress.find(addr => addr.isPrimaryAddress);

        if (!deliveryAddress && user.deliveryAddress.length > 0) {
            deliveryAddress = user.deliveryAddress[0];
        };

        if (!deliveryAddress) {
            return res.status(404).json({
                status: false,
                message: 'User delivery address not found'
            });
        };

        const totalDocuments = enrichedProductDetails.length;
        const paginatedProductDetails = enrichedProductDetails.slice((page - 1) * limit, page * limit);

        // const subtotal = enrichedProductDetails.reduce((acc, detail) => acc + detail.totalPrice, 0);

        return res.status(200).json({
            status: true,
            message: 'All added products to the cart fetched successfully',
            totalDocuments: totalDocuments,
            data: paginatedProductDetails,
            deliveryAddress: deliveryAddress,
            // subtotal: subtotal,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};







// get all palced orders list
const getAllPlacedOrdersList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get all placed orders for the user
        const productList = await cartModel.find({ userId: req.user._id })
            .populate('productDetails.productId')
            .exec();

        // Flatten the product details and filter by 'PlacedOrder' status
        const orderList = productList.flatMap(cart =>
            cart.productDetails.filter(detail => detail.status === 'PlacedOrder')
        );

        // Calculate total documents
        const totalDocuments = orderList.length;

        // Paginate the order list
        const paginatedOrderList = orderList.slice(skip, skip + limit);

        // Format date and time
        const getDate = paginatedOrderList.map(data => {
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
            message: 'All placed order products in the cart fetched successfully',
            totalDocuments: totalDocuments,
            data: getDate,
            // currentPage: page,
            // totalPages: Math.ceil(totalDocuments / limit)
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};






// // getAllPlacedOrdersList
// const getAllPlacedOrdersList = async (req, res) => {
//     try {
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;

//         const productList = await cartModel.find({ userId: req.user._id })
//             .populate('productDetails.productId')
//             .exec();

//         const orderList = productList.flatMap(cart =>
//             cart.productDetails.filter(detail => detail.status === 'PlacedOrder')
//         );
//         // console.log('orderList---->', orderList);

//         const getDate = orderList.map(data => {
//             const date = new Date(data.time * 1000);
//             const year = date.getFullYear();
//             const month = date.getMonth() + 1;
//             const day = date.getDate();

//             const formattedDate = `${day < 10 ? '0' : ''}${day}-${month < 10 ? '0' : ''}${month}-${year}`;
//             const formattedTime = moment(date).format('hh:mm A');

//             return {
//                 ...data.toObject(),
//                 addProductToCartDate: formattedDate,
//                 addProductToCartTime: formattedTime,
//             };
//         });

//         return res.status(200).json({
//             status: true,
//             message: 'all placed order product in the cart fetched successfully',
//             data: getDate
//         })



//         // const totalDocuments = orderList.length;
//         // const paginatedOrderList = orderList.slice((page - 1) * limit, page * limit);

//         // const getDate = paginatedOrderList.map(data => {
//         //     const date = new Date(data.time * 1000);
//         //     const year = date.getFullYear();
//         //     const month = date.getMonth() + 1;
//         //     const day = date.getDate();

//         //     const formattedDate = `${day < 10 ? '0' : ''}${day}-${month < 10 ? '0' : ''}${month}-${year}`;
//         //     const formattedTime = moment(date).format('hh:mm A');

//         //     return {
//         //         ...data.toObject(),
//         //         addProductToCartDate: formattedDate,
//         //         addProductToCartTime: formattedTime,
//         //     };
//         // });

//         // return res.status(200).json({
//         //     status: true,
//         //     message: 'All placed order products in the cart fetched successfully',
//         //     totalDocuments: totalDocuments,
//         //     data: getDate
//         // });



//     } catch (error) {
//         return res.status(500).json({
//             status: false,
//             message: error.message
//         })
//     }
// };


// updateCartProduct
// const updateCartProduct = async (req, res) => {
//     try {
//         const { quantity } = req.body;
//         const { productDetailsId } = req.params;
//         const user = req.user;

//         if (!quantity || quantity <= 0) {
//             return res.status(400).json({
//                 status: false,
//                 message: 'Please provide a valid quantity greater than zero'
//             });
//         };

//         const cartData = await cartModel.findOne({ userId: user._id });
//         if (!cartData) {
//             return res.status(404).json({
//                 status: false,
//                 message: 'Cart not found'
//             });
//         }

//         const productDetail = cartData.productDetails.find(detail => detail._id.toString() === productDetailsId);
//         if (!productDetail) {
//             return res.status(404).json({
//                 status: false,
//                 message: 'Product not found in the cart'
//             });
//         }

//         if (productDetail.status !== 'AddedToCart') {
//             return res.status(400).json({
//                 status: false,
//                 message: 'Only products with status "AddedToCart" can be updated'
//             });
//         }

//         const product = await productModel.findById(productDetail.productId);
//         if (!product) {
//             return res.status(404).json({
//                 status: false,
//                 message: 'Product not found'
//             });
//         }

//         if (product.quantity < quantity) {
//             return res.status(400).json({
//                 status: false,
//                 message: `Available product quantity is ${product.quantity}`
//             });
//         }

//         productDetail.quantity = quantity;
//         productDetail.totalPrice = quantity * product.offerPrice;

//         await cartData.save();


//         return res.status(200).json({
//             status: true,
//             message: 'product quantity updated successfully',
//             data: cartData
//         });
//     } catch (error) {
//         return res.status(500).json({
//             status: false,
//             message: error.message
//         })
//     }
// };











// updateCartProduct
const updateCartProduct = async (req, res) => {
    try {
        const { quantity } = req.body;
        const { productDetailsId } = req.params;
        const user = req.user;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                status: false,
                message: 'Please provide a valid quantity greater than zero'
            });
        }

        const cartData = await cartModel.findOne({ userId: user._id });
        if (!cartData) {
            return res.status(404).json({
                status: false,
                message: 'Cart not found'
            });
        };

        const productDetail = cartData.productDetails.find(detail => detail._id.toString() === productDetailsId);
        if (!productDetail) {
            return res.status(404).json({
                status: false,
                message: 'Product not found in the cart'
            });
        };

        if (productDetail.status !== 'AddedToCart') {
            return res.status(400).json({
                status: false,
                message: 'Only products with status "AddedToCart" can be updated'
            });
        };

        const product = await productModel.findById(productDetail.productId);
        if (!product) {
            return res.status(404).json({
                status: false,
                message: 'Product not found'
            });
        };

        const addQuantityObj = product.addQuantity.id(productDetail.addQuantityId);
        if (!addQuantityObj) {
            return res.status(404).json({
                status: false,
                message: `AddQuantity object not found by this Id ${productDetail.addQuantityId}`
            });
        };

        if (addQuantityObj.quantity < quantity) {
            return res.status(400).json({
                status: false,
                message: `Available product quantity is ${addQuantityObj.quantity}`
            });
        };

        productDetail.quantity = quantity;
        productDetail.totalPrice = quantity * addQuantityObj.offerPrice;

        await cartData.save();

        return res.status(200).json({
            status: true,
            message: 'Product quantity and price updated successfully',
            data: cartData
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};



























// removeProductFromCart
// const removeProductFromCart = async (req, res) => {
//     try {
//         const { productDetailsId } = req.params;
//         // console.log( id );
//         const cartProduct = await cartModel.findOne({ userId: req.user._id });
//         if (!cartProduct) {
//             return res.status(404).json({
//                 status: false,
//                 message: 'cart product not found'
//             })
//         };

//         const product = await productModel.findOne({ _id: cartProduct.productId, isAvailable: true });
//         if (!product) {
//             return res.status(404).json({
//                 status: false,
//                 message: "product not found!",
//             })
//         };

//         if (quantity > cartProduct.quantity) {
//             return res.status(400).json({
//                 status: false,
//                 message: `can't remove more than ${cartProduct.quantity} quantity`,
//             })
//         };

//         cartProduct.quantity = quantity ? quantity : cartProduct.quantity;
//         await cartProduct.save();


//         // console.log( 1111111, cartProduct );
//         // console.table( cartProduct );
//         return res.status(200).json({
//             status: true,
//             message: 'all products in the cart fetched successfully',
//             data: cartProduct
//         })
//     } catch (error) {
//         return res.status(500).json({
//             status: false,
//             message: error.message
//         })
//     }
// };










const removeProductFromCart = async (req, res) => {
    try {
        const user = req.user;
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({
                status: false,
                message: "Please provide productId"
            });
        };

        const cart = await cartModel.findOne({ userId: user._id });
        if (!cart) {
            return res.status(404).json({
                status: false,
                message: 'Cart not found'
            });
        };

        const productIndex = cart.productDetails.findIndex(detail => detail._id.toString() === productId);

        if (productIndex === -1) {
            return res.status(404).json({
                status: false,
                message: `Product with id ${productId} not found in the cart`
            });
        };

        cart.productDetails.splice(productIndex, 1);

        await cart.save();

        return res.status(200).json({
            status: true,
            message: 'Product successfully removed from cart',
            data: cart
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};








// 05/06/2024
// buy product
const buyProduct = async (req, res) => {
    try {
        const user = req.user;

        const cartData = await cartModel.findOne({ userId: user._id });
        if (!cartData) {
            return res.status(404).json({
                status: false,
                message: 'Cart not found'
            });
        };

        // Filter products with status "AddedToCart"
        const productsToBuy = cartData.productDetails.filter(productDetail =>
            productDetail.status === 'AddedToCart'
        );
        // console.log('productsToBuy ---->', productsToBuy);

        if (productsToBuy.length === 0) {
            return res.status(400).json({
                status: false,
                message: 'No products with status "AddedToCart" in the cart'
            });
        };

        for (let productDetail of productsToBuy) {

            const product = await productModel.findOne({ _id: productDetail.productId.toString() });
            // console.log('product  ----->', product);
            // console.log('productDetail  ----->', productDetail);

            if (!product) {
                return res.status(404).json({
                    status: false,
                    message: `Product with id ${productDetail.productId} not found`
                });
            };

            // Find the addQuantity object
            const addQuantityObj = product.addQuantity.find(element => element._id.toString() === productDetail.addQuantityId.toString());
            // console.log('addQuantityObj  ----->', addQuantityObj);

            if (!addQuantityObj) {
                return res.status(404).json({
                    status: false,
                    message: `AddQuantity object not found by this Id ${productDetail.addQuantityId}`
                });
            };

            if (addQuantityObj.quantity < productDetail.quantity) {
                return res.status(400).json({
                    status: false,
                    message: `Insufficient quantity for product with id ${productDetail.productId}, available quantity is ${addQuantityObj.quantity}`
                });
            };

            // Deduct quantity from the specific addQuantity entry
            addQuantityObj.quantity -= productDetail.quantity;
            if (addQuantityObj.quantity === 0) {
                addQuantityObj.status = constants.PRODUCT_STATUS.SOLD;
            };

            // Update product in the database
            await product.save();

            // Create a new order in the farmerOrderModel
            const farmerOrder = new farmerOrderModel({
                userId: user._id,
                productId: productDetail.productId,
                addQuantityId: productDetail.addQuantityId,
                farmerId: productDetail.farmerId,
                status: 'New',
                quantity: productDetail.quantity,
                totalPrice: productDetail.totalPrice,
                time: moment().unix()
            });

            await farmerOrder.save();
            // console.log('farmerOrder---->', farmerOrder);

            // Generate QR code for the specific product
            const qrCodeData = await QRCode.toDataURL(productDetail.productId.toString());


            // const amount = 100;
            // const percentage = 12;
            // const totalAmount = amount + (amount * (percentage / 100));


            // Update productDetail in cart
            productDetail.time = moment().unix();
            productDetail.status = 'PlacedOrder';
            productDetail.QRCode = qrCodeData;
        };

        // Save updated cart data
        await cartData.save();

        return res.status(200).json({
            status: true,
            message: 'Products bought successfully',
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



