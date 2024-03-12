const JwtStrategy = require( 'passport-jwt' ).Strategy;
const ExtractJwt = require( 'passport-jwt' ).ExtractJwt;
const User = require( '../src/models/user.model' );

module.exports = function ( passport )
{
    passport.use(
        new JwtStrategy(
            {
                secretOrKey: 'qwerty1234',
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            },
            async function ( jwt_payload, done )
            {
                try
                {
                    const user = await User.findById( jwt_payload.id );
                    if ( user )
                    {
                        return done( null, user );
                    } else
                    {
                        return done( null, false, { message: 'User not found', status: 404 } );
                    }
                } catch ( err )
                {
                    return done( err, false, { message: 'Internal Server Error', status: 500 } );
                }
            }
        )
    );
};

