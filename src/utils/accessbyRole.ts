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
        "Постачальники",
        "Типи продуктів",
      ]
  } as const

export type Role = keyof typeof accessbyRole;