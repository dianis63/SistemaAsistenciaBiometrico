import { supabase } from '../db.js'

export async function getAll() {
  const { data, error } = await supabase.from('alumnos').select('*').order('nombre')
  if (error) throw new Error(error.message)
  return data
}

export async function getById(id) {
  const { data } = await supabase.from('alumnos').select('*').eq('id', id).single()
  return data || null
}

export async function create(nombre, carnet) {
  const { data, error } = await supabase.from('alumnos').insert({ nombre, carnet }).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function update(id, nombre, carnet) {
  const { data, error } = await supabase.from('alumnos').update({ nombre, carnet }).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function remove(id) {
  const { error } = await supabase.from('alumnos').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function solicitarRegistroHuella(alumno_id) {
  const { data: alumno } = await supabase.from('alumnos').select('*').eq('id', alumno_id).single()
  if (!alumno) throw new Error('Alumno no encontrado')
  const { error } = await supabase.from('comandos').insert({ tipo: 'registrar_huella', alumno_id })
  if (error) throw new Error(error.message)
  return { ok: true, mensaje: 'Comando enviado al Arduino' }
}

export async function solicitarBorrarHuella(alumno_id) {
  await supabase.from('comandos').insert({ tipo: 'borrar_huella', alumno_id })
  const { error } = await supabase.from('alumnos').update({ huella_id: null }).eq('id', alumno_id)
  if (error) throw new Error(error.message)
  return { ok: true }
}