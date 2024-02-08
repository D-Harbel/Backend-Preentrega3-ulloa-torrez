const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { isUser } = require('../middleware/authorization');


module.exports = function (io) {
    router.post('/', cartController.createCart);
    router.get('/:cid', cartController.getCartById);
    router.post('/:cid/product', isUser, cartController.addProductToCart);
    router.post('/:cid/product/:pid', isUser, cartController.addQuantityToCart);
    router.delete('/:cid/products/:pid', isUser, cartController.deleteProductFromCart);
    router.put('/:cid', cartController.updateCart);
    router.put('/:cid/products/:pid', cartController.updateProductInCart);
    router.delete('/:cid', cartController.deleteAllProductsInCart);
    router.post('/:cid/purchase',  cartController.purchaseCart);


    return router;
}
