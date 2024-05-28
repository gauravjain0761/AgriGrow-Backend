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
                enum: ['AddedToCart', 'PlacedOrder', 'Failed', 'Received'],
                default: 'AddedToCart',
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
