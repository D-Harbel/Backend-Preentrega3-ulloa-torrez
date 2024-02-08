const CartService = require('../repository/cart.service');
const productService = require('../repository/product.service')
const ticketService = require('../repository/ticket.service')



const { Cart } = require('../dao/index');

class CartController {
    async createCart(req, res) {
        try {
            const cart = await CartService.createCart();
            res.status(201).json({ cart });
        } catch (error) {
            console.error('Error al crear un carrito:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    async getCartById(req, res) {
        const cid = req.params.cid;
        try {
            const cart = await CartService.getCartById(cid);
            if (cart) {
                res.render('cart', { cart });
            } else {
                res.status(404).json({ error: 'Carrito no encontrado' });
            }
        } catch (error) {
            console.error(`Error al obtener el carrito con ID ${cid}:`, error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    async addProductToCart(req, res) {
        const cid = req.params.cid;
        const { productId, quantity } = req.body;

        try {
            const cart = await CartService.getCartById(cid);

            if (!cart) {
                return res.status(404).json({ error: 'Carrito no encontrado' });
            }

            await CartService.addProductToCart(cid, productId, quantity);

            const updatedCart = await CartService.getCartById(cid);
            req.io.emit('updateCart', updatedCart);

            res.status(201).json({ message: 'Producto agregado al carrito' });
        } catch (error) {
            console.error(`Error al agregar un producto al carrito con ID ${cid}:`, error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    async addQuantityToCart(req, res) {
        let cid = req.params.cid
        let pid = req.params.pid
        let quantity = parseInt(req.body.quantity)

        if (isNaN(quantity)) {
            return res.status(400).json({ error: 'La cantidad debe ser un número entero' })
        }

        CartService.addProductToCart(cid, pid, quantity)
        res.status(201).json({ message: 'Producto agregado al carrito' })
    }

    async deleteProductFromCart(req, res) {
        try {
            const { cid, pid } = req.params;

            const updatedCart = await Cart.findByIdAndUpdate(
                cid,
                { $pull: { products: { _id: pid } } },
                { new: true }
            ).populate('products.product');

            res.status(200).json({
                status: 'success',
                payload: updatedCart.products,
            });
        } catch (error) {
            console.error('Error al eliminar el producto del carrito:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    async updateCart(req, res) {
        try {
            const { cid } = req.params;
            const newProducts = req.body.products;

            const updatedCart = await Cart.findByIdAndUpdate(cid, { products: newProducts }, { new: true })
                .populate('products.product');

            res.status(200).json({
                status: 'success',
                payload: updatedCart.products,
            });
        } catch (error) {
            console.error('Error al actualizar el carrito:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    async updateProductInCart(req, res) {
        try {
            const { cid, pid } = req.params;
            const { quantity } = req.body;

            const updatedCart = await Cart.findOneAndUpdate(
                { _id: cid, 'products._id': pid },
                { $set: { 'products.$.quantity': quantity } },
                { new: true }
            ).populate('products.product');

            res.status(200).json({
                status: 'success',
                payload: updatedCart.products,
            });
        } catch (error) {
            console.error('Error al actualizar la cantidad del producto en el carrito:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    async deleteAllProductsInCart(req, res) {
        try {
            const { cid } = req.params;

            await Cart.findByIdAndUpdate(cid, { $set: { products: [] } });

            res.status(200).json({
                status: 'success',
                message: 'Todos los productos del carrito han sido eliminados',
            });
        } catch (error) {
            console.error('Error al eliminar todos los productos del carrito:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    async purchaseCart(cartId, sessionUsuario) {
        try {
            const cart = await Cart.findById(cartId);
            const failedProducts = [];
            const successfulProducts = [];
    
            // Generar el ticket independientemente de si hay productos que fallan o no
            const user = sessionUsuario;
            const purchaserEmail = user ? user.email : 'Unknown'; // Usar un correo desconocido si no hay usuario
            let totalAmount = 0; // Inicializar el monto total
    
            // Recorrer los productos del carrito
            for (const productItem of cart.products) {
                const productId = productItem.product;
                const quantity = productItem.quantity;
    
                const product = await productService.getProductById(productId);
                if (!product || product.stock < quantity) {
                    failedProducts.push(productId);
                } else {
                    // Calcular el subtotal del producto y sumarlo al monto total
                    totalAmount += product.price * quantity;
    
                    // Actualizar el stock del producto y guardar los cambios
                    product.stock -= quantity;
                    await product.save();
    
                    // Agregar el producto a la lista de productos exitosos
                    successfulProducts.push(productItem);
                }
            }
    
            // Generar el ticket con el monto total calculado solo si hay productos exitosos
            if (successfulProducts.length > 0) {
                const ticket = await ticketService.generateTicket(purchaserEmail, totalAmount);
            }
    
            // Actualizar el carrito del usuario si existe
            if (user && user.cartID) {
                const userCart = await Cart.findOne({ userId: user._id });
                if (userCart) {
                    // Filtrar los productos que no se pudieron comprar
                    const remainingProducts = cart.products.filter(productItem => failedProducts.includes(productItem.product));
                    userCart.products = remainingProducts;
                    await userCart.save();
                }
            }
    
            return failedProducts;
        } catch (error) {
            console.error('Error al procesar la compra:', error);
            throw error;
        }
    }
}

module.exports = new CartController();