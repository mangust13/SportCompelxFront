

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


export type Purchase = {
  purchaseId: number
  purchaseNumber: number
  subscriptionName: string
  activities: { activityId: number; activityName: string; activityTypeAmount: number }[]
  totalAttendances: number
  subscriptionTerm: string
  purchaseDate: string
}

export type Schedule = {
  trainerScheduleId: number
  scheduleId: number
  dayName: string
  startTime: string
  endTime: string
  activityId: number
  activityName: string
  gymNumber: number
  sportComplexAddress: string
  sportComplexCity: string
  trainerId: number
}

export type TrainerProfileDto = {
  trainerFullName: string
  activities: ActivityDto[]
  schedules: Schedule[]
}

export type PurchaseShortDto = {
  purchaseId: number
  purchaseNumber: number
  subscriptionName: string
}

export type ClientOption = {
  value: number
  label: string
  purchases: PurchaseShortDto[]
}