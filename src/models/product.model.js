const mongoose = require("mongoose");
const constants = require("../../config/constants.json");

const productModel = new mongoose.Schema(
    {
        farmerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'farmer'
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'category'
        },
        category: {
            type: String,
            default: null,
        },
        productName: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        images: [{
            type: String,
            required: true,
            default: null,
        }],
        addQuantity: {
            type: [{
                originalPrice: {
                    type: Number,
                    required: true,
                    default: 0,
                },
                offerPrice: {
                    type: Number,
                    required: true,
                    default: 0,
                },
                quantity: {
                    type: Number,
                    default: 1,
                },
                weight: {
                    type: String,
                    default: 'gram',
                },
            }],
            default: []
        },
        addOns: {
            type: [{
                image: {
                    type: String,
                    default: null,
                },
                name: {
                    type: String,
                    required: true,
                    default: null,
                },
                price: {
                    type: Number,
                    required: true,
                    default: 0,
                },
            }],
            default: []
        },
        status: {
            type: String,
            enum: [constants.PRODUCT_STATUS.AVAILABLE, constants.PRODUCT_STATUS.SOLD],
            default: constants.PRODUCT_STATUS.AVAILABLE,
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



module.exports = mongoose.model("product", productModel);


