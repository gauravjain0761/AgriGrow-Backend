const feedbackModel = require( '../models/feedback.model' );
const productModel = require( '../models/product.model' );

// addFeedback
exports.addFeedback = async ( req, res ) =>
{
    try
    {
        const { productId } = req.params;
        const product = await productModel.findOne( { productId: productId } );
        if ( !product )
        {
            return res.status( 404 ).json( {
                status: false,
                message: 'product not found'
            } )
        };

        const { rating, feedback } = req.body;
        if ( rating > 5 || rating < 1 )
        {
            return res.status( 400 ).json( {
                status: false,
                message: 'product rating should be in between 1 to 5'
            } )
        };

        const newFeedback = new feedbackModel( {
            userId: req.user._id,
            productId: productId,
            rating: rating,
            feedback: feedback,
        } );

        await newFeedback.save();
        return res.status( 201 ).json( {
            status: true,
            message: 'successfully added',
            data: newFeedback
        } );
    } catch ( error )
    {
        return res.status( 500 ).json( {
            status: false,
            message: error.message,
        } );
    }
};

// get all feedback
exports.getAllFeedback = async ( req, res ) =>
{
    try
    {
        const feedback = await feedbackModel.find( { isAvailable: true } );
        if ( !feedback )
        {
            return res.status( 404 ).json( {
                status: false,
                message: "not found!",
            } )
        };
        const totalDocuments = await feedbackModel.countDocuments();

        return res.status( 200 ).json( {
            status: true,
            message: 'successfully fetched feedback list',
            totalDocuments: totalDocuments,
            data: feedback
        } );
    } catch ( error )
    {
        return res.status( 500 ).json( {
            status: false,
            message: error.message,
        } );
    }
};

