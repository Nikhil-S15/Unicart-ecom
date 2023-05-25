postAddProduct: (data) => {
  try {
      return new Promise((resolve, reject) => {
          let product = new dbAdmin.Product(data);
          product.save().then(() => {
              resolve()
          })

      })
  } catch (error) {
      console.log(error.message);
  }
}
