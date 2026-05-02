import { createClient } from '@/lib/supabase/server'
import { getStoreId } from '@/lib/get-store-id'
import IngredientTable from './_components/IngredientTable'

export default async function IngredientPage() {
  const supabase = await createClient()
  const store_id = await getStoreId()

  const { data: ingredients } = await supabase
    .from('ingredients')
    .select('*')
    .eq('store_id', store_id)
    .order('name')

  return (
    <div className="p-8">
      <IngredientTable ingredients={ingredients ?? []} />
    </div>
  )
}
