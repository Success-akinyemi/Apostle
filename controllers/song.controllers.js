import cloudinary from "cloudinary";
import multer from "multer";
import fs from "fs";
import SongModel from "../model/Song.js";
import { generateUniqueCode, shuffleArray } from "../middleware/utils.js";
import CategoryModel from "../model/Categories.js";
import RecentPlaysModel from "../model/RecentPlays.js";

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

function convertArtistsToArray(artistString) {
  return artistString.split(',').map(artist => artist.trim());
}

export async function newSong(req, res) {
    const { title, description, duration, category, lyrics, author, artists } = req.body;
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

      //covert artists to an array
      const artistArray = convertArtistsToArray(artists);
  
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
        artists: artistArray
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
    const { id, title, description, duration, category, lyrics, author, artists } = req.body;
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

        let newArtist
        if(artists){
          //convetr artists to array
          newArtist = convertArtistsToArray(artists);
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
        if(artists) getSong.artists = newArtist

        await getSong.save()

        res.status(200).json({ success: true, data: 'Song updated successful' })
    } catch (error) {
        console.log('UNABLE TO UPDATE MUSIC', error)
    }
}

//GET ALL SONGS
export async function getAllSongs(req, res) {
    try {
        const songData = await SongModel.find().select('-_id -lyrics -trackUrl -likes')

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
    const { _id } = req.user
    try {
        if(!id){
            return res.status(400).json({ success: false, data: 'Provide a Id' })
        }
        const songData = await SongModel.findOne({ trackId: id }).select('-_id -lyrics')

        if(!songData){
            return res.status(404).json({ success: false, data: 'Song with this id does not exist' })
        }

        // GET USER RECENT PLAYS
        const userRecentPlays = await RecentPlaysModel.findOne({ userId: _id });

        if (userRecentPlays) {
          if (!userRecentPlays.recentPlays.includes(id)) {
            userRecentPlays.recentPlays.unshift(id); 
            await userRecentPlays.save();
          }
        } else {
          const newUserRecentPlays = await RecentPlaysModel.create({
            userId: _id,
            recentPlays: [id], 
          });
          await newUserRecentPlays.save();
        }

        const likes = songData?.likes.length;

        const { likes: _, ...rest } = songData.toObject(); 
        const data = { ...rest, likes };

        res.status(200).json({ success: true, data: data })
    } catch (error) {
        console.log('UNABLE TO GET ALL SONGS', error)
        res.status(500).json({ success: false, data: 'Unable to get song' })
    }
}

// GET RECENT PLAYS
export async function getRecentPlays(req, res) {
  const { _id } = req.user;
  try {
    const getUserRecentPlays = await RecentPlaysModel.findOne({ userId: _id });
    if (!getUserRecentPlays) {
      return res.status(200).json({ success: true, data: [] }); // Return empty array for no recent plays
    }

    const trackIds = getUserRecentPlays.recentPlays;

    // Fetch songs matching the track IDs and ensure the order is maintained
    const songs = await SongModel.find({ trackId: { $in: trackIds } }).select(`-_id -lyrics -trackUrl -likes`);

    // Sort the songs to match the order in trackIds
    const orderedSongs = trackIds.map(trackId =>
      songs.find(song => song.trackId.toString() === trackId.toString())
    );

    const topSongs = orderedSongs.splice(0, 20)
    return res.status(200).json({ success: true, data: topSongs });
  } catch (error) {
    console.error('UNABLE TO GET RECENT PLAYS SONG FOR USER', error);
    return res
      .status(500)
      .json({ success: false, data: 'Unable to get your recent plays' });
  }
}

// GET QUICK PICKS SONG (RANDOMLY GET SONGS)
export async function getQuickPicks(req, res) {
  try {
    const randomSongs = await SongModel.aggregate([
      { $sample: { size: 20 } },
      {
        $project: {
          _id: 0, 
          lyrics: 0, 
          trackUrl: 0, 
          likes: 0
        },
      },
    ]);

    res.status(200).json({ success: true, data: randomSongs });
  } catch (error) {
    console.error('UNABLE TO GET RANDOM SONGS', error);
    res.status(500).json({ success: false, data: 'Unable to get random songs' });
  }
}

// GET NEW RELEASES
export async function getNewRelease(req, res) {
  try {
    const newReleases = await SongModel.find()
      .sort({ createdAt: -1 }) 
      .limit(20) 
      .select('-_id -lyrics -trackUrl -likes'); 

    res.status(200).json({ success: true, data: newReleases });
  } catch (error) {
    console.error('UNABLE TO GET NEW RELEASE SONGS', error);
    res.status(500).json({ success: false, data: 'Unable to get new release songs' });
  }
}

// GET RECOMMENDED
export async function getRecommended(req, res) {
  const { _id } = req.user;

  try {
    const getUserRecentPlays = await RecentPlaysModel.findOne({ userId: _id });

    if (!getUserRecentPlays) {
      // Return random songs if no recent plays
      const randomSongs = await SongModel.aggregate([
        { $sample: { size: 20 } },
        {
          $project: {
            _id: 0,
            lyrics: 0,
            trackUrl: 0,
          },
        },
      ]);

      return res.status(200).json({ success: true, data: randomSongs });
    }

    const trackIds = getUserRecentPlays.recentPlays;

    const songs = await SongModel.find({ trackId: { $in: trackIds } });

    // Order songs according to trackIds order
    const orderedSongs = trackIds.map(trackId =>
      songs.find(song => song.trackId.toString() === trackId.toString())
    );

    // Select the top 20 recent songs
    const topSongs = shuffleArray(orderedSongs);

    // Step 1: Randomly select 10 from topSongs
    const randomTopSongs = shuffleArray(topSongs).slice(0, 10);

    // Extract unique artists and categories
    const artists = [
      ...new Set(randomTopSongs.flatMap(song => song?.artists || [])),
    ];
    const categories = [
      ...new Set(randomTopSongs.flatMap(song => song?.categories || [])),
    ];

    // Step 2: Find songs with similar artists
    const artistSongs = await SongModel.find({
      artists: { $in: artists },
      //trackId: { $nin: trackIds }, // Exclude songs in recent plays
    })
      .select('-_id -lyrics -trackUrl')
      .limit(10);

    // Step 3: Find songs with similar categories
    const categorySongs = await SongModel.find({
      categories: { $in: categories },
      //trackId: { $nin: trackIds }, // Exclude songs in recent plays
    })
      .select('-_id -lyrics -trackUrl -likes')
      .limit(10);

    // Combine artistSongs and categorySongs, shuffle and limit to 20
    const recommendations = shuffleArray([
      ...artistSongs,
      ...categorySongs,
    ]).slice(0, 20);

    return res.status(200).json({ success: true, data: recommendations });
  } catch (error) {
    console.error('UNABLE TO GET RECOMMENDED SONGS', error);
    return res
      .status(500)
      .json({ success: false, data: 'Unable to get recommended songs' });
  }
}

//GET A SONG LYRICS
export async function getSongLyrics(req, res) {
  const { id } = req.params
  try {
      if(!id){
          return res.status(400).json({ success: false, data: 'Provide a Id' })
      }
      const songData = await SongModel.findOne({ trackId: id })

      if(!songData){
          return res.status(404).json({ success: false, data: 'Song with this id does not exist' })
      }
      
      const songLyrics = songData?.lyrics

      res.status(200).json({ success: true, data: songLyrics })
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
        }).select(`-_id -lyrics -likes -trackUrl`)

        res.status(200).json({ success: true, data: songs })
    } catch (error) {
        console.log('UNABLE TO GET SONGS WITH CATEGORY', error)
        res.status(500).json('Unable to get songs with category')
    }
}

// GET SONG WITH SEARCH QUERY
export async function getSongWithQuery(req, res) {
  const { query } = req.params;
  try {
    const songs = await SongModel.find({
      $text: { $search: query }
    }).select('-_id -lyrics -trackUrl -likes');

    if (songs.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    return res.status(200).json({ success: true, data: songs });
  } catch (error) {
    console.log('UNABLE TO GET SONGS WITH SEARCH QUERY', error);
    res.status(500).json({ success: false, data: 'Unable to get song' });
  }
}

// HANDLE LIKE SONG
export async function handleLike(req, res) {
  const { trackId } = req.body;
  const { _id } = req.user;

  try {
    if (!trackId) {
      return res.status(400).json({ success: false, data: 'Provide a track ID' });
    }

    const songData = await SongModel.findOne({ trackId: trackId });

    if (!songData) {
      return res.status(404).json({ success: false, data: 'Song with this ID does not exist' });
    }

    songData.likes = songData.likes.filter(userId => userId);

    const userIndex = songData.likes.findIndex(userId => userId.toString() === _id.toString());

    if (userIndex === -1) {
      songData.likes.unshift(_id);
    } else {
      songData.likes.splice(userIndex, 1);
    }

    await songData.save();

    res.status(200).json({ success: true, data: 'success' });
  } catch (error) {
    console.error('UNABLE TO HANDLE LIKE', error);
    res.status(500).json({ success: false, data: 'Unable to handle like' });
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

export async function deleteAm(req, res) {
  try {
    const deleteAm = await RecentPlaysModel.deleteMany()

    res.status(200).json({ success: true, data: 'DELETED'})
  } catch (error) {
    console.log('DELETEION ERROR', error)
    res.end()
  }
}