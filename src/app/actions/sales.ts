'use server'

import { db } from '@/lib/db'
import { getStoreId } from '@/lib/get-store-id'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const SalesSchema = z.object({
  date: z.string().min(1, '日付を入力してください'),
  salesAmount: z.coerce.number().min(0, '0以上の値を入力してください'),
  laborCost: z.coerce.number().min(0).default(0),
  otherCost: z.coerce.number().min(0).default(0),
  note: z.string().optional(),
})

export type SalesFormState = {
  errors?: {
    date?: string[]
    salesAmount?: string[]
    laborCost?: string[]
    otherCost?: string[]
  }
  message?: string
}

export async function upsertDailySales(
  _prev: SalesFormState,
  formData: FormData
): Promise<SalesFormState> {
  const parsed = SalesSchema.safeParse({
    date: formData.get('date'),
    salesAmount: formData.get('sales_amount'),
    laborCost: formData.get('labor_cost') || 0,
    otherCost: formData.get('other_cost') || 0,
    note: formData.get('note') || undefined,
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const storeId = await getStoreId()
  const date = new Date(parsed.data.date)

  try {
    await db.dailySale.upsert({
      where: { storeId_date: { storeId, date } },
      update: {
        salesAmount: parsed.data.salesAmount,
        laborCost: parsed.data.laborCost,
        otherCost: parsed.data.otherCost,
        note: parsed.data.note ?? null,
      },
      create: {
        storeId,
        date,
        salesAmount: parsed.data.salesAmount,
        laborCost: parsed.data.laborCost,
        otherCost: parsed.data.otherCost,
        note: parsed.data.note ?? null,
      },
    })
  } catch {
    return { message: '保存に失敗しました' }
  }

  revalidatePath('/dashboard/sales')
  return {}
}
