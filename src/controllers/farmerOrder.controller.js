const farmerOrderModel = require('../models/farmerOrder.model');
const productModel = require('../models/product.model');
const userModel = require('../models/user.model');
const moment = require('moment');



// farmer all order list
exports.farmerAllOrderList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const farmerOrder = await farmerOrderModel.find(
            { farmerId: req.user._id, isAvailable: true }
        )
            .populate('userId')
            .populate('productId')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        if (!farmerOrder) {
            return res.status(404).json({
                status: false,
                message: "not found!",
            })
        };

        const orderDetails = [];

        for (const order of farmerOrder) {
            // console.log(order);
            const product = await productModel.findById(order.productId).populate('addQuantity').exec();

            if (!product) {
                continue; // Skip this order if the product is not found
            }

            const addQuantityObj = product.addQuantity.id(order.addQuantityId);
            const user = await userModel.findById(order.userId._id);
            const deliveryAddress = user.deliveryAddress.id(order.deliveryAddressId.toString());

            orderDetails.push({
                _id: order._id,
                userId: user,
                productId: product,
                deliveryAddress: deliveryAddress,
                addQuantityDetails: addQuantityObj ? {
                    addQuantityId: addQuantityObj._id,
                    price: addQuantityObj.offerPrice,
                    availableQuantity: addQuantityObj.quantity,
                } : 'AddQuantity data not found',
                status: order.status,
                quantity: order.quantity,
                totalPrice: order.totalPrice,
                QRCode: order.QRCode,
                time: moment.unix(order.time).format('YYYY-MM-DD HH:mm:ss')
                // userId: order.userId._id,
                // userName: order.userId.name,
                // productName: product.productName,
            });
        };

        const totalDocuments = await farmerOrderModel.countDocuments({ farmerId: req.user._id, isAvailable: true });

        return res.status(200).json({
            status: true,
            message: 'successfully fetched',
            totalDocuments: totalDocuments,
            data: orderDetails,
            // deliveryAddress: deliveryAddress
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};


// orderTime: moment.unix(order.time).format('YYYY-MM-DD HH:mm:ss');








// // give rating to the user
// exports.giveratingTotheUser = async (req, res) => {
//     try {
//         const user = req.user;
//         const { userId, rating } = req.body;

//         if (!userId) {
//             return res.status(400).json({
//                 status: false,
//                 message: "Please provide userId"
//             });
//         };

//         if (rating < 1 || rating > 5) {
//             return res.status(400).json({
//                 status: false,
//                 message: "Rating must be between 1 and 5"
//             });
//         };

//         const farmerOrder = await farmerOrderModel.findOne({ userId: user._id });
//         if (!cart) {
//             return res.status(404).json({
//                 status: false,
//                 message: 'Cart not found'
//             });
//         };

//         const productIndex = cart.productDetails.findIndex(detail => detail._id.toString() === userId);

//         if (productIndex === -1) {
//             return res.status(404).json({
//                 status: false,
//                 message: `Product with id ${userId} not found in the cart`
//             });
//         };

//         const productDetail = cart.productDetails[productIndex];
//         const farmerId = productDetail.farmerId;

//         const farmer = await farmerModel.findById(farmerId);
//         if (!farmer) {
//             return res.status(404).json({
//                 status: false,
//                 message: 'Farmer not found'
//             });
//         };

//         // Check if the user has already rated this farmer
//         const userHasRated = farmer.ratings.some(r => r.userId.toString() === user._id.toString());
//         if (userHasRated) {
//             return res.status(400).json({
//                 status: false,
//                 message: 'You have already rated this farmer',
//                 farmerRating: farmer.averageRating,
//             });
//         };

//         // Add the new rating
//         const newRating = { userId: user._id, rating: rating };
//         farmer.ratings.push(newRating);

//         // Update the average rating
//         const totalRatings = farmer.ratings.length;
//         const ratingSum = farmer.ratings.reduce((acc, curr) => acc + curr.rating, 0);
//         farmer.averageRating = ratingSum / totalRatings;

//         // Save the updated farmer
//         await farmer.save();

//         return res.status(200).json({
//             status: true,
//             message: 'Rating added successfully',
//             data: farmer
//         });
//     } catch (error) {
//         return res.status(500).json({
//             status: false,
//             message: error.message
//         });
//     }
// };




