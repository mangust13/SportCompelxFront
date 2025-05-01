export type PurchaseDto = {
    purchaseId: number 
    purchaseNumber: number
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
  
  export type AttendanceRecordDto = {
    purchaseNumber: number
    purchaseDate: string
    subscriptionName: string
    subscriptionTerm: string
    subscriptionVisitTime: string
    activityName: string
    trainerName: string
    gymNumber: string
    sportComplexAddress: string
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