const mongoose = require('mongoose');
require('dotenv/config');

// Tworzenie polaczenia z baza danych
const options = {
  useNewUrlParser: true ,
  useUnifiedTopology: true
}
var dbconnection = mongoose.connect(process.env.DB_CONNECTION, options);


// Export the model
module.exports = dbconnection;