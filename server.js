const express = require('express');
const app = express();
var bodyParser = require('body-parser');
const cors = require('cors');
const dealsRoute = require('./routes/deals.route'); // Imports routes for the products
const userRoute = require('./routes/users.route');
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

const corsOptions = {
  exposedHeaders: 'x-auth',
};
app.use(cors(corsOptions));

app.use('/api/v1/', dealsRoute);
app.use('/api/v1/users', userRoute);

var path = require('path');
var dir = path.join(__dirname, 'public');

app.use(express.static(dir));

app.listen(3001, ()=>{
    console.log('listening on port 3001')
})




