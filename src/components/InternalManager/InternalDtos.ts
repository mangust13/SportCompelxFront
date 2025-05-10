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

export type ClientDto = { 
    clientId: number; 
    clientFullName: string; 
    clientPhoneNumber: string; 
    clientGender: string 
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

  export type ActivityDto = {
  activityId: number
  activityName: string
  activityPrice: number
  activityDescription: string
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