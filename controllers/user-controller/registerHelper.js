const express = require("express");
const session = require("express-session");
const cartHelpers = require('../../helpers/carthelper/cartHelper')
const userHelper = require("../../helpers/userhelper/userhelper");
const  couponHelpers = require("../../helpers/adminhelper/couponhelper")
const orderHelpers = require("../../helpers/carthelper/orderHelper")
const dbs = require("../../models/connection")


module.exports = {
  // render homepage
  getHomepage: async (req, res) => {
    let bannerData = await userHelper.getBannerData()
    let newlyAdded = await dbs.Product.find().sort({ CreatedAt: -1 });
    if (req.session) {
      user = req.session.user;
      res.render("user/home", { user,bannerData ,newlyAdded});
    } else {
    
      res.render("user/home", {  bannerData,newlyAdded });
    }
  },
  // render loginpage
  getLogin: (req, res) => {
    res.render("user/login", { user });
  },
  // render signup page
  getSignup: (req, res) => {
    res.render("user/sign-up", { user });
  },
  postSignup: (req, res) => {
    let data = req.body;
    console.log(req);
    userHelper.dosignUp(data).then((response) => {
      req.session.user = response;
      console.log(response);
      if (response.finded) {
        res.json(false);
      } else {
        res.json(true);
      }
    });
  },

  // postlogin method
  postLogin: (req, res) => {
    let data = req.body;
    userHelper.doLogin(data).then((loginAction) => {
      console.log(loginAction);
      if (loginAction.status) {
        req.session.user = loginAction.user;
        req.session.status = true;
        user = req.session.user;
        res.redirect("/");

      } else {
        user = false;
        res.redirect('/login')
      }
    });
  },

  // get otp
  otpLogin: (req,res)=>{
    res.render('user/otpLogin',{layout:'Layout'})
    req.session.otpLoginError=false;
},  

sendOtp: (req,res)=>{
console.log("hjjj,,,jjjjj");
console.log(req.body.phonenumber)
var phone = Number(req.body.phonenumber)
  userHelper.findUser(phone).then((user)=>{
    
    if(user){
      req.session.user = user
      res.json(true)
    }else{
      req.session.user = null
      req.session.otpLoginError ='Phone Number doest exist'
      res.json(false)
    }
  })
    
},



// get shop page
  getShop: async (req, res) => {
    let user = req.session.user;
    console.log("kill them");

    let product = await userHelper.getShop()
    let category = await dbs.Category.find()
      console.log(product);
      res.render("user/shop", { user, product ,category});
  
  },

   // get prdoct details
   getProductDetail: async (req,res)=>
   {
    console.log("hyhyhhyyyy");
      //  let proId = req.params.id
       let proId = req.query.id
       let user = req.session.user
       let count = await cartHelpers.getCartCount(user._id) 
       userHelper.getProductDetail(proId).then((product)=>
       {
           res.render("user/productDetail",{product ,user ,count})
       })
   },

  //  change user data
   changeUserData:(req,res)=>{
    let userId = req.params.id
    let data = req.body
    userHelper.changeUserData(userId,data).then((updatedUserData)=>{
        res.send(updatedUserData)
    })
},


// sort by men
getProductsMen:(req,res)=>
{
  
userHelper.getAllProductsMen().then((product)=>
{
 
  let user = req.session.user
  
  res.render("user/products-men", {product ,user})
})
},

getProductsWomen:(req,res)=>
{
userHelper.getAllProductsWomen().then((product)=>
{
  let user = req.session.user
  res.render("user/products-women",{product , user})
})
},

getDetailss:(userId)=>
{
  try {
      return new Promise((resolve,reject)=>{
      dbs.user.findOne({_id : userId}).then((user)=>{
          resolve(user)
      })
      })
  } catch (error) {
      console.log(error.message);
  }
},

verifyCoupon: (req, res) => {
  let couponCode = req.params.id
  let userId = req.session.user._id
  couponHelpers.verifyCoupon(userId, couponCode).then((response) => {
      res.send(response)
  })
},

applyCoupon: async (req, res) => {
  let couponCode = req.params.id
  let userId = req.session.user._id
  let total = await orderHelpers.totalCheckOutAmount(userId)
  couponHelpers.applyCoupon(couponCode, total).then((response) => {
      res.send(response)
  })
},




  getLogout: (req, res) => {
    req.session.user = null;
    req.session.status = false;
    res.redirect("/");
  },
};
