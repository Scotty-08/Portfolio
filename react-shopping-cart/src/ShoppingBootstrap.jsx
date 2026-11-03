import React, { useState, useEffect } from "react";
import items from "./data/fashion.json";
    const Shop = () => {
        const [cart,setCart] = useState([]);
        const [cartTotal,setCartTotal] = useState(0);
    
    function howManyofThis(id) {
        let hmot = cart.filter((cartItem) => cartItem._id === id);
        return hmot.length;
    }
    const listItems = items.map((el) => (
    
        <div class="row border-top border-bottom" key={el._id}>
        <div class="row main align-items-center">
        <div class="col-2">
            <img class="img-fluid" src={el.image} />
        </div>
        <div class="col">
            <div class="row text-muted">{el.title}</div>
            <div class="row">{el.category}</div>
        </div>
        <div class="col">
            <button type="button" variant="light" onClick={() => removeFromCart(el)} > - </button>{" "}
            <button type="button" variant="light" onClick={() => addToCart(el)}> + </button>
        </div>
        <div class="col">
            ${el.price} <span class="close">&#10005;</span>{howManyofThis(el._id)}
        </div>
        </div>
        </div>
    ));

    const addToCart = (el) => {
        setCart([...cart, el]);
    }
    const removeFromCart = (el) => {
        const itemIndex = cart.findIndex((cartItem) => cartItem._id === el._id);
        if (itemIndex !== -1) {
            const updatedCart = [...cart];
            updatedCart.splice(itemIndex, 1);
            setCart(updatedCart);
        }
    }

    const groupedCart = cart.reduce((grouped, el) => {
        const existingItem = grouped.find((cartItem) => cartItem._id === el._id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            grouped.push({ ...el, quantity: 1 });
        }
        return grouped;
    }, []);

    const cartItem = groupedCart.map((el) => (
    <div className="d-flex align-items-center gap-2 mb-3" key={el._id}>
    <img className="img-fluid" src={el.image} width={90} alt={el.title} />
    <div>
        <div>{el.title}</div>
        <div>${el.price} × {el.quantity}</div>
    </div>
    </div>
    ));

    useEffect(() => {
        total();
    }, [cart]);

    const total = () => {
        let totalVal = 0;
        for (let i = 0; i < cart.length; i++) {
            totalVal += cart[i].price;
        }
        setCartTotal(totalVal);
    }



    return (
    <div>
    STORE SE/ComS319
    <div className="card">
        <div className="row">
        <div className="col-md-8 cart">
        <div class="title">
        <div class="row">
            <div class="col">
            <h4>
            <b>319 Shopping Cart</b>
            </h4>
            </div>
            <div class="col align-self-center text-right text-muted">
            Products selected {cart.length}
            </div>
        </div>
        </div>
        <div>{listItems}</div>
        </div>
        <div className="col-md-4 border-start p-3">
        <h5>Items in Cart</h5>
        <div>{cartItem}</div>
        <hr />
        <p className="d-flex justify-content-between align-items-center">
        <span>Order total:</span>
        <span className="lead fw-normal">${cartTotal}</span>
        </p>
        </div>
        </div>
    </div>
    </div>
    );
    }
    export default Shop;
