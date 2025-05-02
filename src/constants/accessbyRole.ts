export const accessbyRole = {
    Trainer: [
        "Відвідування",
        "Зали",
      ],
    InternalManager: [
      "Покупки",
      "Абонементи",
      "Тренери"
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