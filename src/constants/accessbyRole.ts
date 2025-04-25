export const accessbyRole = {
    Trainer: [
        "ActivityInGym",
        "DaysOfWeek",
        "Gyms",
        "GymStatuses",
        "Schedules",
        "SportComplexes",
        "TrainerActivities",
        "Trainers",
        "TrainerSchedules",
        "Trainings"
      ],
    InternalManager: [
      "Clients",
      "Purchases",
      "BaseSubscriptions",
      "Subscriptions",
      "Activities",
      "AttendanceRecords",
    ],
    PurchaseManager: [
        "Suppliers",
        "Orders",
        "OrderStatuses",
        "PurchasedProducts",
        "Deliveries",
        "Products",
        "ProductTypes",
        "Brands",
      ]
  } as const

export type Role = keyof typeof accessbyRole;