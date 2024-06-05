const orderModel = require('../models/order.model');
const moment = require('moment');
const constants = require("../../config/constants.json");
const driverModel = require('../models/driver.model');
const productModel = require('../models/product.model');




// add Order
exports.addOrder = async (req, res) => {
    try {
        const user = req.user;
        const { productId } = req.body;

        const product = await productModel.find({ _id: productId });

        if (product.length === 0) {
            return res.status(404).json({
                status: false,
                message: "product not found!",
            })
        };

        const order = new orderModel({
            userId: user._id,
            productId: productId,
            time: moment().unix(),
        });

        await order.save();
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


// remove new status
// all order list
exports.allOrderList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const order = await orderModel.find(
            {
                userId: req.user._id,
                assignToDriver: false,
                status: { $ne: constants.ORDER_STATUS.NEW },
                isAvailable: true
            }
        )
            // .populate({
            //     path: 'productId',
            //     select: '_id productName description images originalPrice offerPrice',
            // })
            .populate('productId')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        if (!order) {
            return res.status(404).json({
                status: false,
                message: "not found!",
            })
        };

        const totalDocuments = await orderModel.countDocuments({
            userId: req.user._id,
            assignToDriver: false,
            status: { $ne: constants.ORDER_STATUS.NEW },
            isAvailable: true
        });

        return res.status(200).json({
            status: true,
            message: 'successfully fetched',
            totalDocuments: totalDocuments,
            data: order
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

        const order = await orderModel.find(
            { userId: req.user._id, status: constants.ORDER_STATUS.NEW, assignToDriver: false, isAvailable: true }
        )
            // .populate({
            //     path: 'productId',
            //     select: '_id productName description images originalPrice offerPrice',
            // })
            // .exec();
            .populate('productId')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        if (!order) {
            return res.status(404).json({
                status: false,
                message: "not found!",
            })
        };
        const totalDocuments = await orderModel.countDocuments({ userId: req.user._id, status: constants.ORDER_STATUS.NEW, assignToDriver: false, isAvailable: true });

        return res.status(200).json({
            status: true,
            message: 'successfully fetched',
            totalDocuments: totalDocuments,
            data: order
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

        const orders = await orderModel.find({ _id: { $in: productIds }, userId: req.user._id, assignToDriver: false });
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
        const { orderId } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const user = req.user;

        const order = await orderModel.find({ _id: orderId, userId: user._id, assignToDriver: false })
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

        const orders = await orderModel.find({ userId: user._id })
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




