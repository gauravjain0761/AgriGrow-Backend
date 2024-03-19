const mongoose = require( "mongoose" );
const constants = require( "../../config/constants.json" );

const userModel = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            unique: true,
            // required: true,
        },
        password: {
            type: String,
            // required: true,
            default: null,
        },
        mobile: {
            type: String,
            unique: true,
            default: null,
        },
        // verificationCode: {
        //     type: String,
        //     default: null,
        // },
        image: {
            type: String,
            default: null,
        },
        otp: {
            type: String,
            default: null,
        },
        otpValidTill: {
            type: Date,
            default: null,
        },
        socialLogin: {
            type: Boolean,
            default: false,
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
        role: {
            type: String,
            enum: [ constants.ROLE.USER, constants.ROLE.FARMER ],
            default: constants.ROLE.USER,
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



module.exports = mongoose.model( "user", userModel );
