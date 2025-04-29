export const accessbyRole = {
    Trainer: [
        "Відвідування",
        "Gyms",
      ],
    InternalManager: [
      "Покупки",
      "Абонементи",
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