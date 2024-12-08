import express from 'express'
import * as controllers from '../controllers/song.controllers.js'
import { uploadMiddleware } from '../controllers/song.controllers.js'

import { AuthenticateUser, AuthenticateAdmin } from '../middleware/auth.js'

const router = express.Router()

//POST ROUTES
router.post('/newSong', AuthenticateAdmin, uploadMiddleware, controllers.newSong)
router.post('/updateSong', AuthenticateAdmin, uploadMiddleware, controllers.updateSong)
router.post('/deleteSongs', AuthenticateAdmin, controllers.deleteSongs)

//GET ROUTES
router.get('/getAllSongs', AuthenticateUser, controllers.getAllSongs)
router.get('/getASongs/:id', AuthenticateUser, controllers.getASongs)

router.get('/getAdminAllSongs', AuthenticateAdmin, controllers.getAllSongs)
router.get('/getAdminASongs/:id', AuthenticateAdmin, controllers.getASongs)

router.get('/getSongByCategory/:category', AuthenticateUser, controllers.getSongByCategory)



//PUT ROUTES

export default router
