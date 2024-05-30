const userModel = require('../models/user.model');
const driverModel = require('../models/driver.model');
const collectionCenterModel = require('../models/collectionCenter.model');
const crypto = require('crypto-js');
const jwt = require('jsonwebtoken');
const { generateRandomNumber } = require("../../helpers/randomNumber.helper");
const { sendOtp } = require("../../helpers/sendEmail.helper");
const constants = require("../../config/constants.json");


const { uploadProfileImage, deleteUploadedFiles } = require('../../helpers/multer');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

// signup
const userSignUp = async (req, res) => {
    try {
        const { name, email, password, mobile, deviceToken } = req.body;

        const user = new userModel({
            name: name,
            email: email.toLowerCase(),
            password: crypto.AES.encrypt(
                password,
                process.env.secretKey
            ).toString(),
            mobile: mobile,
            deviceToken: deviceToken
        });

        const getOtp = generateRandomNumber(4);
        user.otp = getOtp;
        const otpValidTill = new Date();
        otpValidTill.setMinutes(otpValidTill.getMinutes() + 10);
        user.otpValidTill = otpValidTill;

        await user.save();
        return res.status(201).send({
            status: true,
            message: 'successfully created',
            data: user
        });
    } catch (error) {
        console.log(error);
        if (error.code === 11000 && error.keyPattern && (error.keyPattern.email || error.keyPattern.mobile)) {
            const violatedKeys = Object.keys(error.keyPattern);
            console.log(violatedKeys);
            return res.status(400).json({
                status: false,
                message: `${violatedKeys} is already registered. Please use a different ${violatedKeys} or login.`,
            });
        }
        return res.status(500).send({
            status: false,
            message: error.message,
        });
    }
};


// update mobile number
const updateMobileNumber = async (req, res) => {
    try {
        const { email, mobile } = req.body;

        const user = await userModel.findOne({ email: email });
        // console.log('user---->', user);
        if (!user) {
            return res.status(404).send({
                status: false,
                message: "User Not Found!",
            });
        };

        // Check if the new mobile number already exists in the database
        if (mobile) {
            const existingUser = await userModel.findOne({ mobile: mobile });
            if (existingUser && existingUser._id.toString() !== user._id.toString()) {
                return res.status(409).send({
                    status: false,
                    message: "Mobile number already exists!",
                });
            }
            user.mobile = mobile;
            const getOtp = generateRandomNumber(4);
            user.otp = getOtp;
            const otpValidTill = new Date();
            otpValidTill.setMinutes(otpValidTill.getMinutes() + 10);
            user.otpValidTill = otpValidTill;
        };

        await user.save();
        return res.status(200).send({
            status: true,
            message: `mobile number updated successfully`,
            data: user
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status: false,
            message: error.message,
        });
    }
};


// login
const userLogin = async (req, res) => {
    try {
        const { email, mobile, password, deviceToken, role } = req.body;

        let query = {};
        if (email) {
            query = { email: email.toLowerCase() };
        } else if (mobile) {
            query = { mobile: mobile };
        } else {
            return res.status(400).json({
                status: false,
                message: "Email or mobile number is required."
            });
        };

        // const user = await userModel.findOne( { $or: [ query ] } );
        // console.log( user );
        // const user = await userModel.findOne( {
        //     $or: [
        //         { email: email },
        //         { mobile: mobile }
        //     ]
        // } );


        const userModels = [userModel, driverModel, collectionCenterModel];
        let user;
        for (const model of userModels) {
            user = await model.findOne({ $or: [query], role: role });
            // console.log(user);
            if (user) break; // If user is found, break the loop
        };

        if (!user) {
            return res.status(404).send({
                status: false,
                message: "not found!",
            });
        };

        if (user.role === constants.ROLE.DRIVER && user.isAvailable === false) {
            return res.status(400).send({
                status: false,
                message: `${user.email}, your status is inactive from Collection Center.`,
            });
        };

        if (user.role === constants.ROLE.USER && user.isVerified === false) {
            return res.status(400).send({
                status: false,
                message: `${user.email}, before login please verify your account.`,
                isVerified: user.isVerified,
                mobile: user.mobile,
                data: user
            });
        };

        const decryptedPass = crypto.AES.decrypt(
            user.password,
            process.env.secretKey
        ).toString(crypto.enc.Utf8);

        if (password !== decryptedPass) {
            return res.status(400).send({
                status: false,
                message: "incorrect email or password!",
            });
        };

        const token = jwt.sign(
            { id: user._id, email: user.email },
            "qwerty1234",
            { expiresIn: '24h' }
        );

        user.deviceToken = deviceToken;
        await user.save();

        return res.status(200).send({
            status: true,
            message: "login successfully",
            token: token,
            userData: user
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status: false,
            message: error.message,
        });
    }
};


// // login
// const userLogin = async (req, res) => {
//     try {
//         const { email, mobile, password, deviceToken } = req.body;

//         let query = {};
//         if (email) {
//             query = { email: email.toLowerCase() };
//         } else if (mobile) {
//             query = { mobile: mobile };
//         } else {
//             return res.status(400).json({
//                 status: false,
//                 message: "Email or mobile number is required."
//             });
//         }

//         // Attempt to find the user in the different models
//         const userModels = [userModel, driverModel, collectionCenterModel];
//         let user;
//         for (const model of userModels) {
//             user = await model.findOne({ $or: [query] });
//             if (user) break; // If user is found, break the loop
//         }

//         if (!user) {
//             return res.status(404).send({
//                 status: false,
//                 message: "User not found!"
//             });
//         }

//         const decryptedPass = crypto.AES.decrypt(
//             user.password,
//             process.env.secretKey
//         ).toString(crypto.enc.Utf8);

//         if (password !== decryptedPass) {
//             return res.status(400).send({
//                 status: false,
//                 message: "Incorrect email or password!"
//             });
//         }

//         // Infer role based on the model used for authentication
//         let role;
//         if (user instanceof driverModel) {
//             role = 'driver';
//         } else if (user instanceof collectionCenterModel) {
//             role = 'collection_center';
//         } else {
//             role = 'user'; // Default to user role
//         }

//         const token = jwt.sign(
//             { id: user._id, email: user.email },
//             "qwerty1234",
//             { expiresIn: '24h' }
//         );

//         user.deviceToken = deviceToken;
//         await user.save();

//         return res.status(200).send({
//             status: true,
//             message: "Login successful",
//             token: token,
//             userData: user
//         });
//     } catch (error) {
//         console.log(error);
//         return res.status(500).send({
//             status: false,
//             message: error.message
//         });
//     }
// };






// send reset password otp to email
const sendResetPasswordOtp = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await userModel.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).send({
                status: false,
                message: "User Not Found!",
            });
        };

        const getOtp = generateRandomNumber(4);
        user.otp = getOtp;
        const otpValidTill = new Date();
        otpValidTill.setMinutes(otpValidTill.getMinutes() + 10);
        user.otpValidTill = otpValidTill;

        await user.save();
        sendOtp(user);

        return res.status(200).send({
            status: true,
            message: `Your OTP for Password Reset is sent to ${user.email} successfully`,
            data: user
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status: false,
            message: error.message,
        });
    }
};


// verify verification code
const verifyResetPasswordOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await userModel.findOne({ email: email });
        if (!user) {
            return res.status(404).send({
                status: false,
                message: "User Not Found!",
            });
        };
        if (user.otp !== otp) {
            return res.status(404).send({
                status: false,
                message: "OTP not matched!"
            });
        };
        if (user.otpValidTill < new Date()) {
            return res.status(404).send({
                status: false,
                message: "OTP valid for only 10 minutes, please use new OTP!"
            });
        };

        user.otp = null;
        await user.save();

        return res.status(200).send({
            status: true,
            message: "verification code verify successfully",
            data: user,
        });
    } catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};


// reset password
const resetPassword = async (req, res) => {
    try {
        const { newPassword, confirmPassword, email } = req.body;

        const user = await userModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).send({
                status: false,
                message: "User not found!"
            });
        };

        const decryptedPass = crypto.AES.decrypt(user.password, process.env.secretKey).toString(crypto.enc.Utf8);
        // console.log( decryptedPass );

        if (decryptedPass === newPassword) {
            return res.status(400).send({
                status: false,
                message: "Your new password matches your existing password, please choose another password."
            });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).send({
                status: false,
                message: "Password not matched!"
            });
        }
        const newEncryptPassword = crypto.AES.encrypt(newPassword, process.env.secretKey).toString();
        user.password = newEncryptPassword;
        const newResetPassword = await user.save();
        return res.status(200).send({
            status: true,
            message: "Password reset successfully",
            data: newResetPassword,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status: false,
            message: error.message,
        });
    }
};

// login with mobile
const loginWithMobileNumber = async (req, res) => {
    try {
        const { mobile } = req.body;

        const user = await userModel.findOne({ mobile: mobile })
        if (!user) {
            return res.status(404).send({
                status: false,
                message: "User Not Found!",
            });
        };

        const getOtp = generateRandomNumber(4);
        user.otp = getOtp;
        const otpValidTill = new Date();
        otpValidTill.setMinutes(otpValidTill.getMinutes() + 10);
        user.otpValidTill = otpValidTill;

        await user.save();
        return res.status(200).send({
            status: true,
            message: `registration otp send to ${user.mobile} successfully`,
            data: user
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status: false,
            message: error.message,
        });
    }
};

// verify verification code
const verifyVerificationCode = async (req, res) => {
    try {
        const { mobile, otp, deviceToken } = req.body;

        const user = await userModel.findOne({ mobile: mobile });
        if (!user) {
            return res.status(404).send({
                status: false,
                message: "User Not Found!",
            });
        };
        if (user.otp !== otp) {
            return res.status(404).send({
                status: false,
                message: "OTP not matched!"
            });
        };
        if (user.otpValidTill < new Date()) {
            return res.status(404).send({
                status: false,
                message: "OTP valid for only 10 minutes, please use new OTP!"
            });
        };

        const token = jwt.sign(
            { id: user._id, mobile: user.mobile }, "qwerty1234", { expiresIn: '24h' }
        );

        user.deviceToken = deviceToken;
        user.otp = null;
        user.isVerified = true;
        await user.save();

        return res.status(200).send({
            status: true,
            message: "verify otp successfully",
            token: token,
            data: user,
        });
    } catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};

// sign-in with Google
const signInWithGoogle = async (req, res) => {
    try {
        const { email, deviceToken } = req.body;
        const user = await userModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                status: false,
                message: 'not found!'
            })
        };

        const token = jwt.sign(
            { id: user._id, email: user.email }, "qwerty1234", { expiresIn: '24h' }
        );

        user.deviceToken = deviceToken;
        user.socialLogin = true;
        await user.save();

        return res.status(200).send({
            status: true,
            message: "login successfully",
            token: token,
            data: user,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};

// sign-in with Facebook
const signInWithFacebook = async (req, res) => {
    try {
        const { email, mobile, deviceToken } = req.body;

        let query = {};
        if (email) {
            query = { email: email.toLowerCase() };
        } else if (mobile) {
            query = { mobile: mobile };
        } else {
            return res.status(400).json({
                status: false,
                message: "Email or mobile number is required."
            });
        };

        const user = await userModel.findOne(query);

        if (!user) {
            return res.status(404).json({
                status: false,
                message: 'not found!'
            })
        };

        const token = jwt.sign(
            { id: user._id, email: user.email }, "qwerty1234", { expiresIn: '24h' }
        );

        user.deviceToken = deviceToken;
        user.socialLogin = true;
        await user.save();

        return res.status(200).send({
            status: true,
            message: "login successfully",
            token: token,
            data: user,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};

// get profile
const getProfile = async (req, res) => {
    try {
        return res.status(200).json({
            status: true,
            message: "profile fetched successfully",
            data: req.user
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};

// update profile
const updateProfile = async (req, res) => {
    try {
        const user = req.user;
        uploadProfileImage(req, res, async (err) => {
            try {
                if (err) {
                    deleteUploadedFiles(req.files);
                    return res.status(500).send({
                        status: false,
                        message: 'Error during file upload: ' + err.message,
                    });
                };

                const { name, email, mobile } = req.body;
                if (user.image) {
                    const oldImagePath = path.join(__dirname, '../../', user.image);
                    // const oldImagePath = path.join( __dirname, '../../', user.image );
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                };
                const imageFilePath = req.file ? `/uploads/profileImages/${moment().unix()}-${req.file.originalname}` : null;

                user.email = email ? email.toLowerCase() : user.email;
                user.mobile = mobile ? mobile : user.mobile;
                user.name = name ? name : user.name;
                user.image = imageFilePath ? imageFilePath : user.image;

                await user.save();

                return res.status(200).json({
                    status: true,
                    message: "data updated successfully",
                    data: user
                });
            } catch (error) {
                deleteUploadedFiles(req.files);
                console.log(error);
                if (error.code === 11000 && error.keyPattern && (error.keyPattern.email || error.keyPattern.mobile)) {
                    const violatedKeys = Object.keys(error.keyPattern);
                    return res.status(400).json({
                        status: false,
                        message: `${violatedKeys} is already registered. Please use a different ${violatedKeys}.`,
                    });
                }
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


// add new address
const addNewAddress = async (req, res) => {
    try {
        const user = req.user;
        const { state, city, postalCode, streetAddress } = req.body;

        user.deliveryAddress.push({
            state: state,
            city: city,
            postalCode: postalCode,
            streetAddress: streetAddress
        });

        await user.save();

        return res.status(200).json({
            status: true,
            message: "added successfully",
            data: user
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// get all address list
const getAllAddressList = async (req, res) => {
    try {
        const user = req.user;
        const deliveryAddress = user.deliveryAddress.map(data => data);
        console.log(22222222, deliveryAddress);

        return res.status(200).json({
            status: true,
            message: "fetched successfully",
            userData: user,
            deliveryAddress: deliveryAddress
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// edit address
const editAddress = async (req, res) => {
    try {
        const user = req.user;
        const { deliveryAddressId } = req.params;
        const { state, city, postalCode, streetAddress } = req.body;

        const address = user.deliveryAddress.id(deliveryAddressId);
        console.log(address);

        if (!address) {
            return res.status(404).json({
                status: false,
                message: "Address not found"
            });
        };

        if (state) address.state = state;
        if (city) address.city = city;
        if (postalCode) address.postalCode = postalCode;
        if (streetAddress) address.streetAddress = streetAddress;

        await user.save();

        return res.status(200).json({
            status: true,
            message: "updated successfully",
            data: user
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// delete address
const deleteAddress = async (req, res) => {
    try {
        const user = req.user;
        const { deliveryAddressId } = req.params;

        // Find the address index by ID
        const addressIndex = user.deliveryAddress.findIndex(address => address._id.toString() === deliveryAddressId);
        if (addressIndex === -1) {
            return res.status(404).json({
                status: false,
                message: "Address not found"
            });
        };

        // Remove the address from the array
        user.deliveryAddress.splice(addressIndex, 1);

        await user.save();

        return res.status(200).json({
            status: true,
            message: "deleted successfully",
            data: user
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// user logout
const userLogout = async (req, res) => {
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



module.exports = {
    userSignUp,
    updateMobileNumber,
    userLogin,
    sendResetPasswordOtp,
    verifyResetPasswordOTP,
    resetPassword,
    loginWithMobileNumber,
    verifyVerificationCode,
    signInWithGoogle,
    signInWithFacebook,
    getProfile,
    updateProfile,
    addNewAddress,
    getAllAddressList,
    editAddress,
    deleteAddress,
    userLogout
};






// const id = '662a45c464557b992225c70c';
// const last7Digits = id.slice(-7); // This gets the last 7 characters of the string
// console.log(last7Digits); // Output: '225c70c'













