import { PrismaClient } from '@prisma/client'
import type { Item, Payment, Receipt, User } from '@prisma/client'

const prisma = new PrismaClient()

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

// const data = await groupSummary('07e95dc6-a3b9-4cd3-be73-74b78313659e', 'ad75b33a-70bb-4f17-9cdc-92b7b15f8625')
// const data = await receiptSummary('07e95dc6-a3b9-4cd3-be73-74b78313659e', '35a29f91-2734-4085-bc4f-612e9e048448')
// console.log(JSON.stringify(data, null, 2))
