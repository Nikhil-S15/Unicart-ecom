const DB = require("../../models/connection");
const bcrypt = require("bcrypt");
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
  getShop: () => {
   return new Promise(async (resolve, reject) => {
      try {
        console.log("fun is here");
        await DB.Product.find().then((product) => {
          if (product) {
            console.log("hi police ");
            resolve(product);
          } else {
            console.log("product not found");
          }
        });
      } catch (error) {
        throw error;
      }
    });
  }, 
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
}
  
};
