const mongoose = require("mongoose");

const driverModel = new mongoose.Schema(
    {
        // userId: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'user',
        //     default: null
        // },
        // farmerId: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'farmer',
        //     default: null
        // },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            // unique: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            // unique: true,
        },
        mobile: {
            type: String,
            required: true,
        },
        licenseNumber: {
            type: String,
            default: null,
        },
        aadhaarCardNumber: {
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
        isAvailable: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);


module.exports = mongoose.model("driver", driverModel);






// userOrCustomerId: {
//     type: mongoose.Schema.Types.ObjectId,
//     refPath: 'userOrCustomerModel', // Dynamic reference based on userOrCustomerModel field
//     required: true
// },
// userOrCustomerModel: {
//     type: String,
//     required: true,
//     enum: ['user', 'customer'] // Possible values for the model
// },