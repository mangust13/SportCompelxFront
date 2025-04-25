export type PurchaseDto = {
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
  