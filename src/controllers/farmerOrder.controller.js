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

