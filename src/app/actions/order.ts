'use server'

import { db } from '@/lib/db'
import { getStoreId } from '@/lib/get-store-id'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const OrderSchema = z.object({
  note: z.string().optional(),
})

const OrderItemSchema = z.object({
  ingredientId: z.string().min(1, '食材を選択してください'),
  quantity: z.coerce.number().positive('0より大きい値を入力してください'),
  unitPrice: z.coerce.number().min(0, '0以上の値を入力してください'),
})

export type OrderFormState = {
  errors?: Record<string, string[]>
  message?: string
}

export async function createOrder(
  _prev: OrderFormState,
  formData: FormData
): Promise<OrderFormState> {
  const storeId = await getStoreId()

  const parsed = OrderSchema.safeParse({
    note: formData.get('note') || undefined,
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  try {
    await db.order.create({
      data: {
        storeId,
        status: 'draft',
        note: parsed.data.note ?? null,
      },
    })
  } catch {
    return { message: '作成に失敗しました' }
  }

  revalidatePath('/dashboard/order')
  return {}
}

export async function addOrderItem(
  orderId: string,
  _prev: OrderFormState,
  formData: FormData
): Promise<OrderFormState> {
  const parsed = OrderItemSchema.safeParse({
    ingredientId: formData.get('ingredient_id'),
    quantity: formData.get('quantity'),
    unitPrice: formData.get('unit_price'),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  try {
    await db.orderItem.create({
      data: {
        orderId,
        ingredientId: parsed.data.ingredientId,
        quantity: parsed.data.quantity,
        unitPrice: parsed.data.unitPrice,
      },
    })
  } catch {
    return { message: 'この食材はすでに追加されています' }
  }

  revalidatePath('/dashboard/order')
  return {}
}

export async function removeOrderItem(id: string): Promise<void> {
  await db.orderItem.delete({ where: { id } })
  revalidatePath('/dashboard/order')
}

export async function updateOrderStatus(id: string, status: string): Promise<void> {
  const storeId = await getStoreId()
  const now = new Date()

  await db.order.updateMany({
    where: { id, storeId },
    data: {
      status,
      ...(status === 'ordered' ? { orderedAt: now } : {}),
      ...(status === 'received' ? { receivedAt: now } : {}),
    },
  })

  revalidatePath('/dashboard/order')
}

export async function deleteOrder(id: string): Promise<void> {
  const storeId = await getStoreId()
  await db.order.deleteMany({ where: { id, storeId, status: 'draft' } })
  revalidatePath('/dashboard/order')
}
