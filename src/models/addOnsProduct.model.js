const mongoose = require( "mongoose" );

const addOnsProductModel = new mongoose.Schema(
    {
        farmerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'farmer'
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product'
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
        image: {
            type: String,
            // required: true,
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



module.exports = mongoose.model( "addOnsProduct", addOnsProductModel );





