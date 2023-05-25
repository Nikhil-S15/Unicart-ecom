const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin-controllers/admincontroller");
const adminControllers = require('../controllers/admin-controllers/bannercontroller')
const auth = require("../middleware/auth");
const { admin } = require("../models/connection");
const multer = require("../multer/multer")
const orderControllers = require('../controllers/cart-controller/ordercontroller');
const couponController = require("../controllers/admin-controllers/couponcontroller")



/* GET home page. */
router.get("/dashboard", auth.adminAuth,adminController.getDashboard);

// get login page
router.get("/", adminController.getLogin);

// post login page
router.post("/", adminController.postLogin);

// get user list
router.get('/userList',auth.adminAuth,adminController.getUserList)

// user status
router.put('/change_user_status',adminController.changeUserStatus)

// get add-product
router.get("/addproduct",auth.adminAuth, adminController.getAddProduct);

// post add-product
router.post('/addproduct', multer.uploads , adminController.postAddProduct)

// get edit product
router.get('/editproduct/:id',adminController.getEditProduct)

// post edit product
router.post('/editproduct/:id',multer.editeduploads , adminController.postEditProduct)

// delete product
router.delete('/deleteproduct/:id',auth.adminAuth, adminController.deleteProduct)



// get product list
router.get('/productlist',auth.adminAuth , adminController.getProductList)



// get add-category
router.get("/addcategory",auth.adminAuth, adminController.getAddCategory);

// post add-category
 router.post('/addcategory',adminController.postAddCategory)

//  post edit-category
// router.post('/editcategory' , adminController.postEditCategory)
router.route('/api/edit-category/:id').get(auth.adminAuth,adminController.handleEditCategorys).patch(adminController.handleEditCategoryPatch)

// post delete category
router.delete('/api/delete-category/:id',adminController.deleteCategory)

router.route('/getSubcategories').post(adminController.getSubCategory)


/* Delete Sub Category Page. */
router.route('/remove-subCategory/:id').delete(adminController.removeSubCategory)


router.delete('/api/delete-image/:id',adminController.deleteImage)


// orderclist
router.route('/order-list/:id').get(auth.adminAuth, adminController.getOrderList)

// get Order Details Page. 
router.route('/order-details').get(auth.adminAuth, adminController.getOrderDetails)

// add banner
router.get("/add_banner",auth.adminAuth, adminControllers.getAddBanner)

// post add banner
router.post("/add_banner",auth.adminAuth,multer.addBannerupload, adminControllers.postAddBanner)

// list banner
router.get("/list_banner",auth.adminAuth, adminControllers.listBanner)

// delete banner
router.delete('/delete-banner/:id', adminControllers.deleteBanner)

// get edit banner
router.get("/edit_banner",auth.adminAuth,adminControllers.getEditBanner)

// edit banner
router.post("/edit_banner",multer.editBannerupload,auth.adminAuth, adminControllers.postEditBanner)

/* POST Order Status Page. */
router.route('/change-order-status').post(orderControllers.changeOrderStatus)

// get view orders
router.get('/view_orders',adminController.getAllOrders)



// get sales report
router.route('/sales-report').get(adminController.getSalesReport).post(adminController.postSalesReport)

/* GET Add Coupon Page. */
router.route('/add-coupon').get(auth.adminAuth,couponController.getAddCoupon).post(couponController.postaddCoupon)

// generate coupon
router.route('/generate-coupon-code').get(auth.adminAuth,couponController.generatorCouponCode)

// get coupon list
router.route('/coupon-list').get(auth.adminAuth,couponController.getCouponList)

// remove coupon
router.route('/remove-coupon').delete(couponController.removeCoupon)

router.get('/logout', adminController.getLogout)





module.exports = router;
