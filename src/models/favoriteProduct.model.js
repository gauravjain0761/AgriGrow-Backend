const mongoose = require( "mongoose" );
const constants = require( "../../config/constants.json" );

const favoriteProductModel = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product'
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        isFavorite: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);



module.exports = mongoose.model( "favoriteProduct", favoriteProductModel );
