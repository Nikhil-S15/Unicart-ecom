const { response } = require("../../app");
const user = require("../../models/connection");

module.exports = {

    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
          await user.Product.find().then((response) => {
            resolve(response);
          });
        });
      },

      getCodCount: () => {
        return new Promise(async (resolve, reject) => {
          let response = await user.Order.aggregate([
            {
              $unwind: "$orders",
            },
            {
              $match: {
                "orders.paymentMethod": "COD",
              },
            },
          ]);
          resolve(response);
        });
      },
    
      getOnlineCount: () => {
        return new Promise(async (resolve, reject) => {
          let response = await user.Order.aggregate([
            {
              $unwind: "$orders",
            },
            {
              $match: {
                "orders.paymentMethod": "razorpay",
              },
            },
          ]);
          resolve(response);
        });
      },
}