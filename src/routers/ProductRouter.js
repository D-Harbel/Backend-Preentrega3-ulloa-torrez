const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { isAdmin, redirectToHomeIfUser } = require('../middleware/authorization');

module.exports = function (io) {
    router.get('/', productController.getProducts);
    router.post('/', redirectToHomeIfUser, isAdmin, productController.addProduct);
    router.put('/:id', redirectToHomeIfUser, isAdmin, productController.updateProduct);
    router.get('/:id', productController.getProductById);
    router.delete('/:id', redirectToHomeIfUser, isAdmin, productController.deleteProduct);

    return router;
}
