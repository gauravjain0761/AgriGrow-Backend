const mongoose = require( "mongoose" );

const farmerModel = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            unique: true,
            default: null,
        },
        password: {
            type: String,
            default: null,
        },
        mobile: {
            type: String,
            unique: true,
            default: null,
        },
        image: {
            type: String,
            default: null,
        },
        Aadhaar_Card_Number: {
            type: String,
            default: null,
            // unique: true,
        },
        PAN_Card_Number: {
            type: String,
            default: null,
            // unique: true,
        },
        state: {
            type: String,
            default: null,
        },
        city: {
            type: String,
            default: null,
        },
        postalCode: {
            type: String,
            default: null,
        },
        streetAddress: {
            type: String,
            default: null,
        },
        farmLocation: {
            type: String,
            default: null,
        },
        deviceToken: {
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



module.exports = mongoose.model( "farmer", farmerModel );
