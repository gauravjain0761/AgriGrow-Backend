exports.farmerRoleMiddleware = (req, res, next) => {
    if (req.user.role !== 'FARMER') {
        return res.status(403).json({
            status: false,
            message: 'Only farmers are allowed to perform this action!'
        })
    };
    next();
};

exports.userRoleMiddleware = (req, res, next) => {
    if (req.user.role !== 'USER') {
        return res.status(403).json({
            status: false,
            message: 'Only users are allowed to perform this action!'
        })
    };
    next();
};

exports.ccRoleMiddleware = (req, res, next) => {
    if (req.user.role !== 'COLLECTION_CENTER') {
        return res.status(403).json({
            status: false,
            message: 'Only cc are allowed to perform this action!'
        })
    };
    next();
};

exports.driverRoleMiddleware = (req, res, next) => {
    if (req.user.role !== 'DRIVER') {
        return res.status(403).json({
            status: false,
            message: 'Only drivers are allowed to perform this action!'
        })
    };
    next();
};
