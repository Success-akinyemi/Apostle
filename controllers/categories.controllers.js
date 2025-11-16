import cloudinary from "cloudinary";
import multer from "multer";
import fs from "fs";
import CategoryModel from "../model/Categories.js";
import SongModel from "../model/Song.js";
import GenreModel from "../model/Genre.js";

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  
  const upload = multer({ storage });
  
  export const uploadMiddleware = upload.fields([
    { name: "categoryImg", maxCount: 1 },
  ]);

export async function createCategory(req, res) {
    const { name } = req.body
    const { categoryImg } = req.files || {}; 
    if(!name){
        return res.status(400).json({ success: false, data: 'Provide category a name'})
    }
    try {
        let categoryImgUrl

        // Upload Category Image (Image) if provided
        if (categoryImg && categoryImg[0]?.path) {
            const imageUpload = await cloudinary.v2.uploader.upload(categoryImg[0]?.path, {
              resource_type: "image",
              folder: "category/images",
            });
            categoryImgUrl = imageUpload.secure_url;
            fs.unlinkSync(categoryImg[0].path);
        }

        const slugValue = name.replace(/\s+/g, '').toLowerCase();

        const categoryExist =  await CategoryModel.findOne({ slug: slugValue })
        if(categoryExist){
            return res.status(400).json({ success: false, data: 'Category already exist' })
        }

        const makeNewCategory = await CategoryModel.create({
            name, slug: slugValue, categoryImg: categoryImgUrl
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
    const { categoryImg } = req.files || {}; 

    if(!name && !categoryImg){
        return res.status(203).json({ success: false, data: 'No changes made'})
    }
    try {
        let categoryImgUrl
        
        // Upload Category Image (Image) if provided
        if (categoryImg && categoryImg[0]?.path) {
            const imageUpload = await cloudinary.v2.uploader.upload(categoryImg[0]?.path, {
              resource_type: "image",
              folder: "category/images",
            });
            categoryImgUrl = imageUpload.secure_url;
            fs.unlinkSync(categoryImg[0].path);
        }

        const findCat = await CategoryModel.findOne({ slug: _id });
        if (!findCat) {
            return res.status(404).json({ success: false, data: 'Category not found' });
        }

        const oldCategory = findCat.name;

        let slugValue
        if(name){
            slugValue = name.replace(/\s+/g, '').toLowerCase();
        }
        
        if(name) findCat.name = name;
        if(slugValue) findCat.slug = slugValue;
        if (categoryImgUrl) findCat.categoryImg = categoryImgUrl
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


/*****GENERE ****/
export async function createGenre(req, res) {
    const { name } = req.body
    const { genreImg } = req.files || {}; 
    if(!name){
        return res.status(400).json({ success: false, data: 'Provide category a name'})
    }
    try {
        let genreImgUrl

        // Upload genre Image (Image) if provided
        if (genreImg && genreImg[0]?.path) {
            const imageUpload = await cloudinary.v2.uploader.upload(genreImg[0]?.path, {
              resource_type: "image",
              folder: "genre/images",
            });
            genreImgUrl = imageUpload.secure_url;
            fs.unlinkSync(genreImg[0].path);
        }

        const slugValue = name.replace(/\s+/g, '').toLowerCase();

        const categoryExist =  await GenreModel.findOne({ slug: slugValue })
        if(categoryExist){
            return res.status(400).json({ success: false, data: 'Genre already exist' })
        }

        const makeNewCategory = await GenreModel.create({
            name, slug: slugValue, genreImg: genreImgUrl
        })

        res.status(201).json({ success: true, data: `${makeNewCategory.name} genre has been added` })
    } catch (error) {
        console.log('UNABLE TO CREATE NEW GENRE', error)
        res.status(500).json({ success: false, data: 'Unable to create genre'})
    }
}

//UPDATE CATEGORY **/
export async function updateGenre(req, res) {
    const { _id, name } = req.body;
    const { genreImg } = req.files || {}; 

    if(!name && !genreImg){
        return res.status(203).json({ success: false, data: 'No changes made'})
    }
    try {
        let categoryImgUrl
        
        // Upload Category Image (Image) if provided
        if (genreImg && genreImg[0]?.path) {
            const imageUpload = await cloudinary.v2.uploader.upload(genreImg[0]?.path, {
              resource_type: "image",
              folder: "genre/images",
            });
            categoryImgUrl = imageUpload.secure_url;
            fs.unlinkSync(genreImg[0].path);
        }

        const findCat = await GenreModel.findOne({ slug: _id });
        if (!findCat) {
            return res.status(404).json({ success: false, data: 'Category not found' });
        }

        const oldCategory = findCat.name;

        let slugValue
        if(name){
            slugValue = name.replace(/\s+/g, '').toLowerCase();
        }
        
        if(name) findCat.name = name;
        if(slugValue) findCat.slug = slugValue;
        if (categoryImgUrl) findCat.genreImg = categoryImgUrl
        await findCat.save();

        const songs = await SongModel.find({ genre: { $in: [oldCategory] } });

        await Promise.all(
            songs.map(async (song) => {
                song.category = song.category.map((cat) => 
                    cat === oldCategory ? name : cat
                );
                await song.save();
            })
        );

        res.status(200).json({ success: true, data: 'Genre updated successfully' });
    } catch (error) {
        console.error('UNABLE TO UPDATE GENRE', error);
        res.status(500).json({ success: false, data: 'Unable to update genre' });
    }
}

export async function getAllGenre(req, res) {
    try {
        const allGenries = await GenreModel.find().select('-_id')

        res.status(200).json({ success: true, data: allGenries })
    } catch (error) {
        console.log('UNABLE TO UPDATE GENRE', error)
        res.status(500).json({ success: false, data: 'Unable to get all genre'})
    }
}

export async function getGenre(req, res) {
    const { genreSlug } = req.params
    if(!genreSlug){
        return res.status(400).json({ success: false, data: 'Provide a genre Id' })
    }
    try {
        const getGenre = await GenreModel.findOne({ slug: genreSlug }).select('-_id')
        if(!getGenre){
            return res.status(404).json({ success: false, data: 'Genre does not exist' })
        }

        res.status(200).json({ success: true, data: getCategory })
    } catch (error) {
        console.log('UNABLE TO GET ALL GENRE', error)
        res.status(500).json({ success: false, data: 'Unable to get all genre'})
    }
}

export async function deleteGenre(req, res) {
    const { id } = req.body
    try {
        const deleteCategory = await GenreModel.findOneAndDelete({ slug: id })

        res.status(201).json({ success: true, data: 'Genre deleted successful' })
    } catch (error) {
        console.log('UNABLE TO DELETE GENRE', error)
        res.status(500).json({ success: false, data: 'Unable to delete' })
    }
}