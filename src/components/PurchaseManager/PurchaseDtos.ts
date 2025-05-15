export type DeliveryDto = {
  deliveryId: number
  deliveryDate: string
  deliveredQuantity: number
  gymNumber: number
  complexAddress: string
  complexCity: string
}

export type PurchasedProductDto = {
  purchasedProductId: number
  productId: number
  productName: string
  quantity: number
  unitPrice: number
  productDescription: string
  brandName: string
  productType: string
  deliveries: DeliveryDto[]
}

export type OrderDto = {
  orderId: number
  orderNumber: number
  orderDate: string
  orderTotalPrice: number
  paymentMethod: string
  orderStatus: string
  supplierName: string
  purchasedProducts: PurchasedProductDto[]
}

export type SupplierDto = {
  supplierId: number
  supplierName: string
  supplierPhoneNumber: string
  supplierLicense: string
}

export type BrandDto = { brandId: number, brandName: string }
export type ProductTypeDto = { productTypeId: number, productTypeName: string }


export type ProductDto = {
  productId: number
  productModel: string
  brandId: number
  brandName: string
  productTypeId: number
  productTypeName: string
  productDescription: string
  unitPrice: number
}

