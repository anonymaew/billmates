import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export type CreateReceipt = {
  selfId: string,
  groupId: string,
  receipt: {
    name: string,
    payerId: string,
    createdAt?: Date,
  }
}

export const createReceipt = async (
  { selfId, groupId, receipt }: CreateReceipt
) => {
  const { name, payerId, createdAt } = receipt
  const newReceipt = await prisma.receipt.create({
    data: {
      name,
      payer: { connect: { id: payerId } },
      group: { connect: { id: groupId } },
      createdAt: createdAt ?
        createdAt.toISOString() : undefined,
    },
  })

  return newReceipt
}

export type CreateItem = {
  selfId: string,
  receiptId: string,
  item: {
    name: string,
    price: number,
    payeeIds: string[],
  }
}

export const createItem = async (
  { selfId, receiptId, item }: CreateItem
) => {
  const { name, price, payeeIds } = item
  const newItem = await prisma.item.create({
    data: {
      name,
      price,
      receipt: { connect: { id: receiptId } },
      payee: { connect: payeeIds.map(id => ({ id })) },
    },
  })

  return newItem
}
