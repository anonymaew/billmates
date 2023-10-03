import type { NextApiRequest, NextApiResponse } from 'next'
import { createItem } from '../../../lib/create'
import type { CreateItem } from '../../../lib/create'

export default async (
  req: NextApiRequest,
  res: NextApiResponse<void>
) => {
  const data = {
    selfId: req.body.selfId,
    groupId: req.body.groupId,
    receiptId: req.body.receiptId,
    item: {
      name: req.body.name,
      price: Number(req.body.price),
      payeeIds: (typeof req.body.payeeIds === 'string') ?
        [req.body.payeeIds] : req.body.payeeIds,
    }
  }

  try {
    const item = await createItem(data)
    const itemId = item.id.toString()

    res.redirect(307, `/${data.selfId}/${data.groupId}/receipt?id=${data.receiptId}`)
  } catch (err) {
    console.error(err)
    res.redirect(307, `/${data.selfId}/${data.groupId}/receipt?id=${data.receiptId}&error`)
  }
}
