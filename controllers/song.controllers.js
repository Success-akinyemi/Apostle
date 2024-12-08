import cloudinary from "cloudinary";
import multer from "multer";
import fs from "fs";
import SongModel from "../model/Song.js";
import { generateUniqueCode } from "../middleware/utils.js";
import CategoryModel from "../model/Categories.js";

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
  { name: "previewUrl", maxCount: 1 },
  { name: "trackUrl", maxCount: 1 },
  { name: "trackImg", maxCount: 1 },
]);

export async function newSong(req, res) {
    const { title, description, duration, category, lyrics, author } = req.body;
    const { previewUrl, trackUrl, trackImg } = req.files || {}; 
  
    try {
      let previewUploadUrl = '';
      let trackUploadUrl = '';
      let imageUploadUrl = '';
  
      // Upload Preview URL (Audio) if provided
      if (previewUrl && previewUrl[0]?.path) {
        const previewUpload = await cloudinary.v2.uploader.upload(previewUrl[0]?.path, {
          resource_type: "video",
          folder: "music/previews",
        });
        previewUploadUrl = previewUpload.secure_url;
        fs.unlinkSync(previewUrl[0].path);
      }
  
      // Upload Track URL (Audio) if provided
      if (trackUrl && trackUrl[0]?.path) {
        const trackUpload = await cloudinary.v2.uploader.upload(trackUrl[0]?.path, {
          resource_type: "video",
          folder: "music/tracks",
        });
        trackUploadUrl = trackUpload.secure_url;
        fs.unlinkSync(trackUrl[0].path);
      }
  
      // Upload Track Image (Image) if provided
      if (trackImg && trackImg[0]?.path) {
        const imageUpload = await cloudinary.v2.uploader.upload(trackImg[0]?.path, {
          resource_type: "image",
          folder: "music/images",
        });
        imageUploadUrl = imageUpload.secure_url;
        fs.unlinkSync(trackImg[0].path);
      }
  
      const generatedMusicId = await generateUniqueCode(6);
      const trackId = `APOMUS${generatedMusicId}`;
      console.log('MUSIC ID>>', trackId);
  
      const newSong = await SongModel.create({
        title,
        author,
        trackId,
        description,
        duration,
        previewUrl: previewUploadUrl,
        trackUrl: trackUploadUrl,
        trackImg: imageUploadUrl,
        category,
        lyrics,
      });
  
      console.log('SONG UPLOADED SUCCESSFUL');
      res.status(201).json({ success: true, data: 'New Song successfully added to database' });
    } catch (error) {
      console.error("UNABLE TO CREATE NEW SONG", error);
      res.status(500).json({ success: false, data: "Unable to create new song" });
    }
  }
  
//UPDATE SONG
export async function updateSong(req, res) {
    const { id, title, description, duration, category, lyrics, author } = req.body;
    const { previewUrl, trackUrl, trackImg } = req.files || {};
    try {
        const getSong = await SongModel.findOne({ trackId: id })
        if(!getSong){
            return res.status(404).json({ success: false, data: 'Song noy found'})
        }
        if(req.body.trackId){
            return res.status(403).json({ success: false, data: 'Not Allowed to update "trackId"'})
        }

        let previewUploadUrl = '';
        let trackUploadUrl = '';
        let imageUploadUrl = '';
    
        // Upload Preview URL (Audio) if provided
        if (previewUrl && previewUrl[0]?.path) {
          const previewUpload = await cloudinary.v2.uploader.upload(previewUrl[0]?.path, {
            resource_type: "video",
            folder: "music/previews",
          });
          previewUploadUrl = previewUpload.secure_url;
          fs.unlinkSync(previewUrl[0].path);
        }
    
        // Upload Track URL (Audio) if provided
        if (trackUrl && trackUrl[0]?.path) {
          const trackUpload = await cloudinary.v2.uploader.upload(trackUrl[0]?.path, {
            resource_type: "video",
            folder: "music/tracks",
          });
          trackUploadUrl = trackUpload.secure_url;
          fs.unlinkSync(trackUrl[0].path);
        }
    
        // Upload Track Image (Image) if provided
        if (trackImg && trackImg[0]?.path) {
          const imageUpload = await cloudinary.v2.uploader.upload(trackImg[0]?.path, {
            resource_type: "image",
            folder: "music/images",
          });
          imageUploadUrl = imageUpload.secure_url;
          fs.unlinkSync(trackImg[0].path);
        }

        if (title) getSong.title = title
        if (author) getSong.author = author
        if (description) getSong.description = description
        if (previewUploadUrl) getSong.previewUrl = previewUploadUrl
        if (trackUploadUrl) getSong.trackUrl = trackUploadUrl
        if (imageUploadUrl) getSong.trackImg = imageUploadUrl
        if (category) getSong.category = category
        if (lyrics) getSong.lyrics = lyrics
        if(duration) getSong.duration = duration

        await getSong.save()

        res.status(200).json({ success: true, data: 'Song updated successful' })
    } catch (error) {
        console.log('UNABLE TO UPDATE MUSIC', error)
    }
}

//GET ALL SONGS
export async function getAllSongs(req, res) {
    try {
        const songData = await SongModel.find().select('-_id -lyrics')

        res.status(200).json({ success: true, data: songData })
    } catch (error) {
        console.log('UNABLE TO GET ALL SONGS', error)
        res.status(500).json({ success: false, data: 'Unable to get all songs' })
    }
}

//GET ALL SONGS FOR ADMIN
export async function getAdminAllSongs(req, res) {
    try {
        const songData = await SongModel.find()

        res.status(200).json({ success: true, data: songData })
    } catch (error) {
        console.log('UNABLE TO GET ALL SONGS', error)
        res.status(500).json({ success: false, data: 'Unable to get all songs' })
    }
}

//GET A SONG
export async function getASongs(req, res) {
    const { id } = req.params
    try {
        if(!id){
            return res.status(400).json({ success: false, data: 'Provide a Id' })
        }
        const songData = await SongModel.findOne({ trackId: id }).select('-_id -lyrics')

        if(!songData){
            return res.status(404).json({ success: false, data: 'Song with this id does not exist' })
        }

        res.status(200).json({ success: true, data: songData })
    } catch (error) {
        console.log('UNABLE TO GET ALL SONGS', error)
        res.status(500).json({ success: false, data: 'Unable to get song' })
    }
}

//GET A SONG FOR ADMIN
export async function getAdminASongs(req, res) {
    const { id } = req.params
    try {
        if(!id){
            return res.status(400).json({ success: false, data: 'Provide a Id' })
        }
        const songData = await SongModel.findOne({ trackId: id })

        if(!songData){
            return res.status(404).json({ success: false, data: 'Song with this id does not exist' })
        }

        res.status(200).json({ success: true, data: songData })
    } catch (error) {
        console.log('UNABLE TO GET ALL SONGS', error)
        res.status(500).json({ success: false, data: 'Unable to get song' })
    }
}

//GET SONG WITH CATEGORY
export async function getSongByCategory(req, res) {
    const { category } = req.params
    if(!category){
        return res.status(400).json({ success: false, data: 'Provide a category' })
    }
    try {
        const catSlug = await CategoryModel.findOne({ name: category })
        if(!catSlug){
            return res.status(404).json({ success: false, data: 'Category does Not exist'})
        }

        const songs = await SongModel.find({
            category: { $in: catSlug?.name }, 
        }).select(`-_id -lyrics`)

        res.status(200).json({ success: true, data: songs })
    } catch (error) {
        console.log('UNABLE TO GET SONGS WITH CATEGORY', error)
        res.status(500).json('Unable to get songs with category')
    }
}

//DELETE SONG
export async function deleteSongs(req, res) {
    const { id } = req.body
    console.log('object', id)
    try {
        const deleteSong = await SongModel.findOneAndDelete({ trackId: id })

        res.status(201).json({ success: true, data: 'Song deleted Successful' })
    } catch (error) {
        console.log('UNABLE TO DELETE SONGS', error)
        res.status(500).json({ success: false, data: 'Unable to delete song' })
    }
}