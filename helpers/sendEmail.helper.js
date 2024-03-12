const nodemailer = require( 'nodemailer' );

exports.sendOtp = async ( user ) =>
{
    try
    {
        const transporter = nodemailer.createTransport( {
            service: 'gmail',
            auth: {
                user: process.env.USER_EMAIL,  // Your Gmail email address
                pass: process.env.USER_PASS         // Your Gmail password or an app-specific password
            }
        } );

        // Setup email data
        const mailOptions = {
            from: process.env.USER_EMAIL,
            to: user.email,
            subject: 'Reset Password OTP',
            html: `<p>Hi <b> ${ user.name }</b>,</p>
           <p>If you did not make this request then please ignore this email.</p>
           <p>Otherwise, please Use your secret code!</p>
           <p>Verification Code : <b>${ user.otp }</b> </p>
           <p>It is valid for only 10 minutes.</p>`,
        };

        transporter.sendMail( mailOptions, ( error, info ) =>
        {
            if ( error )
            {
                console.error( 'Error:', error.message );
            } else
            {
                console.log( 'Email sent:', info.response );
            }
        } );
    } catch ( error )
    {
        return res.status( 500 ).send( {
            status: false,
            message: error.message,
        } );
    }
};
