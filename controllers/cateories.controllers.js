import CategoryModel from "../model/Categories.js";
import SongModel from "../model/Song.js";

export async function createCategory(req, res) {
    const { name } = req.body
    if(!name){
        return res.status(400).json({ success: false, data: 'Provide category a name'})
    }
    try {
        const slugValue = name.replace(/\s+/g, '').toLowerCase();

        const categoryExist =  await CategoryModel.findOne({ slug: slugValue })
        if(categoryExist){
            return res.status(400).json({ success: false, data: 'Category already exist' })
        }

        const makeNewCategory = await CategoryModel.create({
            name, slug: slugValue
        })

        res.status(201).json({ success: true, data: `${makeNewCategory.name} category has been added` })
    } catch (error) {
        console.log('UNABLE TO GET ALL CATEGORIES', error)
        res.status(500).json({ success: false, data: 'Unable to create category'})
    }
}

//UPDATE CATEGORY **
export async function updateCategory(req, res) {
    const { _id, name } = req.body
    try {
        const findCat = await CategoryModel.findById({ _id: _id })
        if(!findCat){
            res.status(404).json({ success: false, data: 'Category not found' })
        }

        const slugValue = name.replace(/\s+/g, '').toLowerCase();

        findCat.name = name
        findCat.slug = slugValue
        await findCat.save()

        const songs = await SongModel.find({ category: { $in: [oldCategory] } });

        // Update the category in each song
        await Promise.all(songs.map(async (song) => {
            song.category = song.category.map(cat => cat === oldCategory ? category : cat);
            await song.save();
        }));
        
        res.status(200).json({ success: true, data: `Category updated successful` })
    } catch (error) {
        console.log('UNABLE TO UPDATE CATEGORY', error)
        res.status(500).json({ success: false, data: 'Unable to update category' })
    }
}

export async function getAllCategory(req, res) {
    try {
        const allCategories = await CategoryModel.find()

        res.status(200).json({ success: true, data: allCategories })
    } catch (error) {
        console.log('UNABLE TO GET ALL CATEGORY', error)
        res.status(500).json({ success: false, data: 'Unable to get all category'})
    }
}

export async function getCategory(req, res) {
    const { categorySlug } = req.params
    if(!categorySlug){
        return res.status(400).json({ success: false, data: 'Provide a category Id' })
    }
    try {
        const getCategory = await CategoryModel.findOne({ slug: categorySlug })
        if(!getCategory){
            return res.status(404).json({ success: false, data: 'Category does not exist' })
        }

        res.status(200).json({ success: true, data: getCategory })
    } catch (error) {
        console.log('UNABLE TO GET ALL CATEGORY', error)
        res.status(500).json({ success: false, data: 'Unable to get all category'})
    }
}