export const accessbyRole = {
    Trainer: [
        "Відвідування",
        "Мій розклад"
      ],
    InternalManager: [
      "Покупки",
      "Абонементи",
      "Тренери"
    ],
    PurchaseManager: [
        "Поставки",
        "Типи продуктів",
        "Інвентар у залі"
      ]
  } as const

export type Role = keyof typeof accessbyRole;