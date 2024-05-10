const mongoose = require("mongoose");

const vehicleModel = new mongoose.Schema(
    {
        // farmerId: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'farmer'
        // },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        vehicleName: {
            type: String,
            required: true,
            // unique: true
        },
        vehicleType: {
            type: String,
            required: true,
        },
        make: {
            type: String,
            required: true,
        },
        model: {
            type: String,
            required: true,
        },
        year: {
            type: String,
            required: true,
        },
        VIN_Number: {
            type: String,
            required: true,
            // unique: true
        },
        RC_BookImage: {
            type: String,
            // required: true,
        },
        vehicleImage: {
            type: String,
            // required: true,
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


module.exports = mongoose.model("vehicle", vehicleModel);

