const farmerOrderModel = require('../models/farmerOrder.model');
const moment = require('moment');



// farmer all order list
exports.farmerAllOrderList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const farmerOrder = await farmerOrderModel.find(
            { farmerId: req.user._id, isAvailable: true }
        )
            .populate('userId')
            .populate('productId')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();


        if (!farmerOrder) {
            return res.status(404).json({
                status: false,
                message: "not found!",
            })
        };

        const totalDocuments = await farmerOrderModel.countDocuments({ farmerId: req.user._id, isAvailable: true });

        return res.status(200).json({
            status: true,
            message: 'successfully fetched',
            // totalDocuments: totalDocuments,
            // data: farmerOrder
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

