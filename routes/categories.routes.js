import express from 'express'
import * as controllers from '../controllers/cateories.controllers.js'
import { AuthenticateAdmin, AuthenticateUser } from '../middleware/auth.js'

const router = express.Router()

//POST ROUTES
router.post('/createCategory', AuthenticateAdmin, controllers.createCategory)
router.post('/updateCategory', AuthenticateAdmin, controllers.updateCategory)



//GET ROUTES
router.get('/getAllCategory', controllers.getAllCategory)
router.get('/getCategory/:categorySlug', controllers.getCategory)


//PUT ROUTES

export default router
