import { supabase } from '../db.js'

export async function getAll() {
  const { data, error } = await supabase.from('materias').select('*').order('nombre')
  if (error) throw new Error(error.message)
  return data
}

export async function getById(id) {
  const { data } = await supabase.from('materias').select('*').eq('id', id).single()
  return data || null
}

export async function create(nombre, codigo) {
  const { data, error } = await supabase.from('materias').insert({ nombre, codigo }).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function update(id, nombre, codigo) {
  const { data, error } = await supabase.from('materias').update({ nombre, codigo }).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function remove(id) {
  const { error } = await supabase.from('materias').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function getAlumnos(materia_id) {
  const { data, error } = await supabase
    .from('inscripciones')
    .select('alumnos(*)')
    .eq('materia_id', materia_id)
  if (error) throw new Error(error.message)
  return data.map(d => d.alumnos).sort((a, b) => a.nombre.localeCompare(b.nombre))
}

export async function inscribir(alumno_id, materia_id) {
  const { data, error } = await supabase.from('inscripciones').insert({ alumno_id, materia_id }).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function desinscribir(alumno_id, materia_id) {
  const { error } = await supabase.from('inscripciones').delete().eq('alumno_id', alumno_id).eq('materia_id', materia_id)
  if (error) throw new Error(error.message)
}