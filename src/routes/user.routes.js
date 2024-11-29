import {Router} from 'express'
import {upload} from "../middlewares/multer.middleware.js"
import {registerUser} from '../controllers/user.controller.js';
const router =Router()
router.route("/register").post(
    upload.fields([
        {
            name:"avatar",//ab har ajgah iska name samme hoga
            maxCount:1
        },
        {
         name: "coverImage",
        maxCount:1
        }
    ]),
    registerUser)
export default router