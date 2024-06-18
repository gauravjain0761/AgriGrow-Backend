const mongoose = require("mongoose");
const constants = require("../../config/constants.json");

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
        deliveryAddress: {
            type: [{
                name: {
                    type: String,
                    required: true,
                },
                mobile: {
                    type: String,
                    default: null,
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
                lat: {
                    type: String,
                    default: null,
                },
                long: {
                    type: String,
                    default: null,
                },
                isPrimaryAddress: {
                    type: Boolean,
                    default: false,
                },
            }],
            default: []
        },
        // state: {
        //     type: String,
        //     default: null,
        // },
        // city: {
        //     type: String,
        //     default: null,
        // },
        // postalCode: {
        //     type: String,
        //     default: null,
        // },
        // streetAddress: {
        //     type: String,
        //     default: null,
        // },
        role: {
            type: String,
            // enum: [ constants.ROLE.USER, constants.ROLE.FARMER ],
            default: constants.ROLE.USER,
        },
        isCollectionCenter: {
            type: Boolean,
            default: false,
        },
        ratings: {
            type: [{
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'user',
                    required: true,
                },
                rating: {
                    type: Number,
                    required: true,
                    min: 1,
                    max: 5,
                },
            }],
            default: []
        },
        averageRating: {
            type: Number,
            default: 0,
        },
        deviceToken: {
            type: String,
            default: null,
        },
        isVerified: {
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



module.exports = mongoose.model("user", userModel);
