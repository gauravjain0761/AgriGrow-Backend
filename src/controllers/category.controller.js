const categoryModel = require('../models/category.model');
const { uploadProductCategoryImage, deleteUploadedFiles } = require('../../helpers/multer');
const moment = require('moment');

// addCategory
exports.addCategory = async (req, res) => {
    try {
        uploadProductCategoryImage(req, res, async (err) => {
            try {
                if (err) {
                    deleteUploadedFiles(req.files);
                    return res.status(500).send({
                        status: false,
                        message: 'Error during file upload: ' + err.message,
                    });
                };

                const { name } = req.body;

                const chcekCategoryData = await categoryModel.findOne({ name: req.body.name });
                if (chcekCategoryData) {
                    deleteUploadedFiles(req.files);
                    return res.status(400).send({
                        status: false,
                        message: 'category name is already present',
                    })
                };

                const imageFilePath = req.file ? `/uploads/productCategoryImages/${moment().unix()}-${req.file.originalname}` : null;

                const category = new categoryModel({
                    name: name,
                    image: imageFilePath
                });

                await category.save();
                return res.status(201).json({
                    status: true,
                    message: 'successfully created',
                    data: category
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
        deleteUploadedFiles(req.files);
        // console.log(error);
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// get all category
exports.getAllCategory = async (req, res) => {
    try {
        const category = await categoryModel.find({ isAvailable: true });
        if (!category) {
            return res.status(404).json({
                status: false,
                message: "not found!",
            })
        };
        const totalDocuments = await categoryModel.countDocuments();

        return res.status(200).json({
            status: true,
            message: 'successfully fetched category list',
            totalDocuments: totalDocuments,
            data: category
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

