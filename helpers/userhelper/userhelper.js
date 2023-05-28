const DB = require("../../models/connection");
const bcrypt = require("bcrypt");
const productModel = require("../../models/connection")
const { name } = require("ejs");
const { user } = require("../../models/connection");
const { response } = require("../../app");
const { getProductList } = require("../../controllers/admin-controllers/admincontroller");

module.exports = {
  // signup helper
  dosignUp: (data) => {
    return new Promise(async (resolve, reject) => {
      try {
        let email = data.email;
        let userexist = await DB.user.findOne({ email: email });
        if (userexist) {
          resolve({ finded: true });
        } else {
          let hashedPassword = await bcrypt.hash(data.password[0], 10);
          console.log(hashedPassword);
          let userdata = new DB.user({
            username: data.username,
            email: data.email,
            Password: hashedPassword,
            phonenumber: data.mobile,
          });
          await userdata.save().then((data) => {
            resolve({ finded: false });
          });
        }
      } catch (error) {
        throw error;
      }
    });
  },

  // login helper

  doLogin: (data) => {
    return new Promise(async (resolve, reject) => {
      try {
        let email = data.email;
        await DB.user.findOne({ email: email }).then((user) => {
          let response = {};
          if (user) {
            console.log("iffffff");
            if (!user.status) {
              bcrypt.compare(data.password, user.Password).then((loginTrue) => {
                if (loginTrue) {
                  response.user = user;
                  response.status = true;
                  resolve(response);
                } else {
                  resolve({ status: false });
                }
              });
            } else {
              resolve({ blocked: true });
            }
          } else {
            resolve({ status: true });
          }
        });
      } catch (error) {
        throw error;
      }
    });
  },

  // banner 
  getBannerData: () => {
    return new Promise(async (resolve, reject) => {
      await DB.banner.find().then((response) => {
        resolve(response);
      });
    });
  },


  // find user
  findUser: async (mobNo) => {
    try {
        const user = await DB.user.findOne({ phonenumber: mobNo });
        return user

    } catch (err) {
        console.log(err);
    }
},





   /* GET LogOut Page. */
   getLogout: (req, res) => {
    req.session.user = null
    res.redirect('/login')
},
  // shop page
  // getShop: () => {
  //  return new Promise(async (resolve, reject) => {
  //     try {
  //       console.log("fun is here");
  //       await DB.Product.find().then((product) => {
  //         if (product) {
  //           console.log("hi police ");
  //           resolve(product);
  //         } else {
  //           console.log("product not found");
  //         }
  //       });
  //     } catch (error) {
  //       throw error;
  //     }
  //   });
  // }, 
  getUser: (userId) => {
    try {
        return new Promise((resolve, reject) => {
            DB.user.findById({ _id: userId }).then((response) => {
                resolve(response)
            })
        })
    } catch (error) {
        console.log(error.message);
    }
},

  // get product details
getProductDetail:(proId)=>
{
  
  try {
    console.log("jiljil");
    return new Promise(async (resolve, reject) => {
     await DB.Product.findById({_id :proId}).then((response)=>
      {
        resolve(response)
      })
    })
    
  } catch (error) {
    throw error
  }
},


// change user data
changeUserData: (userId, data) => {
  try {
      return new Promise((resolve, reject) => {
          DB.user.updateOne(
              { _id: userId },
              {
                  $set: {
                      name: data.username,
                      email: data.email,
                      mobile: data.mobile
                  }
              }
          ).then((response) => {
              console.log(response);
              resolve(response)
          })
      })
  } catch (error) {
      console.log(error.message);
  }
},

// get men products
getAllProductsMen:()=>
{
  try {
   
    return new Promise(async (resolve, reject) => {
      await DB.Product.find({category:'Men'}).then((products)=>
      {
        console.log(products,'products');
        resolve(products)
      })
    })
  } catch (error) {
    console.log(error.message);
  }
},

// get women productss

getAllProductsWomen:()=>
{
  try {
    return new Promise(async (resolve, reject) => {
      await DB.Product.find({category : 'Women'}).then((products)=>
      {
        resolve(products)
      })
    })
  } catch (error) {
    console.log(error.message);
  }
},


  /* GET Shop Page. */
  getAllProducts: async (page, perPage) => {
    console.log("fun is here");
    const skip = (page - 1) * perPage;
    const product = await productModel.Product.find()
        .skip(skip)
        .limit(perPage);

    const totalProducts = await productModel.Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / perPage);

    return {
   
        product,
        totalPages,
    };
},
getQueriesOnShop: (query) => {
  const search = query?.search
  const sort = query?.sort
  const filter = query?.filter
  const page = parseInt(query?.page) || 1
  const perPage = 10


  return new Promise(async (resolve, reject) => {

      let filterObj = {}

      if (filter === 'category=Men') {
          filterObj = { category: 'Men' }
      } else if (filter === 'category=Women') {
          filterObj = { category: 'Women' }
      } else if (filter === 'category=Kids') {
          filterObj = { category: 'Kids' }
      }
      console.log(filterObj, 'filterObj');

      //Building search query

      let searchQuery = {}

      if (search) {
          searchQuery = {
              $or: [
                  { name: { $regex: search, $options: 'i' } },
                  { description: { $regex: search, $options: 'i' } }
              ]
          }
      }

      //Building object based on query parameter

      let sortObj = {}

      if (sort === '-createdAt') {
          sortObj = { createdAt: -1 };
      } else if (sort === 'createdAt') {
          sortObj = { createdAt: 1 };
      } else if (sort === '-price') {
          sortObj = { price: -1 };
      } else if (sort === 'price') {
          sortObj = { price: 1 };
      }

      const skip = (page - 1) * perPage;
      const product = await productModel.Product.find({
          ...searchQuery,
          ...filterObj,
      })
          .sort(sortObj)
          .skip(skip)
          .limit(perPage);


      const totalProducts = await productModel.Product.countDocuments({
          ...searchQuery,
          ...filterObj,
      });

      //    console.log(searchQuery,'searchQuery');
      //    console.log(sortObj,'sortObj');
      //    console.log(skip,'skip');
      //    console.log(product,'product');
      console.log(totalProducts, 'totalProducts');

      const totalPages = Math.ceil(totalProducts / perPage);
      if (product.length == 0) {
          resolve({
              noProductFound: true,
              Message: "No results found.."
          })
      }
      resolve({
          product,
          noProductFound: false,
          currentPage: page,
          totalPages,
      });

  })

},


  
};
