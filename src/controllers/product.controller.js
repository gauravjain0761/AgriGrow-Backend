const categoryModel = require('../models/category.model');
const productModel = require('../models/product.model');
const favoriteProductModel = require('../models/favoriteProduct.model');
const cartModel = require('../models/cart.model');

const { uploadProductImages, deleteUploadedFiles } = require('../../helpers/multer');
const fs = require('fs');
const path = require('path');
const moment = require('moment');


// // addProduct
// const addProduct = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const category = await categoryModel.findOne({ _id: id });
//         if (!category) {
//             return res.status(404).json({
//                 status: false,
//                 message: 'category data not found!'
//             })
//         };
//         uploadProductImages(req, res, async (err) => {
//             try {
//                 if (err) {
//                     deleteUploadedFiles(req.files);
//                     return res.status(500).send({
//                         status: false,
//                         message: 'Error during file upload: ' + err.message,
//                     });
//                 };

//                 const { images, addOnImages } = req.files;

//                 const imageFilePaths = images.map(image => `/uploads/productImages/${moment().unix()}-${image.originalname}`);
//                 const addOnImageFilePaths = addOnImages.map(image => `/uploads/productImages/${moment().unix()}-${image.originalname}`);

//                 const { productName, description, originalPrice, offerPrice,
//                     quantity, weight, discount, name, price } = req.body;

//                 const product = new productModel({
//                     farmerId: req.user._id,
//                     categoryId: category.id,
//                     category: category.name,
//                     productName: productName,
//                     description: description,
//                     images: imageFilePaths,
//                     time: moment().unix(),
//                 });

//                 if (originalPrice) {
//                     const originalPriceArray = originalPrice.split(',').map(e => parseFloat(e.trim()));
//                     const offerPriceArray = offerPrice.split(',').map(e => parseFloat(e.trim()));
//                     const quantityArray = quantity.split(',').map(e => parseInt(e.trim(), 10));
//                     const weightArray = weight.split(',').map(e => e.trim());

//                     if (originalPriceArray.length !== offerPriceArray.length ||
//                         originalPriceArray.length !== quantityArray.length ||
//                         originalPriceArray.length !== weightArray.length) {
//                         deleteUploadedFiles(req.files);
//                         return res.status(400).send({
//                             status: false,
//                             message: 'All array fields must have the same length',
//                         });
//                     };

//                     product.addQuantity = originalPriceArray.map((price, index) => ({
//                         originalPrice: price,
//                         offerPrice: offerPriceArray[index],
//                         quantity: quantityArray[index],
//                         weight: weightArray[index],
//                     }));
//                 };

//                 if (name) {
//                     const addOnNamesArray = name.split(',').map(name => name.trim());
//                     const addOnPricesArray = price.split(',').map(price => parseFloat(price.trim()));

//                     if (addOnImageFilePaths.length !== addOnNamesArray.length || addOnNamesArray.length !== addOnPricesArray.length) {
//                         deleteUploadedFiles(req.files);
//                         return res.status(400).send({
//                             status: false,
//                             message: 'All add-on array fields must have the same length',
//                         });
//                     };

//                     product.addOns = addOnNamesArray.map((name, index) => ({
//                         image: addOnImageFilePaths[index],
//                         name: name,
//                         price: addOnPricesArray[index],
//                     }));
//                 };

//                 await product.save();
//                 return res.status(201).json({
//                     status: true,
//                     message: 'successfully created',
//                     data: product
//                 });
//             } catch (error) {
//                 deleteUploadedFiles(req.files);
//                 // console.log(error);
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














const addProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await categoryModel.findById(id);
        if (!category) {
            return res.status(404).json({
                status: false,
                message: 'Category data not found!'
            });
        };

        uploadProductImages(req, res, async (err) => {
            try {
                if (err) {
                    deleteUploadedFiles(req.files);
                    return res.status(500).send({
                        status: false,
                        message: 'Error during file upload: ' + err.message,
                    });
                };

                const { images, addOnImages } = req.files;
                // if (!images || images.length === 0) {
                //     return res.status(400).send({
                //         status: false,
                //         message: 'image is required'
                //     });
                // };

                // const imageFilePaths = images.map(image => `/uploads/productImages/${moment().unix()}-${image.originalname}`);
                const imageFilePaths = images ? images.map(image => `/uploads/productImages/${moment().unix()}-${image.originalname}`) : [];

                const { productName, description, originalPrice, offerPrice, quantity, weight, name, price } = req.body;

                const originalPriceArray = originalPrice.split(',').map(e => parseFloat(e.trim()));
                const offerPriceArray = offerPrice.split(',').map(e => parseFloat(e.trim()));
                const quantityArray = quantity.split(',').map(e => parseInt(e.trim(), 10));
                const weightArray = weight.split(',').map(e => e.trim());

                if (originalPriceArray.length !== offerPriceArray.length ||
                    originalPriceArray.length !== quantityArray.length ||
                    originalPriceArray.length !== weightArray.length) {
                    deleteUploadedFiles(req.files);
                    return res.status(400).send({
                        status: false,
                        message: 'All array fields must have the same length',
                    });
                };

                const productPromises = originalPriceArray.map((price, index) => {
                    const product = new productModel({
                        farmerId: req.user._id,
                        categoryId: category._id,
                        category: category.name,
                        productName,
                        description,
                        images: imageFilePaths,
                        originalPrice: price,
                        offerPrice: offerPriceArray[index],
                        saveRupees: price - offerPriceArray[index],
                        quantity: quantityArray[index],
                        weight: weightArray[index],
                        time: moment().unix(),
                    });

                    if (name) {
                        // const addOnImageFilePaths = addOnImages.map(image => `/uploads/productImages/${moment().unix()}-${image.originalname}`);
                        const addOnImageFilePaths = addOnImages ? addOnImages.map(image => `/uploads/productImages/${moment().unix()}-${image.originalname}`) : [];
                        const addOnNamesArray = name.split(',').map(name => name.trim());
                        const addOnPricesArray = req.body.price.split(',').map(price => parseFloat(price.trim()));

                        if (addOnImageFilePaths.length !== addOnNamesArray.length || addOnNamesArray.length !== addOnPricesArray.length) {
                            deleteUploadedFiles(req.files);
                            return res.status(400).send({
                                status: false,
                                message: 'All add-on array fields must have the same length',
                            });
                        }

                        product.addOns = addOnNamesArray.map((name, index) => ({
                            image: addOnImageFilePaths[index],
                            name,
                            price: addOnPricesArray[index],
                        }));
                    }

                    return product.save();
                });

                const savedProducts = await Promise.all(productPromises);

                return res.status(201).json({
                    status: true,
                    message: 'Products successfully created',
                    data: savedProducts
                });
            } catch (error) {
                // console.log(error);
                deleteUploadedFiles(req.files);
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






// const productList = async (req, res) => {
//     try {
//         const products = await productModel.find({ isAvailable: true })
//             .populate('categoryId', 'name')
//             .populate('farmerId', 'name');

//         return res.status(200).json({
//             status: true,
//             message: 'Product list retrieved successfully',
//             data: products
//         });
//     } catch (error) {
//         return res.status(500).json({
//             status: false,
//             message: error.message,
//         });
//     }
// };








// updateProduct
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({
                status: false,
                message: 'product not found!'
            })
        };

        // if (product.farmerId.toString() !== req.user._id.toString()) {
        if (!product.farmerId.equals(req.user._id)) {
            return res.status(403).json({
                status: false,
                message: "Only the farmer who created the product has access to update it.",
            });
        };

        uploadProductImages(req, res, async (err) => {
            try {
                if (err) {
                    deleteUploadedFiles(req.files);
                    return res.status(500).send({
                        status: false,
                        message: 'Error during file upload: ' + err.message,
                    });
                };

                const { productName, description, originalPrice, offerPrice, quantity, weight } = req.body;

                const { images } = req.files;
                let imageFilePaths = product.images;

                if (images && images.length > 0) {
                    // Delete old images if new images are uploaded
                    if (product.images && product.images.length > 0) {
                        product.images.forEach(oldImagePath => {
                            const absolutePath = path.join(__dirname, '../../', oldImagePath);
                            if (fs.existsSync(absolutePath)) {
                                fs.unlinkSync(absolutePath);
                            }
                        });
                    }

                    imageFilePaths = images.map(image => `/uploads/productImages/${moment().unix()}-${image.originalname}`);
                };

                product.productName = productName ? productName : product.productName;
                product.description = description ? description : product.description;
                product.originalPrice = originalPrice ? originalPrice : product.originalPrice;
                product.offerPrice = offerPrice ? offerPrice : product.offerPrice;
                product.quantity = quantity ? quantity : product.quantity;
                product.weight = weight ? weight : product.weight;
                product.time = moment().unix();
                product.images = imageFilePaths ? imageFilePaths : product.images;

                await product.save();
                return res.status(200).json({
                    status: true,
                    message: 'product updated successfully',
                    data: product
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
            message: error.message,
        });
    }
};

// get all products
const getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const product = await productModel.find({ farmerId: req.user._id, isAvailable: true })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        if (!product) {
            return res.status(404).json({
                status: false,
                message: "not found!",
            })
        };
        const totalDocuments = await productModel.countDocuments({ farmerId: req.user._id, isAvailable: true });

        return res.status(200).json({
            status: true,
            message: 'successfully fetched',
            totalDocuments: totalDocuments,
            data: product
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};


// get all products list by category
const getProductsListByCategory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const { categoryId } = req.params;
        const products = await productModel.find({ categoryId: categoryId, isAvailable: true })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        if (!products || products.length === 0) {
            return res.status(404).json({
                status: false,
                message: "products not found!",
            });
        };

        const totalDocuments = await productModel.countDocuments({ categoryId: categoryId, isAvailable: true });

        // Get the user's favorite products
        const favoriteProducts = await favoriteProductModel.find({ userId: req.user._id }).select('productId');
        const favoriteProductIds = favoriteProducts.map(fav => fav.productId.toString());

        // Add 'isFavorite' field to each product
        const productsWithFavoriteStatus = products.map(product => ({
            ...product.toObject(),
            isFavorite: favoriteProductIds.includes(product._id.toString())
        }));

        return res.status(200).json({
            status: true,
            message: 'successfully fetched',
            totalDocuments: totalDocuments,
            data: productsWithFavoriteStatus,
            // data2: products
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};


// get all products list
const getAllProductsList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const products = await productModel.find({ isAvailable: true })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        if (!products || products.length === 0) {
            return res.status(404).json({
                status: false,
                message: "products not found!",
            });
        };

        const totalDocuments = await productModel.countDocuments();

        // Get the user's favorite products
        const favoriteProducts = await favoriteProductModel.find({ userId: req.user._id }).select('productId');
        const favoriteProductIds = favoriteProducts.map(fav => fav.productId.toString());

        // Add 'isFavorite' field to each product
        const productsWithFavoriteStatus = products.map(product => ({
            ...product.toObject(),
            isFavorite: favoriteProductIds.includes(product._id.toString())
        }));

        return res.status(200).json({
            status: true,
            message: 'successfully fetched',
            totalDocuments: totalDocuments,
            data: productsWithFavoriteStatus
            // data: products,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};


// // get all best deal offer products
// const getAllBestDealProducts = async (req, res) => {
//     try {
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;

//         const product = await productModel.find({ bestDealOfferProduct: true, isAvailable: true })
//             .sort({ createdAt: -1 })
//             .skip((page - 1) * limit)
//             .limit(limit)
//             .exec();

//         if (!product) {
//             return res.status(404).json({
//                 status: false,
//                 message: "not found!",
//             })
//         };
//         const totalDocuments = await productModel.find({ bestDealOfferProduct: true, isAvailable: true }).countDocuments();

//         return res.status(200).json({
//             status: true,
//             message: 'successfully fetched all best deal offer products',
//             totalDocuments: totalDocuments,
//             data: product
//         });
//     } catch (error) {
//         return res.status(500).json({
//             status: false,
//             message: error.message,
//         });
//     }
// };

// get product by product id
const getProductDetails = async (req, res) => {
    try {
        const productId = req.params.productId;
        const product = await productModel.findOne({ _id: productId, isAvailable: true });
        if (!product) {
            return res.status(404).json({
                status: false,
                message: "not found!",
            })
        };

        const user = req.user;

        const checkFavoriteStatus = await favoriteProductModel.findOne({ productId: product._id, userId: user._id });

        const favoriteStatus = ({
            ...product.toObject(),
            isFavorite: checkFavoriteStatus ? true : false
        });

        return res.status(200).json({
            status: true,
            message: 'successfully fetched',
            data: favoriteStatus
            // data: product,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// search product
const searchProduct = async (req, res) => {
    try {
        // const user = await userModel.find(
        //     { name: { $regex: `${ name }`, $options: 'i' }, isAvailable: true },
        //     // { name: { $regex: `^${ name }`, $options: 'i' }, isAvailable: true },
        // );

        const { productName, category } = req.body;
        const product = await productModel.find({
            $or: [
                { productName: { $regex: `${productName}`, $options: 'i' }, },
                { category: { $regex: `${category}`, $options: 'i' }, },
            ]
        });
        // console.log( product );
        if (!product) {
            return res.status(404).json({
                status: false,
                message: 'not found!'
            })
        };

        // const user = req.user;
        // const checkFavoriteStatus = await favoriteProductModel.findOne({ productId: product._id, userId: user._id });
        // const favoriteStatus = ({
        //     ...product.toObject(),
        //     isFavorite: checkFavoriteStatus ? true : false
        // });

        return res.status(200).json({
            status: true,
            message: 'searched successfully',
            data: product,
            // data: favoriteStatus
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};

// get product all details
const productAllDetails = async (req, res) => {
    try {
        const productId = req.params.productId;
        const product = await cartModel.find({ productId: productId, /* userId: req.user._id */ })
            // .populate({
            //     path: 'userId',
            //     select: 'name email mobile image state city postalCode streetAddress'
            // })
            // .populate({
            //     path: 'productId',
            //     select: 'categoryId category name description image price discount status'
            // })
            .populate('userId')
            .populate('productId')
            .exec();

        if (!product) {
            return res.status(404).json({
                status: false,
                message: "not found!",
            })
        };

        return res.status(200).json({
            status: true,
            message: 'fetched successfully',
            data: product
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};

// delete product by Id
const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await productModel.findOne({ _id: productId });
        if (!product) {
            return res.status(404).json({
                status: false,
                message: "Product not found!",
            })
        };

        // if ( product.farmerId.toString() !== user._id.toString() )
        if (!product.farmerId.equals(req.user._id)) {
            return res.status(403).json({
                status: false,
                message: "Only the farmer who created the product has access to delete it.",
            });
        };

        if (product.images && product.images.length > 0) {
            product.images.forEach(oldImagePath => {
                const absolutePath = path.join(__dirname, '../../', oldImagePath);
                if (fs.existsSync(absolutePath)) {
                    fs.unlinkSync(absolutePath);
                }
            });
        };

        await productModel.findByIdAndDelete(productId);

        return res.status(200).send({
            status: true,
            message: "Product Deleted Successfully",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};

module.exports = {
    addProduct,
    // productAddOns,
    updateProduct,
    getAllProducts,
    getProductsListByCategory,
    getAllProductsList,
    // getAllBestDealProducts,
    getProductDetails,
    searchProduct,
    productAllDetails,
    deleteProduct
};







// const { v4: uuidv4 } = require('uuid');

// function generateOrderId() {
//   return `#${uuidv4().replace(/-/g, '')}`;
// }

// // Example usage:
// const orderId = generateOrderId();
// console.log(orderId); // Output: #4b16a74e01cf4b988d910086ad902812



