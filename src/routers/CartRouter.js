const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

module.exports = function (io) {
    router.post('/', cartController.createCart);
    router.get('/:cid', cartController.getCartById);
    router.post('/:cid/product', cartController.addProductToCart);
    router.post('/:cid/product/:pid', cartController.addQuantityToCart);
    router.delete('/:cid/products/:pid', cartController.deleteProductFromCart);
    router.put('/:cid', cartController.updateCart);
    router.put('/:cid/products/:pid', cartController.updateProductInCart);
    router.delete('/:cid', cartController.deleteAllProductsInCart);

    return router;
}
