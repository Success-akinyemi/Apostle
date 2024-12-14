import PlayListModel from "../model/PlayList.js"
import SongModel from "../model/Song.js"

export async function newPlayList(req, res) {
    const { name } = req.body
    const { _id } = req.user
    if(!name){
        return res.status(400).json({ success: false, data: 'Provide a play list name'})
    }
    try {
        const newPlayList = await PlayListModel.create({
            name, userId: _id
        })

        res.status(201).json({ success: true, data: 'New Play list created'})
    } catch (error) {
        console.log('UNABLE TO CREATE NEW PLAY LIST', error)
        res.status(500).json({ success: false, data: 'Unable to create Play list'})
    }
}

export async function addToPlayList(req, res) {
    const { _id, trackId } = req.body
    const { _id: userId } = req.user
    if(!_id){
        return res.status(400).json({ success: false, data: 'Provide a play list Id'})
    }
    if(!trackId){
        return res.status(400).json({ success: false, data: 'Provide Track Id' })
    }
    try {
        const playList = await PlayListModel.findById({ _id: _id })
        
        if (userId.toString() !== playList.userId.toString()) {
            return res.status(403).json({ success: false, data: 'Not allowed: Permission Denied' });
        }
        if(!playList){
            return res.status(404).json({ success: false, data: 'Play list does not exist'})
        }

        playList.tracksId.push(trackId)
        await playList.save()

        res.status(201).json({ success: true, data: 'New track added to Play list'})
    } catch (error) {
        console.log('UNABLE TO CREATE NEW PLAY LIST', error)
        res.status(500).json({ success: false, data: 'Unable to create Play list'})
    }
}

export async function deletePlayList(req, res) {
    const { _id } = req.body
    const { _id: userId } = req.user
    try {
        
        const playList = await PlayListModel.findById({ _id: _id })

        if (userId.toString() !== playList.userId.toString()) {
            return res.status(403).json({ success: false, data: 'Not allowed: Permission Denied' });
        }

        if(!playList){
            return res.status(404).json({ success: false, data: 'Play list does not exist'})
        }

        const deletePlayList = await PlayListModel.findByIdAndDelete({ _id: _id })

        res.status(201).json({ success: true, data: 'Play List Deleted successful'})
    } catch (error) {
        console.log('UNABLE TO DELETE PLAYLIST', error)
        res.status(500).json({ success: false, data: 'Unable to delete playlist' })
    }
}

export async function removeTrackFromPlayList(req, res) {
    const { _id, trackId } = req.body;
    const { _id: userId } = req.user;
    if(!_id){
        return res.status(400).json({ success: false, data: 'Provide a play list Id'})
    }
    if(!trackId){
        return res.status(400).json({ success: false, data: 'Provide Track Id' })
    }
    try {
      const playList = await PlayListModel.findById({ _id: _id });
  
      if (userId.toString() !== playList.userId.toString()) {
        return res.status(403).json({ success: false, data: 'Not allowed: Permission Denied' });
      }
  
      const updatedPlaylist = await PlayListModel.findByIdAndUpdate(
        { _id: _id }, 
        { $pull: { tracksId: trackId } }, 
        { new: true } 
      );
  
      if (!updatedPlaylist) {
        return res.status(404).json({ success: false, data: 'Playlist not found' });
      }
  
      return res.status(200).json({ success: true, data: 'Track removed from playlist' });
    } catch (error) {
      console.log('UNABLE TO REMOVE TRACK FROM PLAYLIST', error);
      res.status(500).json({ success: false, data: 'Unable to delete track from playlist' });
    }
}

export async function getUserAllPlayList(req, res) {
    const { _id } = req.user
    if(!_id){
        return res.status(400).json({ success: false, data: 'Provide a Id'})
    }
    try {
        const userPlayList = await PlayListModel.find({ userId: _id })     
        
        res.status(200).json({ success: true, data: userPlayList })
    } catch (error) {
        console.log('UNABLE TO GET USER PLAY LIST', error)
        res.status(500).josn({ success: false, data: 'Unable to get user play lists' })
    }
}

export async function getUserPlayList(req, res) {
    const { _id: playListId } = req.params;
    const { _id } = req.user;

    if (!playListId) {
        return res.status(400).json({ success: false, data: 'Provide an ID' });
    }

    try {
        const userPlayList = await PlayListModel.findById({ _id: playListId });

        if (!userPlayList) {
            return res.status(404).json({ success: false, data: 'Playlist does not exist' });
        }

        const tracksArray = userPlayList?.tracksId;
        const songs = await SongModel.find({ trackId: { $in: tracksArray } }).select(`-_id -lyrics -trackUrl`);

        const processedSongs = songs.map(song => ({
            ...song._doc,
            likes: song.likes ? song.likes.length : 0 
        }));

        const data = {
            name: userPlayList?.name,
            tracks: processedSongs
        };

        res.status(200).json({ success: true, data: data });
    } catch (error) {
        console.error('UNABLE TO GET USER PLAYLIST', error);
        res.status(500).json({ success: false, data: 'Unable to get user playlists' });
    }
}
