const mongoose = require( "mongoose" );
const constants = require( "../../config/constants.json" );

const productModel = new mongoose.Schema(
    {
        farmerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'farmer'
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'category'
        },
        category: {
            type: String,
            default: null,
        },
        productName: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        images: [ {
            type: String,
            required: true,
            default: null,
        } ],
        originalPrice: {
            type: Number,
            required: true,
            default: 0,
        },
        offerPrice: {
            type: Number,
            required: true,
            default: 0,
        },
        discount: {
            type: Number,
            default: 0,
        },
        quantity: {
            type: Number,
            default: 1,
        },
        // addOns: {
        //     type: [ {
        //         image: {
        //             type: String,
        //             default: null,
        //         },
        //         name: {
        //             type: String,
        //             required: true,
        //             default: null,
        //         },
        //         price: {
        //             type: Number,
        //             required: true,
        //             default: 0,
        //         },
        //     } ]
        // },
        status: {
            type: String,
            enum: [ constants.PRODUCT_STATUS.AVAILABLE, constants.PRODUCT_STATUS.SOLD ],
            default: constants.PRODUCT_STATUS.AVAILABLE,
        },
        // bestDealOfferProduct: {
        //     type: Boolean,
        //     default: false,
        // },
        time: {
            type: String,
            default: null,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);



module.exports = mongoose.model( "product", productModel );















// const mongoose = require( "mongoose" );
// const constants = require( "../../config/constants.json" );

// const productModel = new mongoose.Schema(
//     {
//         farmerId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'farmer'
//         },
//         categoryId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'category'
//         },
//         category: {
//             type: String,
//             default: null,
//         },
//         name: {
//             type: String,
//             required: true,
//         },
//         description: {
//             type: String,
//             required: true,
//         },
//         image: {
//             type: String,
//             required: true,
//             default: null,
//         },
//         // shares: {
//         //     type: [ {
//         //         shareByUserId: {
//         //             type: mongoose.Schema.Types.ObjectId,
//         //             ref: 'USER'
//         //         },
//         //     } ]
//         // },
//         // images: [{
//         //     type: String,
//         //     required: true,
//         //     default: null,
//         // }],
//         // productImages: [{
//         //     type: String,
//         //     required: true,
//         //     default: null,
//         // }],

// product name
// desc
// select 3 images
// original price
// offer price
// discount
// add Qunatiyt
// add ons ----> product 1{
//     image
//     product name
//     price
// }

//         totalQuantity: {
//             type: Number,
//             required: true,
//             default: 0,
//         },
//         availableQuantity: {
//             type: Number,
//             // required: true,
//             default: 0,
//         },
//         price: {
//             type: Number,
//             required: true,
//             default: 0,
//         },
//         totalPrice: {
//             type: Number,
//             required: true,
//             default: 0,
//         },
//         discount: {
//             type: Number,
//             default: 0,
//         },
//         status: {
//             type: String,
//             enum: [ constants.STATUS.AVAILABLE, constants.STATUS.SOLD ],
//             default: constants.STATUS.AVAILABLE,
//         },
//         // verified: {
//         //     type: Boolean,
//         //     default: constants.STATUS.INACTIVE,
//         //     enum: [constants.STATUS.INACTIVE, constants.STATUS.ACTIVE],
//         //   },
//         bestDealOfferProduct: {
//             type: Boolean,
//             default: false,
//         },
//         time: {
//             type: String,
//             default: null,
//         },
//         isAvailable: {
//             type: Boolean,
//             default: true,
//         },
//     },
//     {
//         timestamps: true,
//     }
// );



// module.exports = mongoose.model( "product", productModel );
