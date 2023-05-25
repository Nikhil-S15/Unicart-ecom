const cartHelpers = require('../../helpers/carthelper/cartHelper')
const orderHelpers = require('../../helpers/carthelper/orderHelper');
const userhelper = require('../../helpers/userhelper/userhelper');
const couponHelpers = require('../../helpers/adminhelper/couponhelper')

module.exports = {

    // Get address page
    getAddress: async (req,res)=>
    {
        var count = null
        console.log("mnunnun");
        let user  = req.session.user
        if (user)
        {
            var count = await cartHelpers.getCartCount(user._id)
            let userData = await userhelper.getUser(user._id)
            let address = await orderHelpers.getAddress(user._id)
            let orders = await orderHelpers.getOrders(user._id)

            res.render('user/profile',{user ,userData, count , address ,orders})
        }
    },

    // post addaddress
    postAddress:(req,res)=>
    {
        let data = req.body
        let userId = req.session.user._id
        orderHelpers.postAddress(data,userId).then((response)=>
        {
            res.send (response)
        })
    },

    /* GET Check Out Page */
    getCheckOut: async (req, res) => {
        let userId = req.session.user._id
        let user = req.session.user
        let total = await orderHelpers.totalCheckOutAmount(userId)
        let count = await cartHelpers.getCartCount(userId)
        let address = await orderHelpers.getAddress(userId)
        let coupon = await orderHelpers.getCouponList()
        cartHelpers.getCartItems(userId).then((cartItems) => {
            res.render('user/checkOut', { user, cartItems, total, count, address ,coupon})
        })
    },

    // post Check Out Page
    postCheckOut: async (req, res) => {
        console.log(req.body, 'body');
        try {
            let userId = req.session.user._id
            let data = req.body;
            let total = data.discountedAmount
            let couponCode = data.couponCode
            console.log(total,couponCode,'---------');
            await couponHelpers.addCouponToUser(couponCode, userId)
            try {
                const response = await orderHelpers.placeOrder(data);
                console.log(response,'response');
                if (data.payment_option === "COD") {
                    res.json({ codStatus: true });
                } else if (data.payment_option === "razorpay") {
                    const order = await orderHelpers.generateRazorpay(req.session.user._id, total);
                    console.log(order, ';;');
                    res.json(order);
                } else if (data.payment_option === 'wallet') {
                    res.json({ orderStatus: true, message: 'order placed successfully' })
                }
            } catch (error) {
                console.log('got here ----');
                console.log({error : error.message},'22');
                res.json({status : false , error : error.message})
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },
    
// get product
    getProduct: (req, res) => {
        let userId = req.session.user._id;
        let orderId = req.params.id;
        orderHelpers.findProduct(orderId, userId).then((product) => {
            console.log(product, 'ooo');
            res.send(product)
        })
    },

    // order details
    orderDetails: async (req, res) => {
        let user = req.session.user;
        let count = await cartHelpers.getCartCount(user._id)
       
        let userId = req.session.user._id;
        let orderId = req.params.id;
        orderHelpers.findOrder(orderId, userId).then((orders) => {
            orderHelpers.findAddress(orderId, userId).then((address) => {
                orderHelpers.findProduct(orderId, userId).then((product) => {
                    console.log(orders, '====');
                    res.render('user/orderDetails', { user, count, product, address, orders, orderId})
                })
            })
        })
    },
    cancelOrder:(req,res)=>
    {
        let orderId = req.query.id
        let total = req.query.total
        let userId = req.session.user._id
        orderHelpers.cancelOrder(orderId).then((canceled)=>
        {
             orderHelpers.addWallet(userId, total).then((walletStatus) => {
            // console.log(canceled, 'cancel', walletStatus, 'wallet');
                res.send(canceled)
            
        })
    })
    },
    returnOrder:(req,res)=>
    {
        let userId = req.session.user._id
        let orderId = req.query.id
        let total = req.query.total
        orderHelpers.returnOrder(orderId,userId).then((returnOrderStatus)=>
        {
            orderHelpers.addWallet(userId, total).then((walletStatus) => {
                orderHelpers.updatePaymentStatus(orderId, userId).then((paymentStatus) => {
                    res.send(returnOrderStatus)
               
            
        })
    })
    })

    },

    //to change order Status 
    changeOrderStatus: (req, res) => {
        let orderId = req.body.orderId
        let status = req.body.status
        orderHelpers.changeOrderStatus(orderId, status).then((response) => {
            console.log(response);
            res.send(response)
        })
    },

    verifyPayment: (req, res) => {
        orderHelpers.verifyPayment(req.body).then(() => {
            orderHelpers.changePaymentStatus(req.session.user._id, req.body["order[receipt]"])
                .then(() => {
                    console.log(req.body
                        );
                    res.json({ status: true })
                })
                .catch((err) => {
                    res.json({ status: false })
                })
        })
    },

   

};