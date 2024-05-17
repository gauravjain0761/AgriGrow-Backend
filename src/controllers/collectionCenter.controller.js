const collectionCenterModel = require('../models/collectionCenter.model');
const crypto = require('crypto-js');
const jwt = require('jsonwebtoken');

const { uploadCollectionCenterImages, deleteUploadedFiles } = require('../../helpers/multer');
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
                    // console.log('Error during file upload:', err);
                    deleteUploadedFiles(req.files);
                    return res.status(500).send({
                        status: false,
                        message: 'Error during file upload: ' + err.message,
                    });
                };

                const user = req.user;

                if (user.isCollectionCenter === true) {
                    deleteUploadedFiles(req.files);
                    return res.status(400).send({
                        status: false,
                        message: `already have collection center`,
                    });
                };

                const { collectionCenterName, password, govermentId, licenseNumber, aadhaarCardNumber,
                    collectionCenterAddress, day, open, close, deviceToken } = req.body;

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
                    aadhaarCardFront: aadhaarCardFront,
                    aadhaarCardBack: aadhaarCardBack,
                    licenseImage: licenseImage,
                    deviceToken: deviceToken
                });

                if (day) {
                    const daysArray = day.split(',').map(e => (e.trim()));
                    const openingTimeArray = open.split(',').map(e => (e.trim()));
                    const closeingTimeArray = close.split(',').map(e => (e.trim()));

                    if (daysArray.length !== openingTimeArray.length ||
                        daysArray.length !== closeingTimeArray.length) {
                        deleteUploadedFiles(req.files);
                        return res.status(400).send({
                            status: false,
                            message: 'All array fields must have the same length',
                        });
                    };

                    newCollectionCenter.operationTime = daysArray.map((element, index) => ({
                        day: element,
                        open: openingTimeArray[index],
                        close: closeingTimeArray[index],
                    }));
                };

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
        deleteUploadedFiles(req.files);
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// function deleteUploadedFiles(files) {
//     if (!files) return;
//     for (const file of Object.values(files)) {
//         if (Array.isArray(file)) {
//             for (const f of file) {
//                 fs.unlink(f.path, (err) => {
//                     if (err) {
//                         console.error('Error deleting file:', err);
//                     } else {
//                         console.log('File deleted successfully:', f.path);
//                     }
//                 });
//             }
//         } else {
//             fs.unlink(file.path, (err) => {
//                 if (err) {
//                     console.error('Error deleting file:', err);
//                 } else {
//                     console.log('File deleted successfully:', file.path);
//                 }
//             });
//         }
//     }
// };



// get collection center data
exports.getCollectionCenterData = async (req, res) => {
    try {
        return res.status(200).json({
            status: true,
            message: "profile fetched successfully",
            data: req.user
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};



// Helper function to delete an old image
const deleteOldImage = (imagePath) => {
    if (imagePath) {
        const fullPath = path.join(__dirname, '../../', imagePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    }
};


// update collectionCenter data
exports.updateCollectionCenterData = async (req, res) => {
    try {
        uploadCollectionCenterImages(req, res, async (err) => {
            try {
                if (err) {
                    // console.log('Error during file upload:', err);
                    deleteUploadedFiles(req.files);
                    return res.status(500).send({
                        status: false,
                        message: 'Error during file upload: ' + err.message,
                    });
                };

                const user = req.user;

                const { collectionCenterName, email, mobile, govermentId, licenseNumber,
                    aadhaarCardNumber, collectionCenterAddress, operationTime } = req.body;

                const govermentIdImage = req.files.govermentIdImage ? `/uploads/collectionCenterImages/${moment().unix()}-${req.files.govermentIdImage[0].originalname}` : null;
                const aadhaarCardFront = req.files.aadhaarCardFront ? `/uploads/collectionCenterImages/${moment().unix()}-${req.files.aadhaarCardFront[0].originalname}` : null;
                const aadhaarCardBack = req.files.aadhaarCardBack ? `/uploads/collectionCenterImages/${moment().unix()}-${req.files.aadhaarCardBack[0].originalname}` : null;
                const licenseImage = req.files.licenseImage ? `/uploads/collectionCenterImages/${moment().unix()}-${req.files.licenseImage[0].originalname}` : null;

                // Delete old images if new ones are uploaded
                if (govermentIdImage) {
                    deleteOldImage(user.govermentIdImage);
                };
                if (aadhaarCardFront) {
                    deleteOldImage(user.aadhaarCardFront);
                };
                if (aadhaarCardBack) {
                    deleteOldImage(user.aadhaarCardBack);
                };
                if (licenseImage) {
                    deleteOldImage(user.licenseImage);
                };

                user.collectionCenterName = collectionCenterName ? collectionCenterName : user.collectionCenterName;
                user.email = email ? email : user.email;
                user.mobile = mobile ? mobile : user.mobile;
                user.govermentId = govermentId ? govermentId : user.govermentId;
                user.licenseNumber = licenseNumber ? licenseNumber : user.licenseNumber;
                user.aadhaarCardNumber = aadhaarCardNumber ? aadhaarCardNumber : user.aadhaarCardNumber;
                user.collectionCenterAddress = collectionCenterAddress ? collectionCenterAddress : user.collectionCenterAddress;
                user.operationTime = operationTime ? operationTime : user.operationTime;
                user.govermentIdImage = govermentIdImage ? govermentIdImage : user.govermentIdImage;
                user.aadhaarCardFront = aadhaarCardFront ? aadhaarCardFront : user.aadhaarCardFront;
                user.aadhaarCardBack = aadhaarCardBack ? aadhaarCardBack : user.aadhaarCardBack;
                user.licenseImage = licenseImage ? licenseImage : user.licenseImage;

                await user.save();

                return res.status(200).json({
                    status: true,
                    message: 'data updated successfully',
                    data: user
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
            message: error.message
        })
    }
};
































// exports.registerToCollectionCenter = async (req, res) => {
//     try {
//         uploadCollectionCenterImages(req, res, async (err) => {
//             try {
//                 if (err) {
//                     console.log('Error during file upload:', err);
//                     deleteUploadedFiles(req.files);
//                     return res.status(500).send({
//                         status: false,
//                         message: 'Error during file upload: ' + err.message,
//                     });
//                 }

//                 const user = req.user;

//                 if (user.isCollectionCenter === true) {
//                     return res.status(400).send({
//                         status: false,
//                         message: `Already have collection center`,
//                     });
//                 }

//                 const {
//                     collectionCenterName, email, mobile, password, govermentId, licenseNumber,
//                     aadhaarCardNumber, collectionCenterAddress, operationTime, deviceToken
//                 } = req.body;

//                 const aadhaarCardFront = req.files.aadhaarCardFront ? `/uploads/collectionCenterImages/${moment().unix()}-${req.files.aadhaarCardFront[0].originalname}` : null;
//                 const aadhaarCardBack = req.files.aadhaarCardBack ? `/uploads/collectionCenterImages/${moment().unix()}-${req.files.aadhaarCardBack[0].originalname}` : null;
//                 const licenseImage = req.files.licenseImage ? `/uploads/collectionCenterImages/${moment().unix()}-${req.files.licenseImage[0].originalname}` : null;

//                 const newCollectionCenter = new collectionCenterModel({
//                     userId: user._id,
//                     collectionCenterName,
//                     email: user.email,
//                     mobile: user.mobile,
//                     password: crypto.AES.encrypt(password, process.env.secretKey).toString(),
//                     govermentId,
//                     licenseNumber,
//                     aadhaarCardNumber,
//                     collectionCenterAddress,
//                     operationTime: JSON.parse(operationTime),
//                     aadhaarCardFront,
//                     aadhaarCardBack,
//                     licenseImage,
//                     deviceToken
//                 });

//                 await newCollectionCenter.save();

//                 user.isCollectionCenter = true;
//                 await user.save();

//                 const token = jwt.sign(
//                     { id: newCollectionCenter._id, email: newCollectionCenter.email },
//                     "qwerty1234",
//                     { expiresIn: '24h' }
//                 );

//                 return res.status(201).json({
//                     status: true,
//                     message: 'Register to new collection center successfully',
//                     token,
//                     data: newCollectionCenter
//                 });
//             } catch (error) {
//                 deleteUploadedFiles(req.files);
//                 console.log(error);
//                 return res.status(500).send({
//                     status: false,
//                     message: error.message,
//                 });
//             }
//         });
//     } catch (error) {
//         return res.status(500).json({
//             status: false,
//             message: error.message
//         });
//     }
// };
