const farmerOrderModel = require('../models/farmerOrder.model');
const productModel = require('../models/product.model');
const userModel = require('../models/user.model');
const moment = require('moment');



// farmer all order list
exports.farmerAllOrderList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const farmerOrder = await farmerOrderModel.find(
            { farmerId: req.user._id, isAvailable: true }
        )
            .populate('userId')
            .populate('productId')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        if (!farmerOrder === farmerOrder.length) {
            return res.status(404).json({
                status: false,
                message: "not found!",
            })
        };

        const orderDetails = [];

        for (const order of farmerOrder) {
            // console.log(order);
            const product = await productModel.findById(order.productId).populate('addQuantity').exec();

            if (!product) {
                continue; // Skip this order if the product is not found
            }

            const addQuantityObj = product.addQuantity.id(order.addQuantityId);
            const user = await userModel.findById(order.userId._id);
            const deliveryAddress = user.deliveryAddress.id(order.deliveryAddressId.toString());

            orderDetails.push({
                _id: order._id,
                userId: user,
                productId: product,
                deliveryAddress: deliveryAddress,
                addQuantityDetails: addQuantityObj ? {
                    addQuantityId: addQuantityObj._id,
                    price: addQuantityObj.offerPrice,
                    availableQuantity: addQuantityObj.quantity,
                } : 'AddQuantity data not found',
                status: order.status,
                quantity: order.quantity,
                totalPrice: order.totalPrice,
                QRCode: order.QRCode,
                time: moment.unix(order.time).format('YYYY-MM-DD HH:mm:ss')
                // userId: order.userId._id,
                // userName: order.userId.name,
                // productName: product.productName,
            });
        };

        const totalDocuments = await farmerOrderModel.countDocuments({ farmerId: req.user._id, isAvailable: true });

        return res.status(200).json({
            status: true,
            message: 'successfully fetched',
            totalDocuments: totalDocuments,
            data: orderDetails,
            // deliveryAddress: deliveryAddress
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// orderTime: moment.unix(order.time).format('YYYY-MM-DD HH:mm:ss');



// get order details by id
exports.getOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const farmerOrder = await farmerOrderModel.findOne({ _id: id, farmerId: req.user._id })
            .populate('userId')
            .populate('productId')
            .exec();

        if (!farmerOrder) {
            return res.status(404).json({
                status: false,
                message: "not found!",
            })
        };

        const product = await productModel.findById(farmerOrder.productId);

        const addQuantityObj = product.addQuantity.id(farmerOrder.addQuantityId.toString());
        const user = await userModel.findById(farmerOrder.userId._id);
        const deliveryAddress = user.deliveryAddress.id(farmerOrder.deliveryAddressId.toString());

        const data = {
            ...farmerOrder.toObject(),
            addQuantityObj,
            deliveryAddress
        };

        return res.status(200).json({
            status: true,
            message: 'successfully fetched',
            data: data,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};



// give rating to the user
exports.giveratingTotheUser = async (req, res) => {
    try {
        const farmer = req.user;
        const { userId, rating } = req.body;

        if (!userId) {
            return res.status(400).json({
                status: false,
                message: "Please provide userId"
            });
        };

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                status: false,
                message: "Rating must be between 1 and 5"
            });
        };

        const farmerOrder = await farmerOrderModel.findOne({ userId: userId.toString(), farmerId: farmer._id });
        if (!farmerOrder) {
            return res.status(404).json({
                status: false,
                message: 'Farmer order not found'
            });
        };

      // Find the user to be rated
      const user = await userModel.findById(userId);
      if (!user) {
          return res.status(404).json({
              status: false,
              message: 'User not found'
          });
      }

      // Check if the farmer has already rated this user
      const farmerHasRated = user.ratings.some(r => r.farmerId.toString() === farmer._id.toString());
      if (farmerHasRated) {
          return res.status(400).json({
              status: false,
              message: 'You have already rated this user',
              userRating: user.averageRating,
          });
      };

      // Add the new rating
      const newRating = { farmerId: farmer._id, rating: rating };
      user.ratings.push(newRating);

      // Update the average rating
      const totalRatings = user.ratings.length;
      const ratingSum = user.ratings.reduce((acc, curr) => acc + curr.rating, 0);
      user.averageRating = ratingSum / totalRatings;

      // Save the updated user
      await user.save();

      return res.status(200).json({
          status: true,
          message: 'Rating added successfully',
          data: user
      });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};




