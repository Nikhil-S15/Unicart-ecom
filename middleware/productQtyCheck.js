const productModel = require('../models/connection')

const checkProductQty = async (req, res, next) =>{
    const {id} = req.params
    try {
        const prodQty = await productModel.Product.findById(id).select('quantity');
        console.log(prodQty)
        if(prodQty.quantity <= 0){
            return res.status(200).json({error: true, message: "Product is out of stock" })
        }
        next()
    } catch (error) {
        res.status(500).json({message: "Internal error occured"})
    }

}






const checkProductQtyCart = async (req, res, next) => {
    console.log(req.body.proId, 'req.body.proId');
    const id = req.body.proId;
    console.log(req.body.count ,'req.body.count ');
    try {
      const prodQty = await productModel.Product.findById(id).select('quantity');
      const desiredQty = req.body.quantity; // Assuming the desired quantity is passed in the request body
  
      if (((prodQty.quantity - 1) < desiredQty) && req.body.count == 1) {
        return res.status(200).json({ error: true, message: "Product is out of stock" });

      }else if((prodQty.quantity < desiredQty) && req.body.count == -1){
        return res.status(200).json({ error: true, message: "Product is out of stock" });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: "Internal error occurred" });
    }
  };
  




module.exports = {
    checkProductQty,
    checkProductQtyCart
}