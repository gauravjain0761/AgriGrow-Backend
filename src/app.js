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
    console.log( 'MongoDB has connected successfully' );
} );

const userRoutes = require( './routes/user.route' );
const farmerRoutes = require( './routes/farmer.route' );
const productRoutes = require( './routes/product.route' );
const favoriteProductRoutes = require( './routes/favoriteProduct.route' );
const cartRoutes = require( './routes/cart.route' );
const cityRoutes = require( './routes/city.route' );
const categoryRoutes = require( './routes/category.route' );
const feedbackRoutes = require( './routes/feedback.route' );

app.use( '/api/v1/user', userRoutes );
app.use( '/api/v1/farmer', farmerRoutes );
app.use( '/api/v1/product', productRoutes );
app.use( '/api/v1/favoriteProduct', favoriteProductRoutes );
app.use( '/api/v1/cart', cartRoutes );
app.use( '/api/v1/city', cityRoutes );
app.use( '/api/v1/category', categoryRoutes );
app.use( '/api/v1/feedback', feedbackRoutes );


app.use( '/uploads', express.static( 'uploads' ) );

app.get( '/', ( req, res ) => res.send( 'Welcome to Agri Grow.....' ) );

const Port = process.env.PORT || 8000;
app.listen( Port, () =>
{
    console.log( `Server is started on PORT : http://localhost:${ Port }` )
} );




// Product buy sell data will be save in DB or not
// Best product
// Best deal offer product



