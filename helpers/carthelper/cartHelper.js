// const { response } = require('../app');
const cartModel = require("../../models/connection");
const productModel = require("../../models/connection");
const { ObjectId } = require("mongodb");

module.exports = {
  addToCart: (proId, userId) => {
    let proObj = {
        productId: proId,
        quantity: 1
    }
    try {
        return new Promise((resolve, reject) => {

            cartModel.Cart.findOne({ user: userId }).then(async (cart) => {

                if (cart) {
                    let productExist = cart.cartItems.findIndex((cartItems) => cartItems.productId == proId);
                    if (productExist != -1) {
                        cartModel.Cart
                            .updateOne(
                                { user: userId, "cartItems.productId": proId },
                                {
                                    $inc: { "cartItems.$.quantity": 1 }
                                }
                            ).then((response) => {
                                resolve({ response, status: false })
                            })
                    } else {
                        cartModel.Cart
                            .updateOne(
                                { user: userId },
                                {
                                    $push: {
                                        cartItems: proObj
                                    }
                                }
                            ).then((response) => {
                                resolve({ status: true })
                            })
                    }
                } else {
                    let newCart = await cartModel.Cart({
                        user: userId,
                        cartItems: proObj
                    })
                    await newCart.save().then((response) => {
                        resolve({ status: true })
                    })
                }
            })
        })
    } catch (error) {
        console.log(error.message);
    }

},
  //   get cart page
  getCartItems: (userId) => {
    return new Promise((resolve, reject) => {
      try {
        cartModel.Cart.aggregate([
          { $match: { user: new ObjectId(userId) } },
          { $unwind: "$cartItems" },
          {
            $project: {
              item: "$cartItems.productId",
              quantity: "$cartItems.quantity",
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "item",
              foreignField: "_id",
              as: "carted",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              carted: { $arrayElemAt: ["$carted", 0] },
            },
          },
        ]).then((cartItems) => {
          resolve(cartItems);
        });
      } catch (error) {
        throw error;
      }
    });
  },

  //   get cart count
  getCartCount: (userId) => {
    return new Promise((resolve, reject) => {
      let count = 0;
      cartModel.Cart.findOne({ user: userId }).then((cart) => {
        if (cart) {
          count = cart.cartItems.length;
        }
        resolve(count);
      });
    });
  },

  // cart quantity update
  updateQuantity: (data) => {
    let cartId = data.cartId;
    let proId = data.proId;
    let userId = data.userId;
    let count = data.count;
    let quantity = data.quantity;
    try {
      return new Promise(async (resolve, reject) => {
        if (count == -1 && quantity == 1) {
          cartModel.Cart.updateOne(
            { _id: cartId },
            {
              $pull: { cartItems: { productId: proId } },
            }
          ).then(() => {
            resolve({ status: true });
          });
        } else {
          cartModel.Cart.updateOne(
            { _id: cartId, "cartItems.productId": proId },
            {
              $inc: { "cartItems.$.quantity": count },
            }
          ).then(() => {
            cartModel.Cart.findOne(
              { _id: cartId, "cartItems.productId": proId },
              { "cartItems.$": 1 }
            ).then((cart) => {
              const newQuantity = cart.cartItems[0].quantity;
              resolve({ status: true, newQuantity: newQuantity });
            });
          });
        }
      });
    } catch (error) {
      console.log(error.message);
    }
  },

  //   delete product

  deleteProduct: (data) => {
    let cartId = data.cartId;
    let proId = data.proId;
    return new Promise((resolve, reject) => {
      try {
        cartModel.Cart.updateOne(
          { _id: cartId },
          { $pull: { cartItems: { productId: proId } } }
        ).then(() => {
          resolve({ status: true });
        });
      } catch (error) {
        throw error;
      }
    });
  },
};
