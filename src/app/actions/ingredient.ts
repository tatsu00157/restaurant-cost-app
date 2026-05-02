'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { getStoreId } from '@/lib/get-store-id'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const IngredientSchema = z.object({
  name: z.string().min(1, '食材名を入力してください'),
  unit: z.string().min(1, '単位を入力してください'),
  unit_price: z.coerce.number().min(0, '0以上の値を入力してください'),
  supplier_name: z.string().optional(),
  stock_alert: z.coerce.number().min(0).optional().nullable(),
})

export type IngredientFormState = {
  errors?: {
    name?: string[]
    unit?: string[]
    unit_price?: string[]
    supplier_name?: string[]
    stock_alert?: string[]
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
    unit_price: formData.get('unit_price'),
    supplier_name: formData.get('supplier_name') || undefined,
    stock_alert: formData.get('stock_alert') || null,
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const supabase = createAdminClient()
  const store_id = await getStoreId()

  const { error } = await supabase.from('ingredients').insert({
    store_id,
    ...parsed.data,
  })

  if (error) return { message: '保存に失敗しました: ' + error.message }

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
    unit_price: formData.get('unit_price'),
    supplier_name: formData.get('supplier_name') || undefined,
    stock_alert: formData.get('stock_alert') || null,
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const supabase = createAdminClient()
  const store_id = await getStoreId()

  const { error } = await supabase
    .from('ingredients')
    .update(parsed.data)
    .eq('id', id)
    .eq('store_id', store_id)

  if (error) return { message: '更新に失敗しました: ' + error.message }

  revalidatePath('/dashboard/ingredient')
  return {}
}

export async function deleteIngredient(id: string): Promise<void> {
  const supabase = createAdminClient()
  const store_id = await getStoreId()

  await supabase
    .from('ingredients')
    .delete()
    .eq('id', id)
    .eq('store_id', store_id)

  revalidatePath('/dashboard/ingredient')
}
