import cloudinary from "cloudinary";
import multer from "multer";
import fs from "fs";
import ArtistModel from "../model/Artist.js";

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
    { name: "profileImg", maxCount: 1 },
  ]);


//create new artist
export async function createArtist(req, res) {
  const { profileImg } = req.files || {};
  const { type, name, about, description } = req.body;
  const { _id } = req.user;

  try {
    let profileImgUrl = null;

    // Upload Artist Profile Image
    if (profileImg && profileImg[0]?.path) {
      const uploadRes = await cloudinary.v2.uploader.upload(profileImg[0].path, {
        resource_type: "image",
        folder: "artist/images",
      });
      profileImgUrl = uploadRes.secure_url;
      fs.unlinkSync(profileImg[0].path);
    }

    const artist = await ArtistModel.create({
      userId: _id,
      artistId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      name,
      about,
      description,
      profileImg: profileImgUrl,
    });

    return res.status(201).json({ success: true, data: artist });
  } catch (error) {
    console.log("UNABLE TO CREATE ARTIST", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

//update artist info only by who created them
export async function updateArtist(req, res) {
  const { artistId } = req.params;
  const { _id } = req.user;
  const { profileImg } = req.files || {};
  const updates = req.body;

  try {
    const artist = await ArtistModel.findOne({ artistId });

    if (!artist) {
      return res.status(404).json({ success: false, message: "Artist not found" });
    }

    // Only creator can update
    if (artist.userId !== _id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Upload new image if included
    if (profileImg && profileImg[0]?.path) {
      const uploadRes = await cloudinary.v2.uploader.upload(profileImg[0].path, {
        resource_type: "image",
        folder: "artist/images",
      });
      updates.profileImg = uploadRes.secure_url;
      fs.unlinkSync(profileImg[0].path);
    }

    const updated = await ArtistModel.findOneAndUpdate({ artistId }, updates, {
      new: true,
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.log("UPDATE ARTIST ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

//delete artist only by who created them
export async function deleteArtist(req, res) {
  const { artistId } = req.body;
  const { _id } = req.user;

  try {
    const artist = await ArtistModel.findOne({ artistId });

    if (!artist) {
      return res.status(404).json({ success: false, message: "Artist not found" });
    }

    if (artist.userId !== _id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await ArtistModel.deleteOne({ artistId });

    return res.status(200).json({ success: true, message: "Artist deleted" });
  } catch (error) {
    console.log("DELETE ARTIST ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

//get all artists public (with pagination and queries- search, type, mostpopular(highest followers), newests)
export async function getAllArtists(req, res) {
  const { page = 1, limit = 10, search = "", type, sort } = req.query;

  try {
    const currentPage = parseInt(page);
    const perPage = parseInt(limit);

    const query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (type) {
      query.type = type;
    }

    let sortOption = { createdAt: -1 }; // default newest

    if (sort === "popular") sortOption = { followers: -1 };
    if (sort === "newest") sortOption = { createdAt: -1 };

    const total = await ArtistModel.countDocuments(query);

    const artists = await ArtistModel.find(query)
      .sort(sortOption)
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    return res.status(200).json({
      success: true,
      total,
      page: currentPage,
      limit: perPage,
      totalPages: Math.ceil(total / perPage),
      data: artists,
    });
  } catch (error) {
    console.log("GET ARTISTS ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

//get artist by artistId
export async function getArtistById(req, res) {
  const { artistId } = req.params;

  try {
    const artist = await ArtistModel.findOne({ artistId });

    if (!artist) {
      return res.status(404).json({ success: false, message: "Artist not found" });
    }

    return res.status(200).json({ success: true, data: artist });
  } catch (error) {
    console.log("GET ARTIST BY ID ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

//get all artists created by a user
export async function getMyArtists(req, res) {
  const { _id } = req.user;

  try {
    const artists = await ArtistModel.find({ userId: _id });

    return res.status(200).json({ success: true, data: artists });
  } catch (error) {
    console.log("GET MY ARTISTS ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

//folow/unfollow artist
export async function followArtist(req, res) {
  const { artistId } = req.body;
  const { _id } = req.user;

  try {
    const artist = await ArtistModel.findOne({ artistId });

    if (!artist) {
      return res.status(404).json({ success: false, message: "Artist not found" });
    }

    const userId = _id.toString();

    if (artist.followers.includes(userId)) {
      artist.followers = artist.followers.filter(id => id !== userId);
    } else {
      artist.followers.push(userId);
    }

    await artist.save();

    return res.status(200).json({ success: true, data: artist });
  } catch (error) {
    console.log("FOLLOW ARTIST ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

//like/unlike artist
export async function likeArtist(req, res) {
  const { artistId } = req.body;
  const { _id } = req.user;

  try {
    const artist = await ArtistModel.findOne({ artistId });

    if (!artist) {
      return res.status(404).json({ success: false, message: "Artist not found" });
    }

    const userId = _id.toString();

    if (artist.likes.includes(userId)) {
      artist.likes = artist.likes.filter(id => id !== userId);
    } else {
      artist.likes.push(userId);
    }

    await artist.save();

    return res.status(200).json({ success: true, data: artist });
  } catch (error) {
    console.log("LIKE ARTIST ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

//get liked artists by user
export async function getLikedArtists(req, res) {
  const { _id } = req.user;

  try {
    const artists = await ArtistModel.find({ likes: _id });

    return res.status(200).json({ success: true, data: artists });
  } catch (error) {
    console.log("GET LIKED ARTISTS ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

//get followed artists by user
export async function getFollowedArtists(req, res) {
  const { _id } = req.user;

  try {
    const artists = await ArtistModel.find({ followers: _id });

    return res.status(200).json({ success: true, data: artists });
  } catch (error) {
    console.log("GET FOLLOWED ARTISTS ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
