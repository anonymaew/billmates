import type { NextApiRequest, NextApiResponse } from 'next'
import { createReceipt } from '../../../lib/create'
import type { CreateReceipt } from '../../../lib/create'

export default async (
  req: NextApiRequest,
  res: NextApiResponse<void>
) => {
  const data = {
    selfId: req.body.selfId,
    groupId: req.body.groupId,
    receipt: {
      name: req.body.name,
      payerId: req.body.payerId,
      createdAt: req.body.createdAt ?
        new Date(req.body.createdAt) : undefined,
    }
  }

  try {
    const receipt = await createReceipt(data)
    const receiptId = receipt.id.toString()

    res.redirect(307, `/${data.selfId}/${data.groupId}/receipt?id=${receiptId}`)
  } catch (err) {
    console.error(err)
    res.redirect(307, `/${data.selfId}/${data.groupId}?error`)
  }
}
