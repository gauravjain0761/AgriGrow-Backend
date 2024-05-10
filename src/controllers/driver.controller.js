const driverModel = require('../models/driver.model');

const { driverImages, deleteUploadedFiles } = require('../../helpers/multer');
const fs = require('fs');
const path = require('path');
const moment = require('moment');


// add driver
exports.addDriver = async (req, res) => {
    try {
        driverImages(req, res, async (err) => {
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
                const { name, email, mobile, licenseNumber, aadhaarCardNumber } = req.body;

                const aadhaarCardFront = req.files.aadhaarCardFront ? `/uploads/driverImages/${moment().unix()}-${req.files.aadhaarCardFront[0].originalname}` : null;
                const aadhaarCardBack = req.files.aadhaarCardBack ? `/uploads/driverImages/${moment().unix()}-${req.files.aadhaarCardBack[0].originalname}` : null;
                const licenseImage = req.files.licenseImage ? `/uploads/driverImages/${moment().unix()}-${req.files.licenseImage[0].originalname}` : null;

                const driver = new driverModel({
                    userId: user._id,
                    name: name,
                    email: email,
                    mobile: mobile,
                    licenseNumber: licenseNumber,
                    aadhaarCardNumber: aadhaarCardNumber,
                    aadhaarCardFront: aadhaarCardFront,
                    aadhaarCardBack: aadhaarCardBack,
                    licenseImage: licenseImage
                });

                await driver.save();
                return res.status(201).json({
                    status: true,
                    message: 'register to new collection center successfully',
                    data: driver
                });
            } catch (error) {
                deleteUploadedFiles(req.files);
                console.log(error);
                // if (error.code === 11000 && error.keyPattern && (error.keyPattern.email || error.keyPattern.mobile)) {
                //     const violatedKeys = Object.keys(error.keyPattern);
                //     console.log(violatedKeys);
                //     return res.status(400).json({
                //         status: false,
                //         message: `${violatedKeys} is already registered. Please use a different ${violatedKeys}.`,
                //     });
                // }
                return res.status(500).send({
                    status: false,
                    message: error.message,
                });
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// all driver list
exports.allDriverList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const user = req.user;

        const driver = await driverModel.find({ userId: user._id, isAvailable: true })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        if (!driver) {
            return res.status(404).json({
                status: false,
                message: "not found!",
            })
        };
        const totalDocuments = await driverModel.countDocuments({ userId: user._id, isAvailable: true })

        return res.status(200).json({
            status: true,
            message: 'successfully fetched',
            totalDocuments: totalDocuments,
            data: driver
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};


// get driver details
exports.getDriverDetailsById = async (req, res) => {
    try {
        const driverId = req.params.driverId;
        const user = req.user;

        const driver = await driverModel.findOne({ _id: driverId, userId: user._id });

        if (!driver) {
            return res.status(404).json({
                status: false,
                message: "not found!",
            })
        };

        return res.status(200).json({
            status: true,
            message: 'successfully fetched',
            data: driver
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};


// search driver
exports.searchDriver = async (req, res) => {
    try {
        const { data } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const user = req.user;

        const driver = await driverModel.find({
            $or: [
                { name: { $regex: data, $options: 'i' }, },
                { mobile: { $regex: data, $options: 'i' }, },
            ],
            userId: user._id
        })
            .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec();

        if (!driver) {
            return res.status(404).json({
                status: false,
                message: 'not found!'
            })
        };

        return res.status(200).json({
            status: true,
            message: 'searched successfully',
            data: driver
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// remove driver by Id
exports.removeDriver = async (req, res) => {
    try {
        const { driverId } = req.params;

        const driver = await driverModel.findOne({ _id: driverId, userId: user._id });
        if (!driver) {
            return res.status(404).json({
                status: false,
                message: "driver not found!",
            })
        };

        // Delete images from the filesystem
        const imagePaths = [driver.aadhaarCardFront, driver.aadhaarCardBack, driver.licenseImage];
        for (const imagePath of imagePaths) {
            if (imagePath) {
                const absolutePath = path.join(__dirname, `../../${imagePath}`);
                if (fs.existsSync(absolutePath)) {
                    console.log(absolutePath);
                    await fs.promises.unlink(absolutePath); // Use fs.promises.unlink instead of fs.unlink
                }
            }
        };

        await driverModel.findByIdAndDelete(driverId);
        return res.status(200).send({
            status: true,
            message: "driver deleted successfully",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};
