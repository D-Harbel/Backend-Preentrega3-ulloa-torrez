const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { isUser } = require('../middleware/authorization');
const ticketService = require('../repository/ticket.service')
const productService = require('../repository/product.service')
const CartService = require('../repository/cart.service')

module.exports = function (io) {
    router.post('/', cartController.createCart);
    router.get('/:cid', cartController.getCartById);
    router.post('/:cid/product', isUser, cartController.addProductToCart);
    router.post('/:cid/product/:pid', isUser, cartController.addQuantityToCart);
    router.delete('/:cid/products/:pid', isUser, cartController.deleteProductFromCart);
    router.put('/:cid', cartController.updateCart);
    router.put('/:cid/products/:pid', cartController.updateProductInCart);
    router.delete('/:cid', cartController.deleteAllProductsInCart);

    router.post('/:cid/purchase', async (req, res) => {
        const cid = req.params.cid;
        try {
            const failedProducts = await cartController.purchaseCart(cid, req.session.usuario);
    
            if (failedProducts.length > 0) {
                res.status(200).json({ message: 'Compra completada con productos no disponibles', failedProducts });
            } else {
                res.status(200).json({ message: 'Compra completada con éxito' });
            }
        } catch (error) {
            console.error('Error al finalizar la compra:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    });


    return router;
}
