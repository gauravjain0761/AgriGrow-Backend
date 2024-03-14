const feedbackModel = require( '../models/feedback.model' );

// addFeedback
exports.addFeedback = async ( req, res ) =>
{
    try
    {
        const { rating, feedback } = req.body;
        const newFeedback = new feedbackModel( {
            userId: req.user._id,
            rating: rating,
            feedback: feedback,
        } );

        await newFeedback.save();
        return res.status( 201 ).json( {
            status: true,
            message: 'successfully created',
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

