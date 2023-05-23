'use strict'

const { BadRequestError, NotFoundError } = require("../core/error.response");
const { cart } = require('../models/cart.model');

const { getProductById } = require("../models/repositories/product.repo");
/*
    Key features: Cart Services
    - add product 
    - reduce product quantity
    - increase product quantity
    - get cart (user)
    - delete cart (user)
    - delete cart item (user)
*/

class CartService {
    //Start repo cart
    static async createUserCart({userId, product}) {
        const query = { cartUserId: userId, cartState: 'active'},
        updateOrInsert = {
            $addToSet: {
                cartProducts: product
            }    
        }, options = { upsert: true, new: true}
        return await cart.findOneAndUpdate(query, updateOrInsert, options)
    }

    static async updateUserCart({userId, product}) {
        const { productId, quantity} = product;
        const query = {
            cartUserId: userId,
            'cartProducts.productId': productId,
            cartState: 'active'
        }, updateSet = {
            $inc: {
                'cartProducts.quantity': quantity
            }
        }, options = {upsert: true, new: true}
        return await cart.findOneAndUpdate( query, updateSet, options)
    }

  //update cart
  static async addToCartV2({ userId, shop_order_ids = {} }) {
    const { productId, quantity, old_quantity } =
      shop_order_ids[0]?.item_products[0];
    //check product
    const foundProduct = await getProductById(productId);
    if (!foundProduct) throw new NotFoundError("");
    //compare
    if (foundProduct.product_shop.toString() !== shop_order_ids[0].shopId) {
      throw new NotFoundError("Product do not belong to the shop");
    }

    //update cart 
    static async addToCartV2({ userId, shopOrderIds  }) {
        const { productId, quantity, oldQuantity } = shopOrderIds[0]?.itemProducts[0]
        //check product
        const foundProduct = await getProductById(productId)
        if(!foundProduct) throw new NotFoundError('')
        //compare

        if(foundProduct.shop.toString() !== shopOrderIds[0]?.shop) {
            throw new NotFoundError('Product do not belong to the shop')
        }
        if(quantity === 0) {
            //delete

        }
        return await CartService.updateUserCart({
            userId, 
            product: {
                productId, 
                quantity: quantity - oldQuantity
            }
            }
        )
    }


    static async deleteUserCart({ userId, productId }) {
        const query = { cartUserId: userId, cartState: 'active'},
        updateSet = {
            $pull: {
                cartProducts: {
                    productId
                }
            }
               
            
        }

        const deleteCart = await cart.updateOne( query, updateSet)

        return deleteCart
    }
    static async getListUserCart({ userId, productId }) {
        return await cart.findOne({
            cartUserId: +userId
    }).lean()
    }

}

module.exports = CartService
