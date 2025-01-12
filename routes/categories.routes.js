import express from 'express'
import * as controllers from '../controllers/cateories.controllers.js'
import { AuthenticateAdmin, AuthenticateUser } from '../middleware/auth.js'
import { uploadMiddleware } from '../controllers/cateories.controllers.js'

const router = express.Router()

//POST ROUTES
router.post('/createCategory', AuthenticateAdmin, uploadMiddleware, controllers.createCategory)
router.post('/updateCategory', AuthenticateAdmin, uploadMiddleware, controllers.updateCategory)
router.post('/deleteCategory', AuthenticateAdmin, controllers.deleteCategory)

//GET ROUTES
router.get('/getAllCategory', controllers.getAllCategory)
router.get('/getCategory/:categorySlug', controllers.getCategory)


//PUT ROUTES

export default router
