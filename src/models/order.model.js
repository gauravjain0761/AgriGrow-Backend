const mongoose = require("mongoose");
const constants = require("../../config/constants.json");

const orderModel = new mongoose.Schema(
    {
        collectionCenterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'collectionCenter',
            default: null,
        },
        farmerOrderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'farmerOrder',
            unique: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            default: null,
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
            default: null,
        },
        addQuantityId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },
        deliveryAddressId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },
        farmerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'farmer',
            default: null,
        },
        quantity: {
            type: Number,
            default: null,
        },
        totalPrice: {
            type: Number,
            default: null,
        },
        driverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'driver',
            default: null,
        },
        // -------------------------------------------------------------------








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

