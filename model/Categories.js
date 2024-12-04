import mongoose from "mongoose";

const CategoriesSchema = new mongoose.Schema({
    name: {
        type: String
    },
    slug: {
        type: String
    }
})

const CategoryModel = mongoose.model('categories', CategoriesSchema)
export default CategoryModel