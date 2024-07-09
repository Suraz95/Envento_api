const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    prod_name: { type: String, required: true },
    brand: { type: String, required: true },
    weight: { type: Number, required: true },
    speciality: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true }
});

const subCategorySchema = new mongoose.Schema({
    subCat_name: { type: String, required: true },
    products: [productSchema]
});

const categorySchema = new mongoose.Schema({
    cat_name: { type: String, required: true },
    subCategories: [subCategorySchema]
});

const Products = mongoose.model('Category', categorySchema);

module.exports = {Products};
