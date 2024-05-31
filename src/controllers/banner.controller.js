const bannerModel = require('../models/banner.model');
const { uploadBannerImage } = require('../../helpers/multer');
const moment = require('moment');
const path = require('path');
const fs = require('fs');


const deleteUploadedFiles = (file) => {
    if (!file) return;
    const filePath = file.path;
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Error deleting file:', filePath, err);
        } else {
            console.log('File deleted successfully:', filePath);
        }
    });
};



// add banner
exports.addBanner = async (req, res) => {
    try {
        uploadBannerImage(req, res, async (err) => {
            try {
                if (err) {
                    // console.log('Error during file upload:', err);
                    deleteUploadedFiles(req.file);
                    return res.status(500).send({
                        status: false,
                        message: 'Error during file upload: ' + err.message,
                    });
                };

                if (!req.file) {
                    return res.status(400).send({
                        status: false,
                        message: 'Banner image is required',
                    });
                }

                const imageFilePath = req.file ? `/uploads/bannerImages/${moment().unix()}-${req.file.originalname}` : '';

                const banner = new bannerModel({
                    bannerImage: imageFilePath,
                });

                await banner.save();
                return res.status(201).send({
                    status: true,
                    message: 'successfully added Banner Image',
                    data: banner
                });
            } catch (error) {
                deleteUploadedFiles(req.file);
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



exports.getAllBanners = async (req, res) => {
    try {
        const banner = await bannerModel.find();

        if (!banner || banner.length < 0) {
            return res.status(404).json({
                status: false,
                message: 'Banners not found!'
            });
        };

        return res.status(200).json({
            status: true,
            message: 'banner list fetched successfully',
            bannerList: banner
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};

