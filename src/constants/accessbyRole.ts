export const accessbyRole = {
    Trainer: [
        "AttendanceRecords",
        "Gyms",
        "Schedules",
        "SportComplexes",
        "Trainers",
        "TrainerSchedules",
        "Trainings"
      ],
    InternalManager: [
      "Purchases",
      "Subscriptions",
      "Activities",
    ],
    PurchaseManager: [
        "Suppliers",
        "Orders",
        "PurchasedProducts",
        "Deliveries",
        "Products",
      ]
  } as const

export type Role = keyof typeof accessbyRole;