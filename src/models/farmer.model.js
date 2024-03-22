const mongoose = require( "mongoose" );
const constants = require( "../../config/constants.json" );

const farmerModel = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            unique: true,
            default: null,
        },
        password: {
            type: String,
            default: null,
        },
        mobile: {
            type: String,
            unique: true,
            default: null,
        },
        image: {
            type: String,
            default: null,
        },
        Aadhaar_Card_Number: {
            type: String,
            default: null,
            // unique: true,
        },
        PAN_Card_Number: {
            type: String,
            default: null,
            // unique: true,
        },
        state: {
            type: String,
            default: null,
        },
        city: {
            type: String,
            default: null,
        },
        village: {
            type: String,
            default: null,
        },
        postalCode: {
            type: String,
            default: null,
        },
        streetAddress: {
            type: String,
            default: null,
        },
        farmLocation: {
            type: String,
            default: null,
        },
        role: {
            type: String,
            enum: [ constants.ROLE.USER, constants.ROLE.FARMER ],
            default: constants.ROLE.FARMER,
        },
        certificates: {
            type: [ {
                Aadhaar_Card_Front: {
                    type: String,
                    default: null,
                },
                Aadhaar_Card_Back: {
                    type: String,
                    default: null,
                },
                PAN_Card: {
                    type: String,
                    default: null,
                },
                India_Organic_Certificate: {
                    type: String,
                    default: null,
                },
                Organic_Farmer_And_Growers: {
                    type: String,
                    default: null,
                },
                National_Program_For_Sustainable_Aquaculture: {
                    type: String,
                    default: null,
                },
                Spices_BoardOrganic_Certification: {
                    type: String,
                    default: null,
                },
                Fair_Trade_India_Certification: {
                    type: String,
                    default: null,
                },
                India_Good_Agricultural_Practices: {
                    type: String,
                    default: null,
                },
                Participatory_Guarantee_System: {
                    type: String,
                    default: null,
                },
                National_Programme_On_Organic_Production: {
                    type: String,
                    default: null,
                },
                Bureau_Of_Indian_Standards: {
                    type: String,
                    default: null,
                },
                Rainfed_Area_Authority: {
                    type: String,
                    default: null,
                },
                Any_Other_Certificate: {
                    type: String,
                    default: null,
                },
            } ]
        },
        deviceToken: {
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



module.exports = mongoose.model( "farmer", farmerModel );
