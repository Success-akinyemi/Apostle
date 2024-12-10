import mongoose from "mongoose";

const TopArtistSchema = new mongoose.Schema({
    userId: {
        type: String
    },
    artist: [
        {
            name: '',
        }
    ]
},
{ timestamps: true})

const TopArtistModel = mongoose.model('topAirtist', TopArtistSchema)
export default TopArtistModel