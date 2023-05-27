var express = require("express");
var router = express.Router();
const userControllers = require("../controllers/user-controller/registerHelper");
const cartController = require("../controllers/cart-controller/cartcontroller");
const ordercontroller = require("../controllers/cart-controller/ordercontroller");
const wishControllers = require("../controllers/user-controller/whishlistcontroller");
const auth = require("../middleware/auth");
const {
  checkProductQty,
  checkProductQtyCart,
} = require("../middleware/productQtyCheck");

router.get("/", userControllers.getHomepage);

// get login page
router.get("/login", userControllers.getLogin);

// post signup page
router.post("/login", userControllers.postLogin);

// get otp login page
router.get("/otplogin", userControllers.otpLogin);

router.post("/send-otp", userControllers.sendOtp);

// get signup page
router.get("/signup", userControllers.getSignup);

// post signup page
router.post("/signup", userControllers.postSignup);

// change product quantity
router.put(
  "/change-product-quantity",
  checkProductQtyCart,
  cartController.updateQuantity
);

// get shop page
router.get("/shop", auth.userAuth, userControllers.getShop);

// get product details
router.get("/product-detail", auth.userAuth, userControllers.getProductDetail);

// get cart
router.get("/cart-list", auth.userAuth, cartController.getCart);

// add to cart
router.post("/add-to-cart/:id", checkProductQty, cartController.addToCart);

// delete product in cart
router.delete(
  "/delete-product-cart",
  auth.userAuth,
  cartController.deleteProduct
);

// get user ptofile page
router.get("/get-profile", auth.userAuth, ordercontroller.getAddress);

// order details
router.get("/order-details/:id", auth.userAuth, ordercontroller.orderDetails);

// cancel order
router.route("/cancel-order/").post(ordercontroller.cancelOrder);

// return order
router.route("/return-order/").post(ordercontroller.returnOrder);

// post add address
router.route("/add-address").post(auth.userAuth, ordercontroller.postAddress);

// get checkout page
router.get("/check-out", auth.userAuth, ordercontroller.getCheckOut);

// post checkout page
router.post("/check-out", ordercontroller.postCheckOut);

// payment verify
router
  .route("/verify_payment")
  .post(auth.userAuth, ordercontroller.verifyPayment);

//   logout
router.get("/logout", userControllers.getLogout);

// change user status
router.route("/change-user-data/:id").post(userControllers.changeUserData);

// wishlist
router.route("/wish-list").get(auth.userAuth, wishControllers.getWishList);

// post wishlist
router.route("/add-to-wishlist").post(wishControllers.addWishList);

// remove whislist
router
  .route("/remove-product-wishlist")
  .delete(wishControllers.removeProductWishlist);

//   coupon verify
router
  .route("/coupon-verify/:id")
  .get(auth.userAuth, userControllers.verifyCoupon);

router
  .route("/apply-coupon/:id")
  .get(auth.userAuth, userControllers.applyCoupon);
/*  Products Men Page */
router.get("/products-men", userControllers.getProductsMen);

/*  Products Women Page */
router.get("/products-women", userControllers.getProductsWomen);

module.exports = router;
