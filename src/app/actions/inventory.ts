'use server'

import { db } from '@/lib/db'
import { getStoreId } from '@/lib/get-store-id'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const InventorySchema = z.object({
  ingredientId: z.string().min(1),
  quantity: z.coerce.number().min(0, '0以上の値を入力してください'),
})

export type InventoryFormState = {
  errors?: {
    quantity?: string[]
  }
  message?: string
}

export async function updateInventory(
  _prev: InventoryFormState,
  formData: FormData
): Promise<InventoryFormState> {
  const parsed = InventorySchema.safeParse({
    ingredientId: formData.get('ingredient_id'),
    quantity: formData.get('quantity'),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const storeId = await getStoreId()
  const { ingredientId, quantity } = parsed.data

  try {
    await db.inventory.upsert({
      where: { storeId_ingredientId: { storeId, ingredientId } },
      update: { quantity },
      create: { storeId, ingredientId, quantity },
    })

    await db.inventoryLog.create({
      data: { storeId, ingredientId, quantity, source: 'web' },
    })
  } catch {
    return { message: '更新に失敗しました' }
  }

  revalidatePath('/dashboard/inventory')
  return {}
}
