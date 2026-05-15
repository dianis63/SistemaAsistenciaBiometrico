import { supabase } from '../db.js'

export async function getAll() {
  const { data, error } = await supabase
    .from('sesiones')
    .select('*, materias(nombre)')
    .order('fecha', { ascending: false })
  if (error) throw new Error(error.message)
  return data.map(s => ({ ...s, materia_nombre: s.materias?.nombre }))
}

export async function getActiva() {
  const { data } = await supabase
    .from('sesiones')
    .select('*, materias(nombre)')
    .eq('activa', true)
    .maybeSingle()   // ← mismo fix
  if (!data) return null
  return { ...data, materia_nombre: data.materias?.nombre }
}

export async function iniciar(materia_id, minutos_tolerancia = 15) {
  const activa = await getActiva()
  if (activa) throw new Error('Ya hay una sesión activa')
  const { data, error } = await supabase.from('sesiones').insert({ materia_id, minutos_tolerancia }).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function cerrar(id) {
  const { data, error } = await supabase
    .from('sesiones')
    .update({ activa: false, hora_fin: new Date().toISOString() })
    .eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return data
}