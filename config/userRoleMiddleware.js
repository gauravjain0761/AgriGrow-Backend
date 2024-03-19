exports.farmerRoleMiddleware = ( req, res, next ) =>
{
    if ( req.user.role !== 'FARMER' )
    {
        return res.status( 403 ).json( {
            status: false,
            message: 'Only farmers are allowed to perform this action!'
        } )
    };
    next();
};

exports.userRoleMiddleware = ( req, res, next ) =>
{
    if ( req.user.role !== 'USER' )
    {
        return res.status( 403 ).json( {
            status: false,
            message: 'Only users are allowed to perform this action!'
        } )
    };
    next();
};
