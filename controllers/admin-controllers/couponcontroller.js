const { response } = require("../../app");
const couponHelper = require("../../helpers/adminhelper/couponhelper")

module.exports = {

    // get coupon
    getAddCoupon:(req,res)=>
    {
        let admin = req.session.admin
        console.log("killll");
        res.render("admin/addcoupon",{layout:'admin-layout' , admin})
    },

    // generate coupon
    generatorCouponCode:(req,res)=>
    {
    couponHelper.generatorCouponCode().then((couponCode)=>
    {
        res.send(couponCode)
    })
    },

    // post coupon
    postaddCoupon:(req,res)=>
    {
        let data = {
            couponCode : req.body.coupon,
            validity : req.body.validity,
            minPurchase: req.body.minPurchase,
            minDiscountPercentage : req.body.minDiscountPercentage,
            maxDiscountValue : req.body.maxDiscount,
            description : req.body.description
        }
        couponHelper.postaddCoupon(data).then((response)=>{
            res.send(response)
        })
    },

    getCouponList:(req,res)=>
    {  
        let admin = req.session.admin
        couponHelper.getCouponList().then((couponList)=>
        {
            res.render("admin/couponList",{layout:'admin-layout',admin,couponList})
        })
    },
    removeCoupon:(req,res)=>
    {
        let couponId = req.body.couponId
        couponHelper.removeCoupon(couponId).then((response)=>
        {
            res.send(response)
        })
    }


}