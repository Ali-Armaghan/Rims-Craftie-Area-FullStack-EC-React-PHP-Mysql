import React, { createContext, useContext, useState } from 'react'
import { Product } from '../types'

type ProductsDialogType = 'add' | 'edit' | 'delete'

interface ProductsContextType {
  open: ProductsDialogType | null
  setOpen: (str: ProductsDialogType | null) => void
  currentRow: Product | null
  setCurrentRow: (row: Product | null) => void
}

const ProductsContext = createContext<ProductsContextType | null>(null)

export const ProductsProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState<ProductsDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<Product | null>(null)

  return (
    <ProductsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </ProductsContext.Provider>
  )
}

export const useProducts = () => {
  const context = useContext(ProductsContext)
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider')
  }
  return context
}
