import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://eomsonurxulnfjarhjdg.supabase.co'
const supabaseKey = 'sb_publishable_1gjB9awSoNUiCH8KALRJzA_55VxnWl0'

export const supabase = createClient(supabaseUrl, supabaseKey)