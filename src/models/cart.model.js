const mongoose = require("mongoose");

const cartModel = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        productDetails: [{
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
                ref: 'farmer'
            },
            quantity: {
                type: Number,
                required: true,
                default: 0,
            },
            totalPrice: {
                type: Number,
                required: true,
                default: 0,
            },
            time: {
                type: String,
                default: null,
            },
            status: {
                type: String,
                enum: ['ADDED_TO_CART', 'PLACED_ORDER', 'FAILED', 'SUCCESS'],
                default: 'ADDED_TO_CART',
            },
            QRCode: {
                type: String,
                default: null,
            }
        }],
    },
    {
        timestamps: true,
    }
);



module.exports = mongoose.model("cart", cartModel);



