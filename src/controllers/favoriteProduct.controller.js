const favoriteProductModel = require('../models/favoriteProduct.model');
const productModel = require('../models/product.model');


// add to favorite product
const addToFavorite = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await productModel.findOne({ _id: id, isAvailable: true });
        if (!product) {
            return res.status(404).json({
                status: false,
                message: "product not found!",
            })
        };

        const favoriteProduct = await favoriteProductModel.findOne({ productId: id, userId: req.user._id });

        if (favoriteProduct) {
            await favoriteProductModel.deleteOne({ _id: favoriteProduct._id });

            return res.status(200).json({
                status: true,
                message: "product removed from favorite successfully",
            });
        } else {
            const addNewToFavorite = new favoriteProductModel({
                productId: id,
                userId: req.user._id
            });

            await addNewToFavorite.save();
            return res.status(201).json({
                status: true,
                message: "product added to favorites successfully",
                data: addNewToFavorite
            });
        };
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// getAllFavoriteProduct
const getAllFavoriteProduct = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const favoriteProduct = await favoriteProductModel.find({ userId: req.user._id })
            // .populate( {
            //     path: 'productId',
            //     select: 'categoryId category productName description images addQuantity addOns availableQuantity price discount status'
            // } )
            .populate('productId')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        if (!favoriteProduct) {
            return res.status(404).json({
                status: false,
                message: "data not found!"
            })
        };

        const totalDocuments = await favoriteProductModel.find({ userId: req.user._id }).countDocuments();

        return res.status(200).json({
            status: true,
            message: 'favorite product fetched successfully',
            totalDocuments: totalDocuments,
            data: favoriteProduct
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};


module.exports = {
    addToFavorite,
    getAllFavoriteProduct,
};


