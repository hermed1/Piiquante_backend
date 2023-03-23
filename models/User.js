// Import the required modules
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// Create a Mongoose schema for the user
const userSchema = mongoose.Schema({
  // Define the email field as a string, required, and unique
  email: { type: String, required: true, unique: true },
  // Define the password field as a string and required
  password: { type: String, required: true },
});

// Apply the unique-validator plugin to the user schema to handle unique constraints
userSchema.plugin(uniqueValidator);

// Export the User model, which is created based on the user schema
module.exports = mongoose.model('User', userSchema);
