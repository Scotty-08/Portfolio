# React Shopping Cart

A small store built with React, Vite and Bootstrap for my Iowa State web development class. Pick items from a product list, and the cart groups repeats into one line with a quantity and keeps a running total.

## What it does

- Lists 20 fashion products loaded from `src/data/fashion.json`.
- `+` adds an item to the cart and `-` removes one copy of it.
- Shows how many of each item are in the cart and the total number of products selected.
- Groups the cart with `reduce`, so two of the same jacket show as "x 2" instead of two rows.
- Recalculates the order total with `useEffect` whenever the cart changes.

## Files

- `src/ShoppingBootstrap.jsx` is the final store layout with Bootstrap and the grouped cart.
- `src/shopping.jsx` is the first version: a plain list with add, remove and a total.
- `src/main.jsx` mounts the store and loads Bootstrap.
- `src/data/fashion.json` holds the product data.

## Run it

```bash
npm install
npm run dev
```

Then open the local address Vite prints. `npm run build` makes a production build and `npm run lint` checks the code.
