const dbAdmin = require("../../models/connection");
const bcrypt = require("bcrypt");
const categoryModel = require("../../models/connection")
const { name, resolveInclude } = require("ejs");
const { response } = require("express");

module.exports = {
  doLogin: (data) => {
    return new Promise(async (resolve, reject) => {
      try {
        let email = data.email;
        let user = await dbAdmin.admin.find()
        console.log(user);
        dbAdmin.admin.findOne({ email: email }).then(async (admins) => {
          console.log(admins,'matchinf emailllllll');
          if (admins) {
            console.log(admins,'admin find');
            
            if (data.password == admins.password){
            console.log(admins,'admin');

              resolve(admins);
            }else{
              console.log('no ADMINN');
              resolve(false);
            }
              
          } else {
            resolve(false);
          }
        });
      } catch (error) {
        throw error;
      }
    });
  },

  // get user list
   getUserList: () => {
    return new Promise((resolve, reject) => {
      try {
        dbAdmin.user.find().then((user) => {
          if (user) {
            resolve(user);
          } else {
            console.log("user not found");
          }
        });
      } catch (error) {
        throw error;
      }
    });
  },

  // user-status
  changeUserStatus:(userId,status)=>
  {
return new Promise((resolve, reject) => {
  try {
    dbAdmin.user.updateOne({_id:userId},{$set:{status:status}}).then((response)=>
    {
      if(response)
      {
        resolve(response)
      }
      else{
        console.log("user not found");
      }
    })
  } catch (error) {
    throw error
  }
})
  },

  // post add category
  postAddCategory: (data) => {
    console.log(data, 'dataa');
    try {
        return new Promise((resolve, reject) => {
            // capitalize the first letter of category
            const category = data.category.charAt(0).toUpperCase() + data.category.slice(1).toLowerCase();

            categoryModel.Category.findOne({ category: category })
                .then(async (categoryDoc) => {
                    if (!categoryDoc) {
                        let newCategory = new categoryModel.Category({
                            category: category,
                            sub_category: [{ name: data.sub_category, offer: { validFrom: 0, validTo: 0, discountPercentage: 0 } }]
                        });
                        await newCategory.save().then(() => {
                            resolve({ status: true });
                        });
                    } else {
                        let subcategoryDoc = categoryDoc.sub_category.find((sub_category) => sub_category.name === data.sub_category);
                        if (!subcategoryDoc) {
                            categoryDoc.sub_category.push({ name: data.sub_category, offer: { validFrom: 0, validTo: 0, discountPercentage: 0 } });
                            await categoryDoc.save().then(() => {
                                resolve({ status: true });
                            });
                        } else {
                            resolve({ status: false, message: 'Subcategory already exists.' });
                        }
                    }
                });
        });
    } catch (error) {
        console.log(error.message);
    }
},

  /* GET editCategory Page. */
  getEditCategory: (catId) => {
    try {
      dbAdmin.Category.findById(catId).then((category) => {
        if (category) {
          resolve;
        }
      });
    } catch (error) {}
  },
  // post add product
  postAddProduct: (data) => {
    try {
      return new Promise((resolve, reject) => {
        let product = new dbAdmin.Product(data);
        product.save().then((response) => {
          resolve(response);
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  },

  // get edit-product
getEditProduct:(proId)=>
{
return new Promise((resolve, reject) => {
  try {
    dbAdmin.Product.findById(proId).then((product)=>
    {
      if(product)
      {
        resolve(product)
      }
      else{
        console.log('product not found');
      }
    })
  } catch (error) {
    throw error;
  }
})
},

 /* Post EditProduct Page. */
 postEditProduct: (proId, product, image) => {
console.log("hello");
  
      return new Promise(async(resolve,_reject) => {
          await dbAdmin.Product.updateOne({ _id: proId },
              {
                  $set:
                  {
                      name: product.name,
                      brand: product.brand,
                      description: product.description,
                      price: product.price,
                      quantity: product.quantity,
                      category: product.category,
                      img: image
                  }
              }).then((response) => {
                  resolve(response)
              })
      })
  
},

  //to get images for edit product
  getPreviousImages: (proId) => {
    try {
        return new Promise(async (resolve, reject) => {
            await dbAdmin.Product.findOne({ _id: proId }).then((response) => {
                resolve(response.img)
            })
        })
    } catch (error) {
        console.log(error.message);
    }

},

// delete product
deleteProduct:(proId)=>
{
  return new Promise((resolve, reject) => {
    try {
        dbAdmin.Product.findByIdAndDelete({ _id: proId}).then((response)=>
        {
          if(response)
          {
            resolve({status : true})
          }
          else{
            resolve({staus : false})
          }
        })
    } catch (error) {
      throw error
    }
  })
},

deleteImage:(proId)=>
{
try {
  return new Promise((resolve, reject) => {
    dbAdmin.Product.findByIdAndDelete({_id:proId}).then((response)=>
    {
      
    })
  })
} catch (error) {
  console.log(error.message);
}
},

// post edit product
postEditCategory: (data) => {
  try {
      return new Promise((resolve, reject) => {
          categoryModel.Category.find().then((category) => {

          })
      })
  } catch (error) {
      console.log(error.message);
  }
},

  // get product list

  getProductList:()=>
  {
    console.log('like uor');
    return new Promise((resolve, reject) => {
      try {
        dbAdmin.Product.find().sort({_id:-1}).then((product)=>
        {
          if(product)
          {
            resolve(product)
          }
          else{
            console.log('product not found');
          }
        })
      } catch (error) {
        throw console.log("error messeage");
      }
    })
  },
   /* Delete Category Page. */
   deleteCategory: (catId) => {
    try {
        return new Promise((resolve, reject) => {
        dbAdmin.Category.findByIdAndDelete(catId).then((res) => {
                if (res) {
                    resolve({ status: true })
                } else {
                    resolve({ status: false })
                }
            })
        })

    } catch (error) {
        console.log(err.message);
    }
},

deleteSubCategory: (id, name) => {
  return new Promise(async (resolve, reject) => {
    await dbAdmin.Category.updateOne(
      { _id: id },
      { $pull: { sub_category: {  name: name } } }
    ).then((response) => {
      console.log(response);
      resolve(response);
    })
  });
},
getSubCategory:(data)=>
{
try {
  return new Promise((resolve, reject) => {
    dbAdmin.Category.findOne({category : data.category}).then((category)=>
    {
      if(category)
      {
        resolve(category.sub_category)
      }
      else{
        reject("Category not found")
      }
    })
  })
} catch (error) {
  console.log(error.message);
}
},
getAllOrder:()=>
{
  try {
    return new Promise(async (resolve, reject) => {
     let Order = await dbAdmin.Order.aggregate([{$unwind:"$orders"},{$sort:{_id:-1}}]).then((response)=>
  {
    resolve(response)
  })
    })
  } catch (error) {
    console.log(error.message);
  }
},

// // get sales report

getSalesReport: () => {
  try {
      return new Promise((resolve, reject) => {
          dbAdmin.Order.aggregate([
              {
                  $unwind: '$orders'
              },
              {
                  $match: {
                      "orders.orderConfirm": "delivered"
                  }
              }
          ]).then((response) => {
              resolve(response)
          })
      })
  } catch (error) {
      console.log(error.message);
  }
},

postReport: (date) => {
  console.log(date, 'date+++++');
  try {
      let start = new Date(date.startdate);
      let end = new Date(date.enddate);
      return new Promise((resolve, reject) => {
        dbAdmin.Order.aggregate([
          {
            $unwind: "$orders"
          },
          {
            $match: {
              $and: [
                  { "orders.orderConfirm": "delivered" },
                  { "orders.createdAt": { $gte: start, $lte: new Date(end.getTime() + 86400000) } }
              ]
          }
          }
        ])
        .exec()
              .then((response) => {
                  console.log(response, 'response---');
                  resolve(response)
              })
      })
  } catch (error) {
      console.log(error.message);
  }
},


};
