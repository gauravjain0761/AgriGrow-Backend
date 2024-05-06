const mongoose = require("mongoose");

const collectionCenterModel = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        collectionCenterName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            unique: true,
            // required: true,
        },
        // password: {
        //     type: String,
        //     // required: true,
        //     default: null,
        // },
        mobile: {
            type: String,
            unique: true,
            default: null,
        },
        govermentId: {
            type: String,
            default: null,
        },
        licenseNumber: {
            type: String,
            default: null,
        },
        aadhaarCardNumber: {
            type: String,
            default: null,
        },
        collectionCenterAddress: {
            type: String,
            default: null,
        },
        operationTime: {
            type: String,
            default: null,
        },
        aadhaarCardFront: {
            type: String,
            default: null,
        },
        aadhaarCardBack: {
            type: String,
            default: null,
        },
        licenseImage: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);



module.exports = mongoose.model("collectionCenter", collectionCenterModel);
