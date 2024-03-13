const categoryModel = require( '../models/category.model' );

// addCategory
exports.addCategory = async ( req, res ) =>
{
    try
    {
        const { name } = req.body;

        const category = new categoryModel( {
            name: name,
        } );

        await category.save();
        return res.status( 201 ).json( {
            status: true,
            message: 'successfully created',
            data: category
        } );
    } catch ( error )
    {
        return res.status( 500 ).json( {
            status: false,
            message: error.message,
        } );
    }
};

// get all category
exports.getAllCategory = async ( req, res ) =>
{
    try
    {
        const category = await categoryModel.find( { isAvailable: true } );
        if ( !category )
        {
            return res.status( 404 ).json( {
                status: false,
                message: "not found!",
            } )
        };
        const totalDocuments = await categoryModel.countDocuments();

        return res.status( 200 ).json( {
            status: true,
            message: 'successfully fetched category list',
            totalDocuments: totalDocuments,
            data: category
        } );
    } catch ( error )
    {
        return res.status( 500 ).json( {
            status: false,
            message: error.message,
        } );
    }
};

