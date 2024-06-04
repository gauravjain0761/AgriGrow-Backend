const farmerModel = require('../models/farmer.model');
const crypto = require('crypto-js');
const jwt = require('jsonwebtoken');
const { generateRandomNumber } = require("../../helpers/randomNumber.helper");
const { sendOtp } = require("../../helpers/sendEmail.helper");


const { uploadProfileImage, uploadCertificates, deleteUploadedFiles } = require('../../helpers/multer');
const fs = require('fs');
const path = require('path');
const moment = require('moment');



// Helper function to delete an old image
const deleteOldImage = (imagePath) => {
    if (imagePath) {
        const fullPath = path.join(__dirname, '../../', imagePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    }
};





// const storage = multer.diskStorage( {
//     destination: function ( req, file, cb )
//     {
//         cb( null, path.join( __dirname, '../../uploads/feedFiles/' ) );
//     },
//     filename: function ( req, file, cb )
//     {
//         cb( null, moment().unix() + "-" + file.originalname );
//     },
// } );

// const upload = multer( {
//     storage: storage,
//     fileFilter: function ( req, file, cb )
//     {
//         // if ( !file.originalname.match( /jpeg|jpg|png|gif|mp4|avi|mkv/ ) )
//         // {
//         //     return cb( new Error( "Only image & video files (jpeg, jpg, png, gif, mp4, avi, mkv) are allowed!" ) );
//         // }
//         cb( null, true );
//     },
//     limits: {
//         fileSize: 100 * 1024 * 1024,
//     },
//     // } ).single( "imagePath" );
// } ).fields( [
//     { name: 'imagePath', maxCount: 1 },
//     { name: 'videoPath', maxCount: 1 },
//     { name: 'thumbnailPath', maxCount: 1 },
// ] );


// signup
const farmerSignUp = async (req, res) => {
    try {
        uploadCertificates(req, res, async (err) => {
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

                const { name, email, password, mobile, Aadhaar_Card_Number, PAN_Card_Number,
                    state, city, postalCode, streetAddress, farmLocation, village, deviceToken } = req.body;

                const Aadhaar_Card_Front = req.files.Aadhaar_Card_Front ? `/uploads/farmerCertificates/${moment().unix()}-${req.files.Aadhaar_Card_Front[0].originalname}` : null;
                const Aadhaar_Card_Back = req.files.Aadhaar_Card_Back ? `/uploads/farmerCertificates/${moment().unix()}-${req.files.Aadhaar_Card_Back[0].originalname}` : null;
                const PAN_Card = req.files.PAN_Card ? `/uploads/farmerCertificates/${moment().unix()}-${req.files.PAN_Card[0].originalname}` : null;

                const farmer = new farmerModel({
                    name: name,
                    email: email.toLowerCase(),
                    password: crypto.AES.encrypt(password, process.env.secretKey).toString(),
                    mobile: mobile,
                    Aadhaar_Card_Number: Aadhaar_Card_Number,
                    PAN_Card_Number: PAN_Card_Number,
                    state: state,
                    city: city,
                    postalCode: postalCode,
                    streetAddress: streetAddress,
                    farmLocation: farmLocation,
                    deviceToken: deviceToken,
                    village: village,
                    Aadhaar_Card_Front: Aadhaar_Card_Front,
                    Aadhaar_Card_Back: Aadhaar_Card_Back,
                    PAN_Card: PAN_Card,
                });

                // const certificates = {};
                // if ( req.files )
                // {
                //     certificates.Aadhaar_Card_Front = req.files[ 'Aadhaar_Card_Front' ] ? `/uploads/farmerCertificates/${ moment().unix() }-${ req.files[ 'Aadhaar_Card_Front' ][ 0 ].originalname }` : null;
                //     certificates.Aadhaar_Card_Back = req.files[ 'Aadhaar_Card_Back' ] ? `/uploads/farmerCertificates/${ moment().unix() }-${ req.files[ 'Aadhaar_Card_Back' ][ 0 ].originalname }` : null;
                //     certificates.PAN_Card = req.files[ 'PAN_Card' ] ? `/uploads/farmerCertificates/${ moment().unix() }-${ req.files[ 'PAN_Card' ][ 0 ].originalname }` : null;
                //     // certificates.PAN_Card = req.files[ 'PAN_Card' ] ? req.files[ 'PAN_Card' ][ 0 ].path : null;
                // };

                // farmer.certificates = certificates;

                const getOtp = generateRandomNumber(4);
                farmer.otp = getOtp;
                const otpValidTill = new Date();
                otpValidTill.setMinutes(otpValidTill.getMinutes() + 10);
                farmer.otpValidTill = otpValidTill;

                await farmer.save();
                return res.status(201).send({
                    status: true,
                    message: 'successfully created',
                    data: farmer
                });
            } catch (error) {
                deleteUploadedFiles(req.files);
                console.log(error);
                if (error.code === 11000 && error.keyPattern && (error.keyPattern.email || error.keyPattern.mobile)) {
                    const violatedKeys = Object.keys(error.keyPattern);
                    console.log(violatedKeys);
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
        console.log(2222, error);
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// update mobile number
const updateMobileNumber = async (req, res) => {
    try {
        const { email, mobile } = req.body;

        const farmer = await farmerModel.findOne({ email: email });
        if (!farmer) {
            return res.status(404).send({
                status: false,
                message: "farmer Not Found!",
            });
        };

        // Check if the new mobile number already exists in the database
        if (mobile) {
            const existingfarmer = await farmerModel.findOne({ mobile: mobile });
            if (existingfarmer && existingfarmer._id.toString() !== farmer._id.toString()) {
                return res.status(409).send({
                    status: false,
                    message: "Mobile number already exists!",
                });
            }
            farmer.mobile = mobile;
            const getOtp = generateRandomNumber(4);
            farmer.otp = getOtp;
            const otpValidTill = new Date();
            otpValidTill.setMinutes(otpValidTill.getMinutes() + 10);
            farmer.otpValidTill = otpValidTill;
        };

        await farmer.save();
        return res.status(200).send({
            status: true,
            message: `mobile number updated successfully`,
            data: farmer
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
const farmerLogin = async (req, res) => {
    try {
        const { email, mobile, password, deviceToken } = req.body;

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

        const farmer = await farmerModel.findOne({ $or: [query] });

        if (!farmer) {
            return res.status(404).send({
                status: false,
                message: "not found!",
            });
        };

        if (farmer.isVerified === false) {
            const getOtp = generateRandomNumber(4);
            farmer.otp = getOtp;
            const otpValidTill = new Date();
            otpValidTill.setMinutes(otpValidTill.getMinutes() + 10);
            farmer.otpValidTill = otpValidTill;

            await farmer.save();

            return res.status(400).send({
                status: false,
                message: `${farmer.email}, before login please verify your account.`,
                data: farmer
            });
        };

        const decryptedPass = crypto.AES.decrypt(
            farmer.password,
            process.env.secretKey
        ).toString(crypto.enc.Utf8);

        if (password !== decryptedPass) {
            return res.status(400).send({
                status: false,
                message: "incorrect email or password!",
            });
        }

        const token = jwt.sign(
            { id: farmer._id, email: farmer.email },
            "qwerty1234",
            { expiresIn: '24h' }
        );

        farmer.deviceToken = deviceToken;
        await farmer.save();

        return res.status(200).send({
            status: true,
            message: "login successfully",
            token: token,
            farmerData: farmer
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status: false,
            message: error.message,
        });
    }
};

// send reset password otp to email
const sendResetPasswordOtp = async (req, res) => {
    try {
        const { email } = req.body;

        const farmer = await farmerModel.findOne({ email: email.toLowerCase() });

        if (!farmer) {
            return res.status(404).send({
                status: false,
                message: "farmer Not Found!",
            });
        };

        const getOtp = generateRandomNumber(4);
        farmer.otp = getOtp;
        const otpValidTill = new Date();
        otpValidTill.setMinutes(otpValidTill.getMinutes() + 10);
        farmer.otpValidTill = otpValidTill;

        await farmer.save();
        sendOtp(farmer);

        return res.status(200).send({
            status: true,
            message: `Your OTP for Password Reset is sent to ${farmer.email} successfully`,
            data: farmer
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

        const farmer = await farmerModel.findOne({ email: email });
        if (!farmer) {
            return res.status(404).send({
                status: false,
                message: "farmer Not Found!",
            });
        };
        if (farmer.otp !== otp) {
            return res.status(404).send({
                status: false,
                message: "OTP not matched!"
            });
        };
        if (farmer.otpValidTill < new Date()) {
            return res.status(404).send({
                status: false,
                message: "OTP valid for only 10 minutes, please use new OTP!"
            });
        };

        farmer.otp = null;
        await farmer.save();

        return res.status(200).send({
            status: true,
            message: "verification code verify successfully",
            data: farmer,
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

        const farmer = await farmerModel.findOne({ email: email.toLowerCase() });
        if (!farmer) {
            return res.status(404).send({
                status: false,
                message: "farmer not found!"
            });
        };

        const decryptedPass = crypto.AES.decrypt(farmer.password, process.env.secretKey).toString(crypto.enc.Utf8);
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
        farmer.password = newEncryptPassword;
        const newResetPassword = await farmer.save();
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

        const farmer = await farmerModel.findOne({ mobile: mobile })
        if (!farmer) {
            return res.status(404).send({
                status: false,
                message: "farmer Not Found!",
            });
        };

        const getOtp = generateRandomNumber(4);
        farmer.otp = getOtp;
        const otpValidTill = new Date();
        otpValidTill.setMinutes(otpValidTill.getMinutes() + 10);
        farmer.otpValidTill = otpValidTill;

        await farmer.save();
        return res.status(200).send({
            status: true,
            message: `registration otp send to ${farmer.mobile} successfully`,
            data: farmer
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

        const farmer = await farmerModel.findOne({ mobile: mobile });
        if (!farmer) {
            return res.status(404).send({
                status: false,
                message: "farmer Not Found!",
            });
        };
        if (farmer.otp !== otp) {
            return res.status(404).send({
                status: false,
                message: "OTP not matched!"
            });
        };
        if (farmer.otpValidTill < new Date()) {
            return res.status(404).send({
                status: false,
                message: "OTP valid for only 10 minutes, please use new OTP!"
            });
        };

        const token = jwt.sign(
            { id: farmer._id, mobile: farmer.mobile }, "qwerty1234", { expiresIn: '24h' }
        );

        farmer.deviceToken = deviceToken;
        farmer.otp = null;
        farmer.isVerified = true;
        await farmer.save();

        return res.status(200).send({
            status: true,
            message: "verify otp successfully",
            token: token,
            data: farmer,
        });
    } catch (error) {
        return res.status(500).send({
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

// sign-in with Google
const signInWithGoogle = async (req, res) => {
    try {
        const { email, deviceToken } = req.body;
        const farmer = await farmerModel.findOne({ email: email.toLowerCase() });
        if (!farmer) {
            return res.status(404).json({
                status: false,
                message: 'not found!'
            })
        };

        const token = jwt.sign(
            { id: farmer._id, email: farmer.email }, "qwerty1234", { expiresIn: '24h' }
        );

        farmer.deviceToken = deviceToken;
        farmer.socialLogin = true;
        await farmer.save();

        return res.status(200).send({
            status: true,
            message: "login successfully",
            token: token,
            data: farmer,
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

        const farmer = await farmerModel.findOne(query);

        if (!farmer) {
            return res.status(404).json({
                status: false,
                message: 'Farmer not found!'
            })
        };

        const token = jwt.sign(
            { id: farmer._id, email: farmer.email }, "qwerty1234", { expiresIn: '24h' }
        );

        farmer.deviceToken = deviceToken;
        farmer.socialLogin = true;
        await farmer.save();

        return res.status(200).send({
            status: true,
            message: "login successfully",
            token: token,
            data: farmer,
        });
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
        uploadCertificates(req, res, async (err) => {
            try {
                if (err) {
                    deleteUploadedFiles(req.files);
                    return res.status(500).send({
                        status: false,
                        message: 'Error during file upload: ' + err.message,
                    });
                };

                const user = req.user;
                // console.log(user);
                const { name, GST_Number } = req.body;

                // const imageFilePath = req.file ? `/uploads/profileImages/${moment().unix()}-${req.file.originalname}` : null;
                const image = req.files.image ? `/uploads/farmerCertificates/${moment().unix()}-${req.files.image[0].originalname}` : null;
                const Aadhaar_Card_Front = req.files.Aadhaar_Card_Front ? `/uploads/farmerCertificates/${moment().unix()}-${req.files.Aadhaar_Card_Front[0].originalname}` : null;
                const Aadhaar_Card_Back = req.files.Aadhaar_Card_Back ? `/uploads/farmerCertificates/${moment().unix()}-${req.files.Aadhaar_Card_Back[0].originalname}` : null;
                const Farmer_Card = req.files.Farmer_Card ? `/uploads/farmerCertificates/${moment().unix()}-${req.files.Farmer_Card[0].originalname}` : null;

                // Delete old images if new ones are uploaded
                if (image) deleteOldImage(user.image);
                if (Aadhaar_Card_Front) deleteOldImage(user.Aadhaar_Card_Front);
                if (Aadhaar_Card_Back) deleteOldImage(user.Aadhaar_Card_Back);
                if (Farmer_Card) deleteOldImage(user.Farmer_Card);


                user.name = name ? name : user.name;
                user.GST_Number = GST_Number ? GST_Number : user.GST_Number;
                user.image = image ? image : user.image;
                user.Aadhaar_Card_Front = Aadhaar_Card_Front ? Aadhaar_Card_Front : user.Aadhaar_Card_Front;
                user.Aadhaar_Card_Back = Aadhaar_Card_Back ? Aadhaar_Card_Back : user.Aadhaar_Card_Back;
                user.Farmer_Card = Farmer_Card ? Farmer_Card : user.Farmer_Card;

                await user.save();

                return res.status(200).json({
                    status: true,
                    message: "data updated successfully",
                    data: user
                });
            } catch (error) {
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



// update farm details
const updateFarmDetails = async (req, res) => {
    try {
        const { farmName, farmLocation, shippingAddress, billingAddress } = req.body;
        const farmer = req.user;

        farmer.farmName = farmName ? farmName : farmer.farmName;
        farmer.farmLocation = farmLocation ? farmLocation : farmer.farmLocation;
        farmer.shippingAddress = shippingAddress ? shippingAddress : farmer.shippingAddress;
        farmer.billingAddress = billingAddress ? billingAddress : farmer.billingAddress;

        await farmer.save();

        return res.status(200).json({
            status: true,
            message: "data updated successfully",
            data: farmer
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};




// add certificates
const addCertificates = async (req, res) => {
    try {
        const user = req.user;
        uploadCertificates(req, res, async (err) => {
            try {
                if (err) {
                    deleteUploadedFiles(req.files);
                    return res.status(500).send({
                        status: false,
                        message: 'Error during file upload: ' + err.message,
                    });
                };


                const India_Organic_Certificate = req.files.India_Organic_Certificate ? `/uploads/farmerCertificates/${moment().unix()}-${req.files.India_Organic_Certificate[0].originalname}` : null;
                const Organic_Farmer_And_Growers = req.files.Organic_Farmer_And_Growers ? `/uploads/farmerCertificates/${moment().unix()}-${req.files.Organic_Farmer_And_Growers[0].originalname}` : null;
                const National_Program_For_Sustainable_Aquaculture = req.files.National_Program_For_Sustainable_Aquaculture ? `/uploads/farmerCertificates/${moment().unix()}-${req.files.National_Program_For_Sustainable_Aquaculture[0].originalname}` : null;
                const Spices_BoardOrganic_Certification = req.files.Spices_BoardOrganic_Certification ? `/uploads/farmerCertificates/${moment().unix()}-${req.files.Spices_BoardOrganic_Certification[0].originalname}` : null;
                const Fair_Trade_India_Certification = req.files.Fair_Trade_India_Certification ? `/uploads/farmerCertificates/${moment().unix()}-${req.files.Fair_Trade_India_Certification[0].originalname}` : null;
                const India_Good_Agricultural_Practices = req.files.India_Good_Agricultural_Practices ? `/uploads/farmerCertificates/${moment().unix()}-${req.files.India_Good_Agricultural_Practices[0].originalname}` : null;
                const Participatory_Guarantee_System = req.files.Participatory_Guarantee_System ? `/uploads/farmerCertificates/${moment().unix()}-${req.files.Participatory_Guarantee_System[0].originalname}` : null;
                const National_Programme_On_Organic_Production = req.files.National_Programme_On_Organic_Production ? `/uploads/farmerCertificates/${moment().unix()}-${req.files.National_Programme_On_Organic_Production[0].originalname}` : null;
                const Bureau_Of_Indian_Standards = req.files.Bureau_Of_Indian_Standards ? `/uploads/farmerCertificates/${moment().unix()}-${req.files.Bureau_Of_Indian_Standards[0].originalname}` : null;
                const Rainfed_Area_Authority = req.files.Rainfed_Area_Authority ? `/uploads/farmerCertificates/${moment().unix()}-${req.files.Rainfed_Area_Authority[0].originalname}` : null;
                const Any_Other_Certificate = req.files.Any_Other_Certificate ? `/uploads/farmerCertificates/${moment().unix()}-${req.files.Any_Other_Certificate[0].originalname}` : null;


                // Delete old images if new ones are uploaded
                if (India_Organic_Certificate) { deleteOldImage(user.India_Organic_Certificate) };
                if (Organic_Farmer_And_Growers) deleteOldImage(user.Organic_Farmer_And_Growers);
                if (National_Program_For_Sustainable_Aquaculture) deleteOldImage(user.National_Program_For_Sustainable_Aquaculture);
                if (Spices_BoardOrganic_Certification) deleteOldImage(user.Spices_BoardOrganic_Certification);
                if (Fair_Trade_India_Certification) deleteOldImage(user.Fair_Trade_India_Certification);
                if (India_Good_Agricultural_Practices) deleteOldImage(user.India_Good_Agricultural_Practices);
                if (Participatory_Guarantee_System) deleteOldImage(user.Participatory_Guarantee_System);
                if (National_Programme_On_Organic_Production) deleteOldImage(user.National_Programme_On_Organic_Production);
                if (Bureau_Of_Indian_Standards) deleteOldImage(user.Bureau_Of_Indian_Standards);
                if (Rainfed_Area_Authority) deleteOldImage(user.Rainfed_Area_Authority);
                if (Any_Other_Certificate) deleteOldImage(user.Any_Other_Certificate);


                user.India_Organic_Certificate = India_Organic_Certificate ? India_Organic_Certificate : user.India_Organic_Certificate;
                user.Organic_Farmer_And_Growers = Organic_Farmer_And_Growers ? Organic_Farmer_And_Growers : user.Organic_Farmer_And_Growers;
                user.National_Program_For_Sustainable_Aquaculture = National_Program_For_Sustainable_Aquaculture ? National_Program_For_Sustainable_Aquaculture : user.National_Program_For_Sustainable_Aquaculture;
                user.Spices_BoardOrganic_Certification = Spices_BoardOrganic_Certification ? Spices_BoardOrganic_Certification : user.Spices_BoardOrganic_Certification;
                user.Fair_Trade_India_Certification = Fair_Trade_India_Certification ? Fair_Trade_India_Certification : user.Fair_Trade_India_Certification;
                user.India_Good_Agricultural_Practices = India_Good_Agricultural_Practices ? India_Good_Agricultural_Practices : user.India_Good_Agricultural_Practices;
                user.Participatory_Guarantee_System = Participatory_Guarantee_System ? Participatory_Guarantee_System : user.Participatory_Guarantee_System;
                user.National_Programme_On_Organic_Production = National_Programme_On_Organic_Production ? National_Programme_On_Organic_Production : user.National_Programme_On_Organic_Production;
                user.Bureau_Of_Indian_Standards = Bureau_Of_Indian_Standards ? Bureau_Of_Indian_Standards : user.Bureau_Of_Indian_Standards;
                user.Rainfed_Area_Authority = Rainfed_Area_Authority ? Rainfed_Area_Authority : user.Rainfed_Area_Authority;
                user.Any_Other_Certificate = Any_Other_Certificate ? Any_Other_Certificate : user.Any_Other_Certificate;


                await user.save();
                return res.status(200).json({
                    status: true,
                    message: "certificates added successfully",
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


// farmer logout
const farmerLogOut = async (req, res) => {
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
    farmerSignUp,
    updateMobileNumber,
    farmerLogin,
    sendResetPasswordOtp,
    verifyResetPasswordOTP,
    resetPassword,
    loginWithMobileNumber,
    verifyVerificationCode,
    getProfile,
    signInWithGoogle,
    signInWithFacebook,
    updateProfile,
    updateFarmDetails,
    addCertificates,
    farmerLogOut
};






















// const addProduct = async (req, res) => {
//     try {
//         // Your existing code

//         uploadImages(req, res, async (err) => { // Change uploadImage to uploadImages
//             try {
//                 if (err) {
//                     return res.status(500).send({
//                         status: false,
//                         message: 'Error during file upload: ' + err.message,
//                     });
//                 }

//                 const imageFilePaths = req.files.map(file => `/uploads/${moment().unix()}-${file.originalname}`);
//                 // Process each image file path as needed
//             } catch (error) {
//                 return res.status(500).send({
//                     status: false,
//                     message: error.message,
//                 });
//             }
//         });
//     } catch (error) {
//         return res.status(500).json({
//             status: false,
//             message: error.message,
//         });
//     }
// };














// // signup
// const farmerSignUp = async ( req, res ) =>
// {
//     try
//     {
//         uploadCertificates( req, res, async ( err ) =>
//         {
//             try
//             {
//                 if ( err )
//                 {
//                     console.log( 'Error during file upload:', err );
//                     // Delete uploaded files if an error occurred
//                     deleteUploadedFiles( req.files );
//                     return res.status( 500 ).send( {
//                         status: false,
//                         message: 'Error during file upload: ' + err.message,
//                     } );
//                 };

//                 const { name, email, password, mobile, Aadhaar_Card_Number, PAN_Card_Number,
//                     state, city, postalCode, streetAddress, farmLocation, deviceToken } = req.body;

//                 const farmer = new farmerModel( {
//                     name: name,
//                     email: email.toLowerCase(),
//                     password: crypto.AES.encrypt( password, process.env.secretKey ).toString(),
//                     mobile: mobile,
//                     Aadhaar_Card_Number: Aadhaar_Card_Number,
//                     PAN_Card_Number: PAN_Card_Number,
//                     state: state,
//                     city: city,
//                     postalCode: postalCode,
//                     streetAddress: streetAddress,
//                     farmLocation: farmLocation,
//                     deviceToken: deviceToken,
//                 } );

//                 const certificates = {};
//                 if ( req.files )
//                 {
//                     certificates.Aadhaar_Card_Front = req.files[ 'Aadhaar_Card_Front' ] ? `/uploads/farmerCertificates/${ moment().unix() }-${ req.files[ 'Aadhaar_Card_Front' ][ 0 ].originalname }` : null;
//                     certificates.Aadhaar_Card_Back = req.files[ 'Aadhaar_Card_Back' ] ? `/uploads/farmerCertificates/${ moment().unix() }-${ req.files[ 'Aadhaar_Card_Back' ][ 0 ].originalname }` : null;
//                     certificates.PAN_Card = req.files[ 'PAN_Card' ] ? `/uploads/farmerCertificates/${ moment().unix() }-${ req.files[ 'PAN_Card' ][ 0 ].originalname }` : null;
//                 };

//                 farmer.certificates = certificates;

//                 await farmer.save();
//                 return res.status( 201 ).send( {
//                     status: true,
//                     message: 'successfully created',
//                     data: farmer
//                 } );
//             } catch ( error )
//             {
//                 console.log( error );
//                 // Delete uploaded files if an error occurred
//                 deleteUploadedFiles( req.files );
//                 if ( error.code === 11000 && error.keyPattern && ( error.keyPattern.email || error.keyPattern.mobile ) )
//                 {
//                     const violatedKeys = Object.keys( error.keyPattern );
//                     console.log( violatedKeys );
//                     return res.status( 400 ).json( {
//                         status: false,
//                         message: `${ violatedKeys } is already registered. Please use a different ${ violatedKeys }.`,
//                     } );
//                 }
//                 return res.status( 500 ).send( {
//                     status: false,
//                     message: error.message,
//                 } );
//             }
//         } );
//     } catch ( error )
//     {
//         console.log( 2222, error );
//         return res.status( 500 ).json( {
//             status: false,
//             message: error.message
//         } )
//     }
// };

// function deleteUploadedFiles ( files )
// {
//     if ( !files ) return;
//     for ( const file of Object.values( files ) )
//     {
//         if ( Array.isArray( file ) )
//         {
//             for ( const f of file )
//             {
//                 fs.unlink( f.path, ( err ) =>
//                 {
//                     if ( err )
//                     {
//                         console.error( 'Error deleting file:', err );
//                     } else
//                     {
//                         console.log( 'File deleted successfully:', f.path );
//                     }
//                 } );
//             }
//         } else
//         {
//             fs.unlink( file.path, ( err ) =>
//             {
//                 if ( err )
//                 {
//                     console.error( 'Error deleting file:', err );
//                 } else
//                 {
//                     console.log( 'File deleted successfully:', file.path );
//                 }
//             } );
//         }
//     }
// }
