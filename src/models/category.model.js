const mongoose = require( "mongoose" );

const categoryModel = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            default: null,
        },
        // image: {
        //     type: String,
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




module.exports = mongoose.model( "category", categoryModel );
