const mongoose = require( "mongoose" );

const productModel = new mongoose.Schema(
    {
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
        price: {
            type: Number,
            required: true,
            default: 0,
        },
        discount: {
            type: Number,
            default: 0,
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
