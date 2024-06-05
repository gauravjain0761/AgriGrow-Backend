const driverModel = require('../models/driver.model');
const orderModel = require('../models/order.model');
const crypto = require('crypto-js');
const constants = require("../../config/constants.json");

const { driverImages, receiverImage, deleteUploadedFiles } = require('../../helpers/multer');
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
                const { name, email, mobile, password, licenseNumber, aadhaarCardNumber } = req.body;

                const aadhaarCardFront = req.files.aadhaarCardFront ? `/uploads/driverImages/${moment().unix()}-${req.files.aadhaarCardFront[0].originalname}` : null;
                const aadhaarCardBack = req.files.aadhaarCardBack ? `/uploads/driverImages/${moment().unix()}-${req.files.aadhaarCardBack[0].originalname}` : null;
                const licenseImage = req.files.licenseImage ? `/uploads/driverImages/${moment().unix()}-${req.files.licenseImage[0].originalname}` : null;

                const driver = new driverModel({
                    collectionCenterId: user._id,
                    name: name,
                    email: email,
                    mobile: mobile,
                    password: crypto.AES.encrypt(
                        password,
                        process.env.secretKey
                    ).toString(),
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
        // console.log(user);
        const driver = await driverModel.find({ collectionCenterId: user._id })
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
        const totalDocuments = await driverModel.countDocuments({ collectionCenterId: user._id })

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

        const driver = await driverModel.findOne({ _id: driverId, collectionCenterId: user._id });

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


// driver all order list
exports.getDriverAllOrdersList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { driverId } = req.params;
        const user = req.user;
        // console.log(user);
        // console.log(driverId);

        const driver = await driverModel.findOne({ _id: driverId, collectionCenterId: user._id })
        if (!driver) {
            return res.status(404).json({
                status: false,
                message: "Driver not found!",
            })
        };

        const order = await orderModel.find(
            { driverId: driverId, isAvailable: true }
        )
            .populate('productId')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        if (!order) {
            return res.status(404).json({
                status: false,
                message: "Order not found!",
            })
        };


        const getDate = order.map(data => {
            const date = new Date(data.time * 1000);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();

            const formattedDate = `${day < 10 ? '0' : ''}${day}-${month < 10 ? '0' : ''}${month}-${year}`;
            const formattedTime = moment(date).format('hh:mm A');

            return {
                ...data.toObject(),
                formattedDate: formattedDate,
                formattedTime: formattedTime,        //time is match with orderModel time field so here time show in orderModel time field value
            };
        });



        const totalDocuments = await orderModel.countDocuments({ driverId: driverId, isAvailable: true });

        return res.status(200).json({
            status: true,
            message: 'successfully fetched',
            totalDocuments: totalDocuments,
            data: getDate,
            // data: order
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
            collectionCenterId: user._id
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


// update driver status
exports.updateDriverStatus = async (req, res) => {
    try {
        const { driverId } = req.params;
        const { status } = req.body;

        const driver = await driverModel.findOne({ _id: driverId, collectionCenterId: req.user._id });
        if (!driver) {
            return res.status(404).json({
                status: false,
                message: "not found!",
            })
        };

        if (status !== true && status !== false) {
            return res.status(400).json({
                status: false,
                message: `accept only boolean value ${true} or ${false}`,
            })
        };

        driver.isAvailable = status;
        await driver.save();
        return res.status(200).send({
            status: true,
            message: "driver status updated",
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


// update driver data
exports.updateDriverData = async (req, res) => {
    try {
        driverImages(req, res, async (err) => {
            try {
                if (err) {
                    deleteUploadedFiles(req.files);
                    return res.status(500).send({
                        status: false,
                        message: 'Error during file upload: ' + err.message,
                    });
                };

                const { driverId } = req.params;
                const { name, email, mobile, password, licenseNumber, aadhaarCardNumber } = req.body;
                const aadhaarCardFront = req.files.aadhaarCardFront ? `/uploads/driverImages/${moment().unix()}-${req.files.aadhaarCardFront[0].originalname}` : null;
                const aadhaarCardBack = req.files.aadhaarCardBack ? `/uploads/driverImages/${moment().unix()}-${req.files.aadhaarCardBack[0].originalname}` : null;
                const licenseImage = req.files.licenseImage ? `/uploads/driverImages/${moment().unix()}-${req.files.licenseImage[0].originalname}` : null;

                const driver = await driverModel.findOne({ _id: driverId, collectionCenterId: req.user._id });
                if (!driver) {
                    deleteUploadedFiles(req.files);
                    return res.status(404).json({
                        status: false,
                        message: "not found!",
                    })
                };

                if (driver.aadhaarCardFront) {
                    const oldImagePath = path.join(__dirname, '../../', driver.aadhaarCardFront);
                    if (fs.existsSync(oldImagePath)) {
                        console.log(111111, oldImagePath);
                        fs.unlinkSync(oldImagePath);
                    }
                };
                if (driver.aadhaarCardBack) {
                    const oldImagePath = path.join(__dirname, '../../', driver.aadhaarCardBack);
                    if (fs.existsSync(oldImagePath)) {
                        console.log(222222222, oldImagePath);
                        fs.unlinkSync(oldImagePath);
                    }
                };
                if (driver.licenseImage) {
                    const oldImagePath = path.join(__dirname, '../../', driver.licenseImage);
                    if (fs.existsSync(oldImagePath)) {
                        console.log(333333, oldImagePath);
                        fs.unlinkSync(oldImagePath);
                    }
                };

                driver.name = name ? name : driver.name;
                driver.email = email ? email : driver.email;
                driver.mobile = mobile ? mobile : driver.mobile;
                driver.password = password ? mobile : driver.password;
                driver.licenseNumber = licenseNumber ? licenseNumber : driver.licenseNumber;
                driver.aadhaarCardNumber = aadhaarCardNumber ? aadhaarCardNumber : driver.aadhaarCardNumber;
                driver.aadhaarCardFront = aadhaarCardFront ? aadhaarCardFront : driver.aadhaarCardFront;
                driver.aadhaarCardBack = aadhaarCardBack ? aadhaarCardBack : driver.aadhaarCardBack;
                driver.licenseImage = licenseImage ? licenseImage : driver.licenseImage;

                await driver.save();
                return res.status(200).send({
                    status: true,
                    message: "driver data updated",
                    data: driver
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
        const user = req.user;

        const driver = await driverModel.findOne({ _id: driverId, collectionCenterId: user._id });
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



// track driver location
exports.trackDriverLocation = async (req, res) => {
    try {
        const { driverId } = req.params;
        const user = req.user;

        const driver = await driverModel.findOne({ _id: driverId, collectionCenterId: user._id, });
        if (!driver) {
            return res.status(404).json({
                status: false,
                message: "driver not found!",
            })
        };
        if (driver.isAvailable === false) {
            return res.status(404).json({
                status: false,
                message: `${driver.name}, status is inactive from Collection Center.`,
            })
        };

        return res.status(200).send({
            status: true,
            message: "driver location fetched successfully",
            driverData: driver
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};




// --------------------------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------------------------






// driver all order list
exports.driverAllOrderList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        // console.log(req.user);
        const order = await orderModel.find(
            { driverId: req.user._id, isAvailable: true }
        )
            // .populate({
            //     path: 'productId',
            //     select: '_id productName description images originalPrice offerPrice',
            // })
            .populate('productId')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        if (!order) {
            return res.status(404).json({
                status: false,
                message: "order not found!",
            })
        };

        const totalDocuments = await orderModel.countDocuments({ driverId: req.user._id, isAvailable: true });

        return res.status(200).json({
            status: true,
            message: 'successfully fetched driver all orders',
            totalDocuments: totalDocuments,
            data: order
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};



// update order status from New to InProgress
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const user = req.user;

        // Ensure status is being updated to 'INPROGRESS'
        if (status.toUpperCase() === 'IN_PROGRESS') {
            // Check if there is any other order with 'INPROGRESS' status for this driver
            const existingInProgressOrder = await orderModel.findOne({ driverId: user._id, status: 'IN_PROGRESS' });

            if (existingInProgressOrder) {
                return res.status(400).json({
                    status: false,
                    message: 'You already have an order in progress. Please complete it before starting a new one.',
                });
            }
        };

        const order = await orderModel.findOne({ _id: orderId, driverId: user._id });
        if (!order) {
            return res.status(404).json({
                status: false,
                message: 'Order not found!',
            });
        }

        order.status = status.toUpperCase();
        await order.save();

        return res.status(200).json({
            status: true,
            message: 'Order status updated successfully',
            data: order,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};


// faileds order
exports.failedOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { reason } = req.body;
        const user = req.user;

        const order = await orderModel.findOne({ _id: orderId, driverId: user._id, status: "IN_PROGRESS" });
        if (!order) {
            return res.status(404).json({
                status: false,
                message: "order not found!",
            })
        };

        order.status = constants.ORDER_STATUS.FAILED;
        order.reason = reason;
        await order.save();

        return res.status(200).json({
            status: true,
            message: 'failed order',
            data: order
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};



// deliver order
exports.deliverOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { scannedQRCode } = req.body; // QR code data from the customer
        const user = req.user;

        const order = await orderModel.findOne({
            _id: orderId,
            driverId: user._id,
            status: "IN_PROGRESS",
            isAvailable: true
        });

        if (!order) {
            return res.status(404).json({
                status: false,
                message: "not found!",
            })
        };

        // Validate the scanned QR code against the order's productId
        if (scannedQRCode !== order.productId.toString()) {
            return res.status(400).json({
                status: false,
                message: "Invalid QR code!"
            });
        };

        order.status = constants.ORDER_STATUS.SUCCESS;
        order.receiverName = 'Self';
        order.isAvailable = false;
        order.time = moment().unix();
        // also update the product model
        await order.save();

        // Also update the product model (if needed)
        // const product = await productModel.findById(order.productId);
        // if (product) {
        //     product.status = constants.PRODUCT_STATUS.DELIVERED;
        //     await product.save();
        // }

        return res.status(200).json({
            status: true,
            message: 'order deleivered successfully',
            data: order
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};




// customer not available
exports.customerNotAvailable = async (req, res) => {
    try {
        receiverImage(req, res, async (err) => {
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

                const { id } = req.params;
                const user = req.user;
                const receiverImage = req.files.receiverImage ? `/uploads/receiverImages/${moment().unix()}-${req.files.receiverImage.originalname}` : null;
                const { receiverName } = req.body;

                const order = await orderModel.findOne({ _id: id, driverId: user._id, status: "IN_PROGRESS", isAvailable: true });

                if (!order) {
                    return res.status(404).json({
                        status: false,
                        message: "not found!",
                    })
                };

                order.receiverImage = receiverImage;
                order.receiverName = receiverName;
                order.status = ORDER_STATUS.SUCCESS;
                order.isAvailable = false;
                order.time = moment().unix();
                // also update the product model
                await order.save();

                return res.status(200).json({
                    status: true,
                    message: 'order deleivered successfully',
                    data: order
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
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};


// delivered order details
exports.deliveredOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await orderModel.find({
            _id: id,
            driverId: req.user._id,
            status: constants.ORDER_STATUS.SUCCESS,
            isAvailable: false
        });

        if (!order) {
            return res.status(404).json({
                status: false,
                message: "not found!",
            })
        };

        return res.status(200).json({
            status: true,
            message: 'successfully fetched',
            data: order
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};



// add driver location
exports.addDriverLocation = async (req, res) => {
    try {
        const user = await req.user;
        const { lat, long } = req.body;

        user.lat = lat ? lat : user.lat;
        user.long = long ? long : user.long;

        await user.save();

        return res.status(200).json({
            status: true,
            message: 'successfully driver location added',
            userData: user
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};



// logout
exports.logout = async (req, res) => {
    try {
        const user = req.user;
        user.deviceToken = null;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "logout successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
};



