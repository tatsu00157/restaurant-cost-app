'use server'

import { db } from '@/lib/db'
import { getStoreId } from '@/lib/get-store-id'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const MenuSchema = z.object({
  name: z.string().min(1, 'メニュー名を入力してください'),
  sellingPrice: z.coerce.number().min(0, '0以上の値を入力してください'),
  category: z.string().optional(),
})

const MenuIngredientSchema = z.object({
  ingredientId: z.string().min(1, '食材を選択してください'),
  quantity: z.coerce.number().positive('0より大きい値を入力してください'),
})

export type MenuFormState = {
  errors?: {
    name?: string[]
    sellingPrice?: string[]
    category?: string[]
  }
  message?: string
}

export type MenuIngredientFormState = {
  errors?: {
    ingredientId?: string[]
    quantity?: string[]
  }
  message?: string
}

export async function createMenu(
  _prev: MenuFormState,
  formData: FormData
): Promise<MenuFormState> {
  const parsed = MenuSchema.safeParse({
    name: formData.get('name'),
    sellingPrice: formData.get('selling_price'),
    category: formData.get('category') || undefined,
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const storeId = await getStoreId()

  try {
    await db.menu.create({
      data: {
        storeId,
        name: parsed.data.name,
        sellingPrice: parsed.data.sellingPrice,
        category: parsed.data.category ?? null,
      },
    })
  } catch {
    return { message: '保存に失敗しました' }
  }

  revalidatePath('/dashboard/menu')
  return {}
}

export async function updateMenu(
  id: string,
  _prev: MenuFormState,
  formData: FormData
): Promise<MenuFormState> {
  const parsed = MenuSchema.safeParse({
    name: formData.get('name'),
    sellingPrice: formData.get('selling_price'),
    category: formData.get('category') || undefined,
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const storeId = await getStoreId()

  try {
    await db.menu.updateMany({
      where: { id, storeId },
      data: {
        name: parsed.data.name,
        sellingPrice: parsed.data.sellingPrice,
        category: parsed.data.category ?? null,
      },
    })
  } catch {
    return { message: '更新に失敗しました' }
  }

  revalidatePath('/dashboard/menu')
  revalidatePath(`/dashboard/menu/${id}`)
  return {}
}

export async function deleteMenu(id: string): Promise<void> {
  const storeId = await getStoreId()
  await db.menu.deleteMany({ where: { id, storeId } })
  revalidatePath('/dashboard/menu')
}

export async function addMenuIngredient(
  menuId: string,
  _prev: MenuIngredientFormState,
  formData: FormData
): Promise<MenuIngredientFormState> {
  const parsed = MenuIngredientSchema.safeParse({
    ingredientId: formData.get('ingredient_id'),
    quantity: formData.get('quantity'),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  try {
    await db.menuIngredient.create({
      data: {
        menuId,
        ingredientId: parsed.data.ingredientId,
        quantity: parsed.data.quantity,
      },
    })
  } catch {
    return { message: 'この食材はすでに登録されています' }
  }

  revalidatePath(`/dashboard/menu/${menuId}`)
  return {}
}

export async function updateMenuIngredient(
  id: string,
  menuId: string,
  _prev: MenuIngredientFormState,
  formData: FormData
): Promise<MenuIngredientFormState> {
  const parsed = z.object({
    quantity: z.coerce.number().positive('0より大きい値を入力してください'),
  }).safeParse({ quantity: formData.get('quantity') })

  if (!parsed.success) {
    return { errors: { quantity: parsed.error.flatten().fieldErrors.quantity } }
  }

  try {
    await db.menuIngredient.update({
      where: { id },
      data: { quantity: parsed.data.quantity },
    })
  } catch {
    return { message: '更新に失敗しました' }
  }

  revalidatePath(`/dashboard/menu/${menuId}`)
  return {}
}

export async function removeMenuIngredient(id: string, menuId: string): Promise<void> {
  await db.menuIngredient.delete({ where: { id } })
  revalidatePath(`/dashboard/menu/${menuId}`)
}
