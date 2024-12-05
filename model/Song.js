import mongoose from "mongoose";

const SongSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Song Title is required']
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
    }
})

const SongModel = mongoose.model('song', SongSchema)
export default SongModel