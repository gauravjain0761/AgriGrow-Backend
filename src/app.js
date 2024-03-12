const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const mongoose = require( 'mongoose' );
const dotenv = require( 'dotenv' );
const app = express();

dotenv.config( { path: './.env' } );

app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: true } ) );

const URL = process.env.MONGO_URL;
mongoose.set( 'strictQuery', true );
mongoose.connect( URL );
mongoose.connection.on( 'open', () =>
{
    console.log( 'Data Base is Connected Successfully' );
} );

const userRoutes = require( './routes/user.route' );

app.use( '/api/v1/user', userRoutes );


app.get( '/', ( req, res ) => res.send( 'Welcome to Agri Grow.....' ) );

const Port = process.env.PORT || 8000;
app.listen( Port, () =>
{
    console.log( `Server is Started on PORT : http://localhost:${ Port }` )
} );
