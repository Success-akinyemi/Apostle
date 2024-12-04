import express from 'express'
import * as controllers from '../controllers/cateories.controllers.js'
import { AuthenticateUser } from '../middleware/auth.js'

const router = express.Router()


//GET ROUTES
router.get('/getAllCategory', AuthenticateUser, controllers.getAllCategory)
router.get('/getCategory/:categorySlug', AuthenticateUser, controllers.getCategory)


//PUT ROUTES

export default router
