const mongoose = require("mongoose");
const constants = require("../../config/constants.json");

const orderModel = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product'
        },
        driverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'driver'
        },
        // orderId: {
        //     type: String,
        //     default: null,
        // },
        status: {
            type: String,
            enum: [constants.ORDER_STATUS.NEW, constants.ORDER_STATUS.SUCCESS, constants.ORDER_STATUS.IN_PROGRESS, constants.ORDER_STATUS.FAILED],
            default: constants.ORDER_STATUS.NEW,
        },
        time: {
            type: String,
            default: null,
        },
        receiverImage: {
            type: String,
            default: null,
        },
        receiverName: {
            type: String,
            default: null,
        },
        reason: {
            type: String,
            default: null,
        },
        assignToDriver: {
            type: Boolean,
            default: false,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);



module.exports = mongoose.model("order", orderModel);



