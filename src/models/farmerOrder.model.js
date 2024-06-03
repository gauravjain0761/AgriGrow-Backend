const mongoose = require("mongoose");

const farmerOrderModel = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            default: null
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product'
        },
        farmerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'farmer',
        },
        status: {
            type: String,
            enum: ['New', 'Failed', 'Success'],
            default: 'New',
        },
        quantity: {
            type: Number,
            default: null,
        },
        totalPrice: {
            type: Number,
            default: null,
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

