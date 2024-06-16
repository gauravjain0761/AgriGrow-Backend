const mongoose = require("mongoose");

const farmerOrderModel = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product'
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
        },
        quantity: {
            type: Number,
            default: null,
        },
        totalPrice: {
            type: Number,
            default: null,
        },
        QRCode: {
            type: String,
            default: null,
        },
        status: {
            type: String,
            enum: ['New', 'Failed', 'Success', 'Received', 'Dispatched'],
            default: 'New',
        },
        time: {
            type: String,
            default: null,
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



module.exports = mongoose.model("farmerOrder", farmerOrderModel);




