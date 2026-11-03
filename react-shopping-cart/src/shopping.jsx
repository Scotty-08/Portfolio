import React, { useState, useEffect } from "react";
import items from "./data/fashion.json";

const Shop = () => {
    const [cart, setCart] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);

    const listItems = items.map((el) => (
        <div key={el._id}>
            <img className="img-fluid" src={el.image} width={150} alt={el.title} /> <br />
            {el.title} <br />
            {el.category} <br />
            ${el.price} <br />
            <button type="button" onClick={() => removeFromCart(el)}> - </button>{" "}
            <button type="button" onClick={() => addToCart(el)}> + </button>
        </div>
    ));

    const addToCart = (el) => {
        setCart([...cart, el]);
    };

    const removeFromCart = (el) => {
        const hardCopy = cart.filter((cartItem) => cartItem._id !== el._id);
        setCart(hardCopy);
    };

    const cartItems = cart.map((el, index) => (
        <div key={`${el._id}-${index}`}>
            <img className="img-fluid" src={el.image} width={150} alt={el.title} /> <br />
            {el.title} ${el.price}
        </div>
    ));

    useEffect(() => {
        let totalVal = 0;
        for (let i = 0; i < cart.length; i++) {
            totalVal += cart[i].price;
        }
        setCartTotal(totalVal);
    }, [cart]);

    return (
        <div>
            <div>{listItems}</div>
            <h1>Items in Cart</h1>
            <div>{cartItems}</div>
            <h2>Total: ${cartTotal}</h2>
        </div>
    );
};

export default Shop;
