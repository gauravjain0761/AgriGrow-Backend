const mongoose = require( "mongoose" );

const feedbackModel = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product'
        },
        rating: {
            type: Number,
            default: null,
        },
        feedback: {
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




module.exports = mongoose.model( "feedback", feedbackModel );
