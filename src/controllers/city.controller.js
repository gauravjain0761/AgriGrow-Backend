const cities = require( '../../helpers/cities.json' );

exports.getCityList = async ( req, res ) =>
{
    try
    {
        if ( cities )
        {
            return res.status( 200 ).json( {
                status: true,
                message: 'city list fetched successfully',
                cityList: cities
            } )
        } else
        {
            return res.status( 400 ).json( {
                status: false,
                message: 'not found!'
            } );
        }
    } catch ( error )
    {
        return res.status( 500 ).json( {
            status: false,
            message: error.message
        } )
    }
};
