import cloudinary from "cloudinary";
import multer from "multer";
import SongModel from "../model/Song.js";
import { generateUniqueCode } from "../middleware/utils.js";
import fs from "fs";
import { PassThrough } from "stream";
import RecentPlaysModel from "../model/RecentPlays.js";
import UserModel from "../model/User.js";

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 120000, // 120 seconds
});


// Configure Multer
const storage = multer.memoryStorage(); // Use memory storage for direct streaming
const upload = multer({ storage });

export const uploadMiddleware = upload.fields([
  { name: "previewUrl", maxCount: 1 },
  { name: "trackUrl", maxCount: 1 },
  { name: "trackImg", maxCount: 1 },
]);

// Convert Artists to Array
function convertArtistsToArray(artistString) {
  return artistString.split(",").map((artist) => artist.trim());
}

// Helper for uploading files to Cloudinary
function uploadToCloudinary(fileBuffer, folder, resourceType) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    const bufferStream = new PassThrough();
    bufferStream.end(fileBuffer); // End the stream with the buffer
    bufferStream.pipe(uploadStream); // Pipe the buffer to the Cloudinary stream
  });
}

// Create New Song
export async function newSong(req, res) {
  const { title, description, duration, category, lyrics, author, artists } = req.body;
  const { previewUrl, trackUrl, trackImg } = req.files || {};
    const { _id } = req.user;

  try {
    const uploadPromises = [];

    let previewUploadUrl = null;
    if (previewUrl?.[0]) {
      console.log("Uploading preview...");
      previewUploadUrl = await uploadToCloudinary(previewUrl[0].buffer, "music/previews", "video");
    }
    
    let trackUploadUrl = null;
    if (trackUrl?.[0]) {
      console.log("Uploading track...");
      trackUploadUrl = await uploadToCloudinary(trackUrl[0].buffer, "music/tracks", "video");
    }
    
    let imageUploadUrl = null;
    if (trackImg?.[0]) {
      console.log("Uploading image...");
      imageUploadUrl = await uploadToCloudinary(trackImg[0].buffer, "music/images", "image");
    }
    
    // Generate a unique ID for the song
    const generatedMusicId = await generateUniqueCode(6);
    const trackId = `APOMUS${generatedMusicId}`;
    const artistArray = artists ? convertArtistsToArray(artists) : [];

    const newSong = await SongModel.create({
      title,
      author,
      userId: _id,
      trackId,
      description,
      duration,
      previewUrl: previewUploadUrl?.secure_url || null,
      trackUrl: trackUploadUrl?.secure_url || null,
      trackImg: imageUploadUrl?.secure_url || null,
      category,
      lyrics,
      artists: artistArray,
    });

    res.status(201).json({ success: true, data: "New Song successfully added to database" });
  } catch (error) {
    console.error("Error creating song:", error);
    res.status(500).json({ success: false, data: "Unable to create new song" });
  }
}

// Update Existing Song
export async function updateSong(req, res) {
  const { id, title, description, duration, category, lyrics, author, artists } = req.body;
  const { previewUrl, trackUrl, trackImg } = req.files || {};

  try {
    const getSong = await SongModel.findOne({ trackId: id });
    if (!getSong) {
      return res.status(404).json({ success: false, data: "Song not found" });
    }

    if (req.body.trackId) {
      return res.status(403).json({ success: false, data: 'Not allowed to update "trackId"' });
    }

    const uploadPromises = [];

    let previewUploadUrl = null;
    if (previewUrl?.[0]) {
      console.log("Uploading preview...");
      previewUploadUrl = await uploadToCloudinary(previewUrl[0].buffer, "music/previews", "video");
    }
    
    let trackUploadUrl = null;
    if (trackUrl?.[0]) {
      console.log("Uploading track...");
      trackUploadUrl = await uploadToCloudinary(trackUrl[0].buffer, "music/tracks", "video");
    }
    
    let imageUploadUrl = null;
    if (trackImg?.[0]) {
      console.log("Uploading image...");
      imageUploadUrl = await uploadToCloudinary(trackImg[0].buffer, "music/images", "image");
    }
    
    // Update fields
    if (title) getSong.title = title;
    if (description) getSong.description = description;
    if (duration) getSong.duration = duration;
    if (category) getSong.category = category;
    if (lyrics) getSong.lyrics = lyrics;
    if (author) getSong.author = author;
    if (artists) getSong.artists = convertArtistsToArray(artists);

    if (previewUploadUrl) getSong.previewUrl = previewUploadUrl?.secure_url;
    if (trackUploadUrl) getSong.trackUrl = trackUploadUrl?.secure_url;
    if (imageUploadUrl) getSong.trackImg = imageUploadUrl?.secure_url;

    await getSong.save();

    res.status(200).json({ success: true, data: "Song updated successfully" });
  } catch (error) {
    console.error("Unable to update song:", error);
    res.status(500).json({ success: false, data: "An error occurred while updating the song" });
  }
}

//GET ALL SONGS
export async function getAllSongs(req, res) {
  try {
      const { page = 1, limit = 10 } = req.query;

      const total = await SongModel.countDocuments();

      const songData = await SongModel.find()
        .select('-_id')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      res.status(200).json({
          success: true,
          data: songData,
          total,
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
      });

  } catch (error) {
      console.log('UNABLE TO GET ALL SONGS', error);
      res.status(500).json({ success: false, data: 'Unable to get all songs' });
  }
}

// GET ALL SONGS FOR ADMIN WITH PAGINATION
export async function getAdminAllSongs(req, res) {
  try {
      const { page = 1, limit = 10 } = req.query;

      const { _id } = req.user;
      const query = { userId: _id };
      const total = await SongModel.countDocuments();
      const songData = await SongModel.find(query)
          .sort({ updatedAt: -1 })
          .skip((page - 1) * limit)
          .limit(parseInt(limit));
      
      res.status(200).json({
          success: true,
          data: songData,
          total, 
          currentPage: parseInt(page), 
          totalPages: Math.ceil(total / limit), 
      });
  } catch (error) {
      console.log('UNABLE TO GET ALL SONGS', error);
      res.status(500).json({ success: false, data: 'Unable to get all songs' });
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

//GET LIKED SONGS OF USER
export async function getLikedSongs(req, res) {
    const { _id } = req.user;
    const { limit = 10, page = 1 } = req.query;

    try {
        const perPage = parseInt(limit);
        const currentPage = parseInt(page);

        // Count total liked songs
        const total = await SongModel.countDocuments({ likes: _id });

        // Pagination skip index
        const skip = (currentPage - 1) * perPage;

        // Get songs the user liked
        const songs = await SongModel.find({ likes: _id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(perPage);

        return res.status(200).json({
            success: true,
            total,
            page: currentPage,
            limit: perPage,
            totalPages: Math.ceil(total / perPage),
            songs,
        });

    } catch (error) {
        console.error("GET LIKED SONGS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to get liked songs",
        });
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