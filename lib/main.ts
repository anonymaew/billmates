import { PrismaClient } from '@prisma/client'
import type { Item, Payment, Receipt, User } from '@prisma/client'

const prisma = new PrismaClient()

export type ReceiptDetail = Receipt & {
  items: (Item & { payee: User[] })[],
  payer: User,
  owed: number,
}

export const groupSummary = async (selfId: string, groupId: string) => {
  const group = await prisma.group.findUnique({
    where: {
      id: groupId,
      users: { some: { id: selfId, }, },
    },
    include: {
      users: true,
      receipts: {
        include: {
          items: {
            include: {
              payee: true,
            },
          },
          payer: true,
        },
      },
      payments: true,
    },
  })

  if (!group) {
    return null
  }

  const receiptSummaries = group.receipts.map((receipt) => {
    return {
      ...receipt,
      items: undefined,
      owed: calcReceiptSummary(receipt, selfId),
    }
  })

  const balanceSummaries = group.users.map((user) => {
    return {
      ...user,
      balance: user.id === selfId ? undefined :
        calcBalanceSummary(group.receipts, group.payments, selfId, user.id),
    }
  })

  return {
    ...group,
    users: balanceSummaries,
    receipts: receiptSummaries,
  }
}

const calcReceiptSummary = (
  receipt: Receipt & { items: (Item & { payee: User[] })[] },
  selfId: string
) => {
  return Number(receipt.items
    .filter((item) => item.payee.some((user) => user.id === selfId))
    .reduce((acc, item) => acc + item.price / item.payee.length, 0)
    .toFixed(2));
}

const calcBalanceSummary = (
  receipts: (Receipt & { items: (Item & { payee: User[] })[] } & { payer: User })[],
  payments: Payment[],
  selfId: string,
  userId: string
) => {
  return Number((
    receipts
      .filter((receipt) => receipt.payer.id === userId)
      .reduce((acc, receipt) => acc + calcReceiptSummary(receipt, selfId), 0) -
    receipts
      .filter((receipt) => receipt.payer.id === selfId)
      .reduce((acc, receipt) => acc + calcReceiptSummary(receipt, userId), 0) +
    payments
      .filter((payment) => payment.payerId === userId && payment.payeeId === selfId)
      .reduce((acc, payment) => acc + payment.amount, 0) -
    payments
      .filter((payment) => payment.payerId === selfId && payment.payeeId === userId)
      .reduce((acc, payment) => acc + payment.amount, 0)
  ).toFixed(2));
}

export const receiptSummary = async (userId:string, receiptId: string) => {
  const receipt = await prisma.receipt.findUniqueOrThrow({
    where: {
      id: receiptId,
      group: {
        users: { some: { id: userId, }, },
      },
    },
    include: {
      items: {
        include: {
          payee: true,
        },
      },
      payer: true,
      group: {
        include: {
          users: true,
        },
      },
    },
  })

  return {
    ...receipt,
    owed: calcReceiptSummary(receipt, userId),
  }
}
