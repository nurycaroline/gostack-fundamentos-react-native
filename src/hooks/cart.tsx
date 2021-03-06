import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsStorage = await AsyncStorage.getItem('@GoBarber-cart');
      if (productsStorage) {
        setProducts(JSON.parse(productsStorage));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const newProducts = [...products];

      const productIndex = newProducts.findIndex(
        (item: Product) => item.id === product.id,
      );

      if (productIndex >= 0) {
        newProducts[productIndex].quantity += 1;
      } else {
        newProducts.push({
          ...product,
          quantity: 1,
        });
      }

      setProducts(newProducts);
      AsyncStorage.setItem('@GoBarber-cart', JSON.stringify(newProducts));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newProducts = [...products];
      const productIndex = newProducts.findIndex(p => p.id === id);

      if (productIndex >= 0) {
        newProducts[productIndex].quantity += 1;
      }

      setProducts(newProducts);
      AsyncStorage.setItem('@GoBarber-cart', JSON.stringify(newProducts));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      let newProducts = [...products];
      const productIndex = newProducts.findIndex(p => p.id === id);

      if (productIndex >= 0 && newProducts[productIndex].quantity - 1 > 0) {
        newProducts[productIndex].quantity -= 1;
      } else {
        newProducts = newProducts.filter(p => p.id !== id);
      }

      setProducts(newProducts);
      AsyncStorage.setItem('@GoBarber-cart', JSON.stringify(newProducts));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
