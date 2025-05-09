export type PurchaseDto = {
    purchaseId: number 
    purchaseNumber: number
    totalAttendances: number
    purchaseDate: string
    paymentMethod: string
    clientFullName: string
    clientGender: string
    clientPhoneNumber: string
    subscriptionName: string
    subscriptionTotalCost: number
    subscriptionTerm: string
    subscriptionVisitTime: string
    activities: {
      activityName: string
      activityPrice: number
      activityDescription: string
      activityTypeAmount: number
    }[]
  }
  
  export type SubscriptionDto = {
    subscriptionId: number
    subscriptionName: string
    subscriptionTotalCost: number
    subscriptionTerm: string
    subscriptionVisitTime: string
    activities: {
      activityName: string
      activityPrice: number
      activityDescription: string
      activityTypeAmount: number
    }[]
  }

  export type TrainerScheduleEntryDto = {
    scheduleId: number
    dayName: string
    activityName: string
    startTime: string
    endTime: string
}

 export type TrainerFullScheduleDto = {
  trainerId: number
  trainerFullName: string
  trainerPhoneNumber: string
  trainerGender: string
  trainerAddress: string
  trainerCity: string
  schedule: TrainerScheduleEntryDto[]
}

// Trainer
export type AttendanceRecordDto = {
  attendanceId: number
  purchaseNumber: number
  purchaseDate: string
  clientFullName: string
  subscriptionName: string
  subscriptionTerm: string
  subscriptionVisitTime: string
  subscriptionActivities: ActivityDto[]
  gymNumber: number
  sportComplexAddress: string
  sportComplexCity: string
  attendanceDateTime: string
  trainingStartTime: string
  trainingEndTime: string
  trainingActivity: string
}

export type ActivityDto = {
  activityId: number
  activityName: string
}


// PurchaseManager
export type DeliveryDto = {
  deliveryId: number
  deliveryDate: string
  deliveredQuantity: number
  gymNumber: number
}

export type PurchasedProductDto = {
  purchasedProductId: number
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


export type ProductDto = {
  productId: number
  brandName: string
  productModel: string
  productType: string
  productDescription: string
}