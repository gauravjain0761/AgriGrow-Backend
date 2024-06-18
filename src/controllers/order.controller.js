const orderModel = require('../models/order.model');
const moment = require('moment');
const constants = require("../../config/constants.json");
const driverModel = require('../models/driver.model');
const productModel = require('../models/product.model');
const farmerOrderModel = require('../models/farmerOrder.model');
const userModel = require('../models/user.model');




// add Order
exports.addOrder = async (req, res) => {
    try {
        const user = req.user;
        const { farmerOrderId } = req.body;

        const farmerOrder = await farmerOrderModel.findOne({ _id: farmerOrderId });

        if (!farmerOrder) {
            return res.status(404).json({
                status: false,
                message: "farmer order product not found!",
            })
        };

        const existOrderData = await orderModel.findOne({ farmerOrderId: farmerOrderId });

        if (existOrderData) {
            return res.status(409).json({
                status: false,
                message: "Order data already exist!",
            })
        };

        const order = new orderModel({
            collectionCenterId: user._id,
            farmerOrderId: farmerOrder._id,
            userId: farmerOrder.userId,
            productId: farmerOrder.productId,
            addQuantityId: farmerOrder.addQuantityId,
            deliveryAddressId: farmerOrder.deliveryAddressId,
            farmerId: farmerOrder.farmerId,
            quantity: farmerOrder.quantity,
            totalPrice: farmerOrder.totalPrice,
            time: moment().unix(),
        });

        await order.save();

        farmerOrder.status = 'DISPATCHED';
        await farmerOrder.save();

        return res.status(201).send({
            status: true,
            message: 'successfully added',
            data: order
        });
    } catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message,
        });
    }
};



// all order list
exports.allOrderList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const ordersList = await orderModel.find(
            {
                collectionCenterId: req.user._id,
                assignToDriver: true,
                // status: { $ne: constants.ORDER_STATUS.NEW },
                isAvailable: true
            }
        )
            .populate('userId')
            .populate('productId')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        if (!ordersList) {
            return res.status(404).json({
                status: false,
                message: "not found!",
            })
        };




        const orderDetails = [];

        for (const order of ordersList) {
            const product = await productModel.findById(order.productId).populate('addQuantity').exec();

            if (!product) {
                continue; // Skip this order if the product is not found
            }

            const addQuantityObj = product.addQuantity.id(order.addQuantityId);
            const user = await userModel.findById(order.userId._id);
            const deliveryAddress = user.deliveryAddress.id(order.deliveryAddressId.toString());

            orderDetails.push({
                _id: order._id,
                collectionCenterId: req.user._id,
                farmerOrderId: product.farmerId,
                userId: user,
                productId: product,
                deliveryAddress: deliveryAddress,
                // addQuantityDetails: addQuantityObj ? {
                //     addQuantityId: addQuantityObj._id,
                //     price: addQuantityObj.offerPrice,
                //     availableQuantity: addQuantityObj.quantity,
                // } : 'AddQuantity data not found',
                status: order.status,
                quantity: order.quantity,
                totalPrice: order.totalPrice,
                time: moment.unix(order.time).format('YYYY-MM-DD HH:mm:ss'),
                driverId: order.driverId,
                receiverImage: order.receiverImage,
                receiverName: order.receiverName,
                reason: order.reason,
                assignToDriver: order.assignToDriver,
                isAvailable: order.isAvailable
            });
        };


        const totalDocuments = await orderModel.countDocuments({
            collectionCenterId: req.user._id,
            // assignToDriver: false,
            status: { $ne: constants.ORDER_STATUS.NEW },
            isAvailable: true
        });

        return res.status(200).json({
            status: true,
            message: 'successfully fetched',
            totalDocuments: totalDocuments,
            data: orderDetails,
            // data: orders       
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};


// status new order list
exports.statusNewOrderList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const ordersList = await orderModel.find({
            collectionCenterId: req.user._id,
            status: constants.ORDER_STATUS.NEW,
            assignToDriver: false,
            isAvailable: true
        })
            .populate('userId')
            .populate('productId')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        if (!ordersList) {
            return res.status(404).json({
                status: false,
                message: "not found!",
            })
        };

        const orderDetails = [];

        for (const order of ordersList) {
            const product = await productModel.findById(order.productId).populate('addQuantity').exec();

            if (!product) {
                continue; // Skip this order if the product is not found
            }

            const addQuantityObj = product.addQuantity.id(order.addQuantityId);
            const user = await userModel.findById(order.userId._id);
            const deliveryAddress = user.deliveryAddress.id(order.deliveryAddressId.toString());

            orderDetails.push({
                _id: order._id,
                collectionCenterId: req.user._id,
                farmerOrderId: product.farmerId,
                userId: user,
                productId: product,
                deliveryAddress: deliveryAddress,
                // addQuantityDetails: addQuantityObj ? {
                //     addQuantityId: addQuantityObj._id,
                //     price: addQuantityObj.offerPrice,
                //     availableQuantity: addQuantityObj.quantity,
                // } : 'AddQuantity data not found',
                status: order.status,
                quantity: order.quantity,
                totalPrice: order.totalPrice,
                time: moment.unix(order.time).format('YYYY-MM-DD HH:mm:ss'),
                driverId: order.driverId,
                receiverImage: order.receiverImage,
                receiverName: order.receiverName,
                reason: order.reason,
                assignToDriver: order.assignToDriver,
                isAvailable: order.isAvailable
            });
        };

        const totalDocuments = await orderModel.countDocuments({
            collectionCenterId: req.user._id,
            status: constants.ORDER_STATUS.NEW,
            isAvailable: true
        });

        return res.status(200).json({
            status: true,
            message: 'successfully fetched',
            totalDocuments: totalDocuments,
            data: orderDetails,
            // data: orders
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};


// assign job to driver
exports.assignJobToDriver = async (req, res) => {
    try {
        const { productIds, driverId } = req.body;

        const orders = await orderModel.find({
            _id: { $in: productIds },
            collectionCenterId: req.user._id,
            assignToDriver: false
        });
        console.log('orders ------> ', orders);

        if (orders.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'No orders found for the given product IDs or all orders are already assigned to a driver.',
            });
        };

        // Separate found orders from not found ones
        const foundOrders = orders.filter(order => order._id);
        // console.log(foundOrders);

        // const notFoundProductIds = productIds.filter(productId => !orders.some(order => order.productId === productId));
        // console.log('notFoundProductIds',notFoundProductIds)

        // // Handle not found product IDs
        // if (notFoundProductIds.length > 0) {
        //     return res.status(404).json({
        //         status: false,
        //         message: `Orders not found for the following product IDs: ${notFoundProductIds.join(', ')}`,
        //     });
        // };

        const driver = await driverModel.findOne({ _id: driverId });
        if (!driver) {
            return res.status(404).json({
                status: false,
                message: `driver not found!`,
            });
        };

        // Update found orders with the assigned driver ID
        const updatedOrders = await Promise.all(foundOrders.map(async (order) => {
            order.driverId = driverId;
            // order.status = 'AssignToDriver';
            order.assignToDriver = true;
            order.time = moment().unix();
            // return order.save();
            await order.save();
            return order;
        }));

        return res.status(200).json({
            status: true,
            message: 'Assign jobs successfully',
            data: updatedOrders
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};


// search order by order Id
exports.searchOrderByOrderId = async (req, res) => {
    try {
        const { orderId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const user = req.user;
        console.log(user);
        const order = await orderModel.find({ _id: orderId, collectionCenterId: user._id, /* assignToDriver: false */ })
            .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec();

        if (!order) {
            return res.status(404).json({
                status: false,
                message: 'not found!'
            })
        };

        return res.status(200).json({
            status: true,
            message: 'searched successfully',
            data: order
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};



// filter order
exports.filterOrder = async (req, res) => {
    try {
        const { months, status } = req.body;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const user = req.user;

        const orders = await orderModel.find({ collectionCenterId: user._id })
            .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec();

        if (!orders || orders.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Orders not found for the user!'
            });
        };

        const statusData = orders.filter(element => element.status === status.toUpperCase());
        const timeData = orders.filter(element => {
            // element.time == months
            const getMonth = moment.unix(element.time).format("YYYY-MM");
            if (getMonth == months) {
                return res.status(200).json({
                    status: true,
                    message: 'fetched successfully',
                    data: orders,
                    // statusData: statusData,
                    timeData: timeData
                });
            }
        });

        return res.status(200).json({
            status: true,
            message: 'fetched successfully',
            data: orders,
            statusData: statusData,
            timeData: timeData
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};



// const a2 = moment().unix();
// const a = '1715580616';
// const readableDate = moment.unix(a).format("YYYY-MM-DD HH:mm:ss");
// const readableDate2 = moment.unix(a).format("YYYY-MM");
// console.log(a2);
// console.log(a);
// console.log(readableDate);
// console.log(readableDate2);




