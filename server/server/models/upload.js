let mongoose = require('mongoose');

const Schema = mongoose.Schema;

//creating an upload schema
let uploadSchema = new mongoose.Schema({
    title: String,
    description: String,
    image: String,
    image_id: String,
    created_at: Date
});

//creating a model for upload schema
let Upload = mongoose.model('Upload', uploadSchema);

//exporting the upload for use
module.exports = {Upload};