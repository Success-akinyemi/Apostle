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
    const { _id, name } = req.body;

    try {
        const findCat = await CategoryModel.findOne({ slug: _id });
        if (!findCat) {
            return res.status(404).json({ success: false, data: 'Category not found' });
        }

        const oldCategory = findCat.name;

        const slugValue = name.replace(/\s+/g, '').toLowerCase();
        findCat.name = name;
        findCat.slug = slugValue;
        await findCat.save();

        const songs = await SongModel.find({ category: { $in: [oldCategory] } });

        await Promise.all(
            songs.map(async (song) => {
                song.category = song.category.map((cat) => 
                    cat === oldCategory ? name : cat
                );
                await song.save();
            })
        );

        res.status(200).json({ success: true, data: 'Category updated successfully' });
    } catch (error) {
        console.error('UNABLE TO UPDATE CATEGORY', error);
        res.status(500).json({ success: false, data: 'Unable to update category' });
    }
}

export async function getAllCategory(req, res) {
    try {
        const allCategories = await CategoryModel.find().select('-_id')

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
        const getCategory = await CategoryModel.findOne({ slug: categorySlug }).select('-_id')
        if(!getCategory){
            return res.status(404).json({ success: false, data: 'Category does not exist' })
        }

        res.status(200).json({ success: true, data: getCategory })
    } catch (error) {
        console.log('UNABLE TO GET ALL CATEGORY', error)
        res.status(500).json({ success: false, data: 'Unable to get all category'})
    }
}

export async function deleteCategory(req, res) {
    const { id } = req.body
    try {
        const deleteCategory = await CategoryModel.findOneAndDelete({ slug: id })

        res.status(201).json({ success: true, data: 'Category deleted successful' })
    } catch (error) {
        console.log('UNABLE TO DELETE CATEGORY', error)
        res.status(500).json({ success: false, data: 'Unable to delete' })
    }
}