const Product = require('../models/Products/product')
// const User = require('../models/User/user')
const jwt = require('jsonwebtoken')
const JWTSECRECT = 'KJNHJSDEGHJVFEBHJH'
const { ObjectId } = require('mongodb')
const Cart = require('../models/Products/cart')
const Order = require('../models/Products/order')
const Review = require('../models/Products/review')
const User = require('../models/User/user')
// get all products for display
exports.getAllProducts = async (req, res, next) => {

    try {
        const products = await Product.find({});
        if (products) {
            res.status(200).json({ products })
        } else {
            res.status(404).json({ message: "NOTHING_FOUND" })
        }
    } catch (err) { console.log(err) }
}
// get single product which user clicked and want to buy
exports.getSingleProduct = async (req, res) => {

    try {
        const _id = req.body.id
        const singleProduct = await Product.findById({ _id })
        const reviews = await Review.find({ productId: _id })

        res.status(200).json({ singleProduct, reviews })

    } catch (error) {
        console.log(error)
    }
}

//add product in cart
exports.addProductToCart = async (req, res) => {
    const { authorization } = req.headers
    const { productId, productSize, productsInCart } = req.body
    if (!authorization) {
        return res.status(401).json({ error: "😡😡😡😡" })
    } else {
        try {
            const { userId } = jwt.verify(authorization, JWTSECRECT);
            const alreadyInCart = await Cart.find({ productId, userId })
            if (alreadyInCart.length != 0) {
                res.status(301).json({ message: "Already in Cart" })
            } else {
                const product = await Product.findById({ _id: ObjectId(productId) })
                await new Cart({
                    userId,
                    productId,
                    productName: product.name,
                    productPrice: product.price,
                    productsInCart,
                    productSize,
                    productImage: product.images[0].url
                }).save()
                res.status(200).json({ message: "Product added to cart" })
            }
        } catch (error) {
            console.log(error)
            res.status(501).json({ message: "Please login to add in cart" })
        }
    }
}
// get product in cart for a user
exports.getProductsInCart = async (req, res) => {
    const { authorization } = req.headers
    if (!authorization) {
        return res.status(401).json({ error: "😡😡😡😡" })
    } else {
        try {
            const { userId } = jwt.verify(authorization, JWTSECRECT);
            const productsInCart = await Cart.find({ userId })
            if (productsInCart) {
                res.status(200).json({ productsInCart })
            } else {
                res.status(200).json({ message: "Nothing in carrt" })
            }

        } catch (error) {
            console.log(error)
        }
    }
}
exports.deleteProductFromCart = async (req, res) => {

    const _id = req.body.id;
    const { authorization } = req.headers
    if (!authorization) {
        return res.status(401).json({ error: "😡😡😡😡" })
    } else {
        try {
            const productsInCartDeleted = await Cart.findByIdAndDelete({ _id })
            const { userId } = jwt.verify(authorization, JWTSECRECT);
            const productsInCart = await Cart.find({ userId })
            if (productsInCartDeleted) {
                res.status(200).json({ productsInCart, message: "Deleted from cart" })
            } else {
                res.status(200).json({ message: "Nothing in carrt" })
            }

        } catch (error) {
            console.log(error)
        }
    }
}
exports.addOrder = async (req, res) => {
    const { authorization } = req.headers
    const { address } = req.body
    if (!authorization) {
        return res.status(401).json({ error: "😡😡😡😡" })
    } else {
        try {
            const { userId } = jwt.verify(authorization, JWTSECRECT);
            const productsInCart = await Cart.find({ userId })
            const timeAndDate = "Time " + new Date().getHours() + " : " + new Date().getMinutes() + " Dated " + new Date().getDate() + " / " + new Date().getMonth()
            await new Order({
                userId,
                products: productsInCart,
                address,
                timeAndDate,
                status: {
                    color: "green",
                    text: "Ordered"
                }
            }).save();
            await Cart.deleteMany({ userId })
            res.status(200).json({
                productsInCart: [],
                message: "Order Confirmed"
            })
        } catch (error) {
            console.log(error)
            res.status(501).json({ message: "Please login to add in cart" })
        }
    }
}

exports.getOrders = async (req, res) => {
    const { authorization } = req.headers
    if (!authorization) {
        return res.status(401).json({ error: "😡😡😡😡" })
    } else {
        try {
            const { userId } = jwt.verify(authorization, JWTSECRECT);
            const orders = await Order.find({ userId })
            res.status(200).json({ orders })
        } catch (error) {
            console.log(error)
            res.status(501).json({ message: "Please login to add in cart" })
        }
    }
}

exports.addReview = async (req, res) => {
    const { authorization } = req.headers
    const { review, productId } = req.body;
    if (!authorization) {
        return res.status(401).json({ error: "😡😡😡😡" })
    } else {
        try {
            const { userId } = jwt.verify(authorization, JWTSECRECT);
            const user = await User.findById({ _id: ObjectId(userId) })
            const time = new Date().getHours() + " : " + new Date().getMinutes();
            await new Review({
                productId,
                userName: user.username,
                review,
                time
            }).save()
            const reviews = await Review.find({ productId });

            res.status(200).json({ reviews, message: "Thank You ! Review Added " })
        } catch (error) {
            console.log(error)
            res.status(501).json({ message: "Please login to add in cart" })
        }
    }
}
