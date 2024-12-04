import mongoose from "mongoose";

const RecentPlaySchema = new mongoose.Schema({
    userId: {
        type: String
    },
    link: {
        type: string
    }
})

const RecentPlayModel = mongoose.model('recentplay', RecentPlaySchema)
export default RecentPlayModel