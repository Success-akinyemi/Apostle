import mongoose from "mongoose";

const SongSchema = new mongoose.Schema({
    trackImg: {
        type: String,
        required: [true, 'Provide a cover image for track']
    },
    title: {
        type: String,
        required: [true, 'Song Title is required']
    },
    author: {
        type: String,
        required: [true, 'Song Author is required']
    },
    artists: {
        type: Array
    },
    trackId: {
        type: String,
        required: [true, 'track Id is required'],
        unique: [ true, 'Track Id must be unique']
    },
    description: {
        type: String,
    },
    duration: {
        type: String
    },
    previewUrl: {
        type: String
    },
    trackUrl: {
        type: String,
        required: [ true, 'Song/Track Url is required' ]
    },
    category: {
        type: Array,
        required: [ true, 'at least one category is Required']
    },
    lyrics: {
        type: String
    },
    likes: {
        type: Array
    }
},
{ timestamps: true}
)

SongSchema.index({ title: 'text' });

const SongModel = mongoose.model('song', SongSchema)
export default SongModel