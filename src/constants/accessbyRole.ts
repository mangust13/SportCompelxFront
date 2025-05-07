export const accessbyRole = {
    Trainer: [
        "Відвідування"
      ],
    InternalManager: [
      "Покупки",
      "Абонементи",
      "Тренери"
    ],
    PurchaseManager: [
        "Поставки",
        "Постачальники",
        "Типи продуктів",
      ]
  } as const

export type Role = keyof typeof accessbyRole;