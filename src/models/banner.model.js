const mongoose = require("mongoose");

const bannerModel = new mongoose.Schema(
    {
        bannerImage: {
            type: String,
            required: true
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


module.exports = mongoose.model("banner", bannerModel);

