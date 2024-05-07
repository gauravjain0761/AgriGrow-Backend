const vehicleModel = require('../models/vehicle.model');
const { vehicleImages, deleteUploadedFiles } = require('../../helpers/multer');
const moment = require('moment');
const path = require('path');
const fs = require('fs');


// add vehicle
exports.addVehicle = async (req, res) => {
    try {
        vehicleImages(req, res, async (err) => {
            try {
                // console.log( 2222, req.files );
                if (err) {
                    console.log('Error during file upload:', err);
                    deleteUploadedFiles(req.files);
                    return res.status(500).send({
                        status: false,
                        message: 'Error during file upload: ' + err.message,
                    });
                };

                const user = req.user;
                // console.log(user);
                const { vehicleName, vehicleType, make, model, year, VIN_Number } = req.body;

                const RC_BookImage = req.files.RC_BookImage ? `/uploads/vehicleImages/${moment().unix()}-${req.files.RC_BookImage[0].originalname}` : null;
                const vehicleImage = req.files.vehicleImage ? `/uploads/vehicleImages/${moment().unix()}-${req.files.vehicleImage[0].originalname}` : null;

                const vehicle = new vehicleModel({
                    farmerId: user._id,
                    vehicleName: vehicleName,
                    vehicleType: vehicleType,
                    make: make,
                    model: model,
                    year: year,
                    VIN_Number: VIN_Number,
                    RC_BookImage: RC_BookImage,
                    vehicleImage: vehicleImage,
                });

                await vehicle.save();
                return res.status(201).send({
                    status: true,
                    message: 'successfully created',
                    data: vehicle
                });
            } catch (error) {
                deleteUploadedFiles(req.files);
                console.log(error);
                return res.status(500).send({
                    status: false,
                    message: error.message,
                });
            }
        });
    } catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message,
        });
    }
};


// all vehicle list
exports.allVehicleList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const vehicle = await vehicleModel.find({ farmerId: req.user._id, isAvailable: true })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        if (!vehicle) {
            return res.status(404).json({
                status: false,
                message: "not found!",
            })
        };
        const totalDocuments = await vehicleModel.countDocuments();

        return res.status(200).json({
            status: true,
            message: 'successfully fetched',
            totalDocuments: totalDocuments,
            data: vehicle
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// get vehicle details
exports.getVehicleDetailsById = async (req, res) => {
    try {
        const vehicleId = req.params.vehicleId;
        const vehicle = await vehicleModel.findOne({ _id: vehicleId, farmerId: req.user._id });

        if (!vehicle) {
            return res.status(404).json({
                status: false,
                message: "not found!",
            })
        };

        return res.status(200).json({
            status: true,
            message: 'successfully fetched',
            data: vehicle
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};


// search vehicle
exports.searchVehicle = async (req, res) => {
    try {
        const { data } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const vehicle = await vehicleModel.find({
            $or: [
                { vehicleName: { $regex: data, $options: 'i' }, },
                { VIN_Number: { $regex: data, $options: 'i' }, },
            ]
        })
            .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec();

        if (!vehicle) {
            return res.status(404).json({
                status: false,
                message: 'not found!'
            })
        };

        return res.status(200).json({
            status: true,
            message: 'searched successfully',
            data: vehicle
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// remove vehicle by Id
exports.removeVehicle = async (req, res) => {
    try {
        const { vehicleId } = req.params;

        const vehicle = await vehicleModel.findOne({ _id: vehicleId });
        if (!vehicle) {
            return res.status(404).json({
                status: false,
                message: "vehicle not found!",
            })
        };

        // if ( vehicle.farmerId.toString() !== user._id.toString() )
        if (!vehicle.farmerId.equals(req.user._id)) {
            return res.status(403).json({
                status: false,
                message: "Only the farmer who created the vehicle has access to delete it.",
            });
        };

        if (vehicle.RC_BookImage) {
            const absolutePath = path.join(__dirname, `../../${vehicle.RC_BookImage}`);
            if (fs.existsSync(absolutePath)) {
                fs.unlinkSync(absolutePath);
            }
        };

        if (vehicle.vehicleImage) {
            const absolutePath = path.join(__dirname, `../../${vehicle.vehicleImage}`);
            if (fs.existsSync(absolutePath)) {
                fs.unlinkSync(absolutePath);
            }
        };

        await vehicleModel.findByIdAndDelete(vehicleId);
        return res.status(200).send({
            status: true,
            message: "vehicle deleted successfully",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};



