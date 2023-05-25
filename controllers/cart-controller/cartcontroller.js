const express = require('express')
const cartModel = require('../../models/connection')
const cartHelpers = require('../../helpers/carthelper/cartHelper')
const orderHelpers = require('../../helpers/carthelper/orderHelper')

module.exports = {
addToCart:(req,res)=>
{
    console.log(req.params.id,);
cartHelpers.addToCart(req.params.id,req.session.user._id).then((response)=>
{
    res.send(response)
})
},

// get cart page
getCart:async (req,res)=>
{
    
let userId = req.session.user._id
let user = req.session.user
let count = await cartHelpers.getCartCount(user._id)
let total = await orderHelpers.totalCheckOutAmount(userId)
let subTotal = await orderHelpers.getSubTotal(userId)
cartHelpers.getCartItems(userId).then((cartItems)=>
{
console.log(user , cartItems,count , total,subTotal);

   console.log(user);
    res.render('user/cart',{user , cartItems,count , total,subTotal})
})
},

// change quantity
updateQuantity:(req,res)=>
{
    console.log('-_________________________________');
    console.log(req,'++++++++++');

    let userId = req.session.user._id

    cartHelpers.updateQuantity(req.body).then(async (response) => {
        response.total = await orderHelpers.totalCheckOutAmount(userId)
        response.subTotal = await orderHelpers.getSubTotal(userId)
            res.json(response)
        }) 

},

// delete product from cart
deleteProduct:(req,res)=>
{
    cartHelpers.deleteProduct(req.body).then((response)=>
    {
        res.send(response)
    })
}

};