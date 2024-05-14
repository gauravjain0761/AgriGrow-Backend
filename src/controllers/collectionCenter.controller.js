const collectionCenterModel = require('../models/collectionCenter.model');
const crypto = require('crypto-js');
const jwt = require('jsonwebtoken');

const { uploadCollectionCenterImages } = require('../../helpers/multer');
const fs = require('fs');
const path = require('path');
const moment = require('moment');



// register to collectionCenter
exports.registerToCollectionCenter = async (req, res) => {
    try {
        uploadCollectionCenterImages(req, res, async (err) => {
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

                if (user.isCollectionCenter === true) {
                    return res.status(400).send({
                        status: false,
                        message: `already have collection center`,
                    });
                };

                const { collectionCenterName, email, mobile, password, govermentId, licenseNumber,
                    aadhaarCardNumber, collectionCenterAddress, operationTime, deviceToken } = req.body;

                const aadhaarCardFront = req.files.aadhaarCardFront ? `/uploads/collectionCenterImages/${moment().unix()}-${req.files.aadhaarCardFront[0].originalname}` : null;
                const aadhaarCardBack = req.files.aadhaarCardBack ? `/uploads/collectionCenterImages/${moment().unix()}-${req.files.aadhaarCardBack[0].originalname}` : null;
                const licenseImage = req.files.licenseImage ? `/uploads/collectionCenterImages/${moment().unix()}-${req.files.licenseImage[0].originalname}` : null;


                const newCollectionCenter = new collectionCenterModel({
                    userId: user._id,
                    collectionCenterName: collectionCenterName,
                    email: user.email,
                    mobile: user.mobile,
                    password: crypto.AES.encrypt(
                        password,
                        process.env.secretKey
                    ).toString(),
                    govermentId: govermentId,
                    licenseNumber: licenseNumber,
                    aadhaarCardNumber: aadhaarCardNumber,
                    collectionCenterAddress: collectionCenterAddress,
                    operationTime: operationTime,
                    aadhaarCardFront: aadhaarCardFront,
                    aadhaarCardBack: aadhaarCardBack,
                    licenseImage: licenseImage,
                    deviceToken: deviceToken
                });

                await newCollectionCenter.save();

                user.isCollectionCenter = true;
                await user.save();

                const token = jwt.sign(
                    { id: newCollectionCenter._id, email: newCollectionCenter.email },
                    "qwerty1234",
                    { expiresIn: '24h' }
                );

                return res.status(201).json({
                    status: true,
                    message: 'register to new collection center successfully',
                    token: token,
                    data: newCollectionCenter
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


function deleteUploadedFiles(files) {
    if (!files) return;
    for (const file of Object.values(files)) {
        if (Array.isArray(file)) {
            for (const f of file) {
                fs.unlink(f.path, (err) => {
                    if (err) {
                        console.error('Error deleting file:', err);
                    } else {
                        console.log('File deleted successfully:', f.path);
                    }
                });
            }
        } else {
            fs.unlink(file.path, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                } else {
                    console.log('File deleted successfully:', file.path);
                }
            });
        }
    }
};



exports.get = async (req, res) => {
    try {
        return res.json({
            data: req.user
        })
    } catch (error) {
        res.json(error)
    }
};