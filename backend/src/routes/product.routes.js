import {Router} from 'express'
import {upload} from '../middleware/multer.middleware.js'
import adminAuth from '../middleware/adminAuth.middleware.js'
import {
  addProduct,
  listProducts,
  removeProduct,
  getSingleProduct
} from '../controllers/product.controller.js'

const router = Router()

console.log("✅ Product Routes Loaded");

router.get("/", (req, res) => {
  console.log("✅ GET /api/v1/products hit");
  res.json({ success: true, message: "Products fetched successfully!" });
});


router.route('/add').post(
  adminAuth,
  upload.fields([
    {name:'image1',maxCount:1},
    {name:'image2',maxCount:1},
    {name:'image3',maxCount:1},
    {name:'image4',maxCount:1}
  ]),
  addProduct
)

router.route('/delete/:productId').delete(adminAuth, removeProduct)

router.route('/list').get(listProducts)

router.route('/:productId').get(getSingleProduct)

export default router
