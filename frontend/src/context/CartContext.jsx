import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartCount, setCartCount] = useState(0);
    const [isCartOpen, setIsCartOpen] = useState(false);

    return (
        <CartContext.Provider value={{ cartCount, isCartOpen, setCartCount, setIsCartOpen }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
