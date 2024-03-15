const mongoose = require( "mongoose" );

const cartModel = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product'
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
        // status: {
        //     type: String,
        //     enum: [ 'Pending', 'Completed' ],
        //     default: null,
        // },
        isAvailable: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);



module.exports = mongoose.model( "cart", cartModel );
