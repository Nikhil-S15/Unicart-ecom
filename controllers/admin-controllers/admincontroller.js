const { response } = require("express");
const express = require("express");
const adminHelper = require("../../helpers/adminhelper/adminhelper");
const orderHelpers = require("../../helpers/carthelper/orderHelper")
const userController = require("../../controllers/user-controller/registerHelper")
const adminHelpers = require("../../helpers/adminhelper/dashhelper")
const { admin } = require("../../models/connection");
const dbAdmin = require("../../models/connection");

const { getLogin } = require("../user-controller/registerHelper");
const orderHelper = require("../../helpers/carthelper/orderHelper");


module.exports = {
  // getDashboard: (req, res) => {
  //   console.log(req.session, "-------");
  //   res.render("admin/dashboard", { layout: "admin-layout" });
  // },
  getDashboard: async (req, res) => {
    let admin = req.session.admin;
    let totalProducts,
      days = [];
    let ordersPerDay = {};
    let paymentCount = [];

    let Products = await adminHelpers.getAllProducts();
    totalProducts = Products.length;

    await orderHelpers.getOrderByDate().then((response) => {
      let result = response;
      console.log(result,'======');
      for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result[i].orders.length; j++) {
          let ans = {};
          ans["createdAt"] = result[i].orders[j].createdAt;
          days.push(ans);
        }
      }
      console.log(days,'}}}}}}');

      days.forEach((order) => {
        let day = order.createdAt.toLocaleDateString("en-US", {
          weekday: "long",
        });
        ordersPerDay[day] = (ordersPerDay[day] || 0) + 1;
      });
    });

    let getCodCount = await adminHelpers.getCodCount();

    let codCount = getCodCount.length;

    let getOnlineCount = await adminHelpers.getOnlineCount();
    let onlineCount = getOnlineCount.length;

    // let getWalletCount = await adminHelper.getWalletCount();
    // let WalletCount = getWalletCount.length;

    paymentCount.push(onlineCount);
    paymentCount.push(codCount);
    // paymentCount.push(WalletCount);

    let orderByCategory = await orderHelper.getOrderByCategory()

    let MEN=0, WOMEN=0
    orderByCategory.forEach((Products)=>
    {
      console.log(Products,'------');

      if(Products.category == 'Men') MEN ++
      if(Products.category == 'Women') WOMEN++
      // if(Products.category == 'Kids') Kids ++
    })
    let category = []
    category.push(MEN)
    category.push(WOMEN)
    // category.push(Kids)


    await orderHelper.getAllOrders().then((response) => {
      var length = response.length;

      let total = 0;

      for (let i = 0; i < length; i++) {
        total += response[i].orders.totalPrice;
      }
      console.log( admin,
        length,
        total,
        totalProducts,
        ordersPerDay,
        paymentCount,
        category,'---------');
   
      res.render("admin/dashboard", {
        layout: "admin-layout",
        admin,
        length,
        total,
        totalProducts,
        ordersPerDay,
        paymentCount,
        category
      });
    });
  },

  // get login admin
  getLogin: (req, res) => {
    req.session.admin = null;
    res.render("admin/login", { layout: "admin-layout" });
  },

  // post login admin
  postLogin: (req, res) => {
    let data = req.body;
    adminHelper.doLogin(data).then((loginAction) => {
      console.log(loginAction);
      if (loginAction) {
        req.session.admin = loginAction;
        console.log('ifff');
        res.redirect("/admin/dashboard");
      } else {
        console.log('elseee');
        res.redirect("/admin");
      }
    });
  },

  // get userlist
  getUserList: (req, res) => {
    console.log("lllkkllkl");
    adminHelper.getUserList().then((user) => {
      res.render("admin/userList", { layout: "admin-layout", user });
    });
  },

  // user status
  changeUserStatus:(req,res)=>
  {
    let userId = req.query.id
    let status = req.query.status
    if( status === 'true')
    {
      req.session.user = null
    }
    adminHelper.changeUserStatus(userId,status).then(()=>
    {
      res.send(status)
    })
  },

  // get add product

  getAddProduct: async (req, res) => {
    let admin = req.session.admin
    let categories = await dbAdmin.Category.find()
    res.render("admin/addproduct", { layout: "admin-layout" ,categories , admin});
  },

  // get  add-Category
  getAddCategory: async (req, res) => {
    let admin = req.session.admin
    let categories = await dbAdmin.Category.find();

    res.render("admin/addcategory", { layout: "admin-layout", categories ,admin});
  },

   // post add-Category
   postAddCategory: (req, res) => {
    let data = req.body;
    adminHelper.postAddCategory(data).then((category) => {
      res.send(category);
    });
  },


  handleEditCategorys: async (req, res) => {
    try {
        const catId = req.params.id;
        const category = await dbAdmin.Category.findById(catId)
        if (category) {
            res.status(200).json(category);
        } else {
            res.status(404).json({ message: 'Somthing went wrong..' });
        }

    } catch (error) {
        res.status(404).redirect('/error')
    }
},

handleEditCategoryPatch: async (req, res) => {
  try {
    // Check if sub-category already exists in the database
    const category = await dbAdmin.Category.findOne({
        _id: req.body._id,
        sub_category: {
            $elemMatch: {
                name: req.body.newSubCat
            }
        }
    });

    if (category) {
        // Sub-category already exists, update the discount and dates
        await dbAdmin.Category.updateOne(
            { _id: req.body._id, "sub_category.name": req.body.newSubCat },
            {
                $set: {
                    "sub_category.$.offer.discount": req.body.offer_percentage,
                    "sub_category.$.offer.validFrom": req.body.valid_from,
                    "sub_category.$.offer.validTo": req.body.valid_to
                }
            }
        );
        // Find all products associated with the subcategory and update their prices
        const products = await dbAdmin.Product.find({ sub_category: req.body.newSubCat })
        products.forEach(async (product) => {
            const originalPrice = product.price
            const discount = req.body.offer_percentage / 100
            const discountedPrice = Math.floor(originalPrice - (originalPrice * discount));
            console.log(discountedPrice,'discount');
            console.log(originalPrice,'originalPrice');
            console.log(req.body.discount,'req.body.discount');
            console.log(req.body,'req.body');
            
            await dbAdmin.Product.updateOne(
                { _id: product._id },
                {
                    $set: {
                        discountedPrice: discountedPrice
                    }
                })
        })
    } else {
        // Sub-category doesn't exist, push it into the sub_category array with the discount and dates
        await dbAdmin.Category.updateOne(
            { _id: req.body._id },
            {
                $push: {
                    sub_category: {
                        name: req.body.newSubCat,
                        offer: {
                            discount: req.body.offer_percentage,
                            validFrom: req.body.valid_from,
                            validTo: req.body.valid_to
                        }
                    }
                }
            }
        );
    }

    res.status(200).json({ message: "Sub-category updated successfully" });
} catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
}
},

removeSubCategory:(req,res)=>{
  let cartId = req.params.id
  adminHelper.deleteSubCategory(cartId, req.body.newSubCat).then((response)=>{
      res.send(response)
  })
},

  // post add-product
  postAddProduct: (req, res) => {
    let file = req.files;
    const fileName = file.map((file) => {
      return file.filename;
    });
    console.log(file);
    const product = req.body;
    product.img = fileName;
    adminHelper.postAddProduct(product).then(() => {
      res.redirect("/admin/dashboard");
    });
  },
  // get edit product
  getEditProduct: (req, res) => {
    let admin = req.session.admin
    let proId = req.params.id;
    adminHelper.getEditProduct(proId).then(async (product) => {
      let category = await dbAdmin.Category.find()
      res.render("admin/editproduct", { layout: "admin-layout" , product ,category ,admin});
    });
  },

  // post edit product
  postEditProduct:async (req,res)=>
  {
    let proId = req.params.id
        let file = req.files
        let image = [];

        let previousImages = await adminHelper.getPreviousImages(proId)

        console.log(previousImages, 'oldimage');
        console.log(file, 'uploaded');


        if (req.files.image1) {
            image.push(req.files.image1[0].filename)
        } else {
            image.push(previousImages[0])
        }

        if (req.files.image2) {
            image.push(req.files.image2[0].filename)
        } else {
            image.push(previousImages[1])
        }
        if (req.files.image3) {
            image.push(req.files.image3[0].filename)
        } else {
            image.push(previousImages[2])
        }
        if (req.files.image4) {
            image.push(req.files.image4[0].filename)
        } else {
            image.push(previousImages[3])
        }

        adminHelper.postEditProduct(proId, req.body, image).then(() => {
            res.redirect('/admin/productList')
        }) 
      
  },

  // delete product
  deleteProduct:(req,res)=>
  {
    let proId = req.params.id
    adminHelper.deleteProduct(proId).then((response)=>
    {
      res.send(response)
    })

  },

  deleteImage:()=>
  {
    let proId = req.params.id
    adminHelper.deleteImage(proId).then((response)=>
    {
      res.send(response)
    })
  },

  // get product list
  getProductList: (req, res) => {
    adminHelper.getProductList().then((product) => {
      // console.log(Product);
      res.render("admin/productlist", { layout: "admin-layout", product });
    });
  },

 

  // get edit category
  getEditCategory: (req, res) => {
    let catId = req.params._id;
    adminHelper.getEditCategory(catId);
  },

  // post edit category

  postEditCategory: (req, res) => {
    let data = req.body;
    adminHelper.postEditCategory().then((response)=>
    {
      adminHelper.postEditCategory(data)
    });
  },

  getSubCategory:(req,res)=>
  {
let data = req.body
adminHelper.getSubCategory(data).then((subCategory)=>
{
  res.send(subCategory)
})
  },

  getLogout: (req, res) => {
    console.log(req.session.admin);
    req.session.admin = null;
    res.redirect("/admin");
  },



  // delete category
  deleteCategory: (req, res) => {
    let catId = req.params.id
    adminHelper.deleteCategory(catId).then((response) => {
        res.send(response)
    })
},


// get order list
getOrderList:(req,res)=>
{
  let userId = req.params.id
  let admin = req.session.admin
  adminHelper.getUserList(userId).then((user)=>
  {
    orderHelpers.getOrders(userId).then((order)=>
    {
      console.log(order.orders[0].shippingAddress[0].item.fname, 'order');
      res.render('admin/orderList',{layout : 'admin-layout',user ,userId, admin , order})
    })
  })
},

 
    /* GET Order Details Page. */
    getOrderDetails: async (req, res) => {
      let admin = req.session.admin
      let orderId = req.query.orderId 
      let userId = req.query.userId
      orderHelpers.getDetailss(userId).then((userDetails)=>{

      orderHelpers.getOrderAddress(userId, orderId).then((address) => {
          orderHelpers.getSubOrders(orderId, userId).then((orderDetails) => {
              orderHelpers.getOrderedProducts(orderId, userId).then((product) => {
                  orderHelpers.getTotal(orderId, userId).then((productTotalPrice) => {
                      orderHelpers.getOrderTotal(orderId, userId).then((orderTotalPrice) => {
                          // console.log('orderDetails',orderDetails,'orderDetails');
                          // console.log('orderId',orderId,'orderId');
                          res.render('admin/orderDetails', {
                              layout: 'admin-layout', admin, userDetails,
                              address, product, orderId, orderDetails, productTotalPrice, orderTotalPrice
                          })
                      })
                  })
              })
          })
      })

      })
  },



// get all orders
getAllOrders:(req,res)=>
{
  
let admin = req.session.admin
  adminHelper.getAllOrder().then((response)=>
  {
   
    res.render("admin/all-orders",{layout:'admin-layout', admin , response})
  })
},


// get sales report page
getSalesReport: async (req, res) => {
  let admin = req.session.admin
  let report = await adminHelper.getSalesReport()
  let details = []
  const getDate = (date) => {
      let orderDate = new Date(date)
      let day = orderDate.getDate()
      let month = orderDate.getMonth() + 1
      let year = orderDate.getFullYear()
      return `${isNaN(day) ? "00" : day} - ${isNaN(month) ? "00" : month} - ${isNaN(year) ? "0000" : year}`
  }

  report.forEach((orders) => {
      details.push(orders.orders)
    
  })

  res.render("admin/salesReport", { layout: 'admin-layout', admin, details, getDate })
},


postSalesReport: (req, res) => {
  let admin = req.session.admin
  let details = []
  const getDate = (date) => {
      let orderDate = new Date(date)
      let day = orderDate.getDate()
      let month = orderDate.getMonth() + 1
      let year = orderDate.getFullYear()
      return `${isNaN(day) ? "00" : day} - ${isNaN(month) ? "00" : month} - ${isNaN(year) ? "0000" : year}`
  }

  adminHelper.postReport(req.body).then((orderData) => {
      console.log(orderData, 'orderData');
      orderData.forEach((orders) => {
          details.push(orders.orders)
      })
console.log(details,'details');
      res.render("admin/salesReport", { layout: 'admin-layout', admin, details, getDate })
  })

},





};




