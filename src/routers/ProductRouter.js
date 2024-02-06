const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

module.exports = function (io) {
    router.get('/', productController.getProducts);
    router.post('/', productController.addProduct);
    router.put('/:id', productController.updateProduct);
    router.get('/:id', productController.getProductById);
    router.delete('/:id', productController.deleteProduct);

    return router;
}
