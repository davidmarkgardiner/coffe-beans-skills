export interface Product {
  id: string
  name: string
  description: string
  price: number
  weight: string
  category: string
  image: string
  badge?: string
}

export interface CartItem extends Product {
  quantity: number
}
