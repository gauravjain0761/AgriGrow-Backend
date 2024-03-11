const express = require( 'express' );
const app = express();

app.get( '/', ( req, res ) => res.send( 'Welcome to Agri Grow.....' ) );


const Port = process.env.PORT || 8000;
app.listen( Port, () =>
    console.log( `Server is Started on PORT : http://localhost:${ Port }` )
);
