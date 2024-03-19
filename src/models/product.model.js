const mongoose = require( "mongoose" );
const constants = require( "../../config/constants.json" );

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
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
            default: null,
        },
        totalQuantity: {
            type: Number,
            required: true,
            default: 0,
        },
        availableQuantity: {
            type: Number,
            // required: true,
            default: 0,
        },
        price: {
            type: Number,
            required: true,
            default: 0,
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0,
        },
        discount: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: [ constants.STATUS.AVAILABLE, constants.STATUS.SOLD ],
            default: constants.STATUS.AVAILABLE,
        },
        // verified: {
        //     type: Boolean,
        //     default: constants.STATUS.INACTIVE,
        //     enum: [constants.STATUS.INACTIVE, constants.STATUS.ACTIVE],
        //   },
        bestDealOfferProduct: {
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



module.exports = mongoose.model( "product", productModel );
