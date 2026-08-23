import { useMemo, useState } from 'react'
import { CartContext } from './cartContextValue'

export function CartProvider({ children }) {
  const [items, setItems] = useState([])

  const addItem = (product) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id)
      if (existing) {
        return current.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...current, { ...product, quantity: 1 }]
    })
  }

  const value = useMemo(
    () => ({ items, addItem, itemCount: items.reduce((total, item) => total + item.quantity, 0) }),
    [items],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
