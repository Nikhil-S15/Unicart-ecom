const wishlist = require("../../models/connection")
const wishListHelpers = require("../../helpers/userhelper/whislisthelper")
const cartHelpers = require("../../helpers/carthelper/cartHelper")

module.exports = {
    getWishList: async (req,res)=>{
        let user = req.session.user
        let count = await cartHelpers.getCartCount(user._id)
        const wishlistCount = await wishListHelpers.getWishListCount(user._id)
        wishListHelpers.getWishListProducts(user._id).then((wishlistProducts)=>{
            res.render('user/wishList',{user,count,wishlistProducts,wishlistCount})
        })
    },

    addWishList:(req,res)=>{
        let proId = req.body.proId
        let userId = req.session.user._id
        wishListHelpers.addWishList(userId,proId).then((response)=>{
            res.send(response)
        })
    },

    removeProductWishlist:(req,res)=>{
        let proId = req.body.proId
        let wishListId = req.body.wishListId
        wishListHelpers.removeProductWishlist(proId,wishListId).then((response)=>{
            res.send(response)
        })
    },
}