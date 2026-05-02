'use server'

import { db } from '@/lib/db'
import { getStoreId } from '@/lib/get-store-id'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const IngredientSchema = z.object({
  name: z.string().min(1, '食材名を入力してください'),
  unit: z.string().min(1, '単位を入力してください'),
  unitPrice: z.coerce.number().min(0, '0以上の値を入力してください'),
  supplierName: z.string().optional(),
  stockAlert: z.coerce.number().min(0).optional().nullable(),
})

export type IngredientFormState = {
  errors?: {
    name?: string[]
    unit?: string[]
    unitPrice?: string[]
    supplierName?: string[]
    stockAlert?: string[]
  }
  message?: string
}

export async function createIngredient(
  _prev: IngredientFormState,
  formData: FormData
): Promise<IngredientFormState> {
  const parsed = IngredientSchema.safeParse({
    name: formData.get('name'),
    unit: formData.get('unit'),
    unitPrice: formData.get('unit_price'),
    supplierName: formData.get('supplier_name') || undefined,
    stockAlert: formData.get('stock_alert') || null,
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const storeId = await getStoreId()

  try {
    await db.ingredient.create({
      data: {
        storeId,
        name: parsed.data.name,
        unit: parsed.data.unit,
        unitPrice: parsed.data.unitPrice,
        supplierName: parsed.data.supplierName ?? null,
        stockAlert: parsed.data.stockAlert ?? null,
      },
    })
  } catch {
    return { message: '保存に失敗しました' }
  }

  revalidatePath('/dashboard/ingredient')
  return {}
}

export async function updateIngredient(
  id: string,
  _prev: IngredientFormState,
  formData: FormData
): Promise<IngredientFormState> {
  const parsed = IngredientSchema.safeParse({
    name: formData.get('name'),
    unit: formData.get('unit'),
    unitPrice: formData.get('unit_price'),
    supplierName: formData.get('supplier_name') || undefined,
    stockAlert: formData.get('stock_alert') || null,
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const storeId = await getStoreId()

  try {
    await db.ingredient.updateMany({
      where: { id, storeId },
      data: {
        name: parsed.data.name,
        unit: parsed.data.unit,
        unitPrice: parsed.data.unitPrice,
        supplierName: parsed.data.supplierName ?? null,
        stockAlert: parsed.data.stockAlert ?? null,
      },
    })
  } catch {
    return { message: '更新に失敗しました' }
  }

  revalidatePath('/dashboard/ingredient')
  return {}
}

export async function deleteIngredient(id: string): Promise<void> {
  const storeId = await getStoreId()
  await db.ingredient.deleteMany({ where: { id, storeId } })
  revalidatePath('/dashboard/ingredient')
}
