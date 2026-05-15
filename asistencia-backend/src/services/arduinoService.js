import { supabase } from '../db.js'
import { getActiva } from './sesionesService.js'

// src/services/arduinoService.js
export async function getComando() {
  const { data, error } = await supabase
    .from('comandos')
    .select('*')
    .eq('ejecutado', false)
    .order('creado_at')
    .limit(1)
    .maybeSingle()   // ← maybeSingle en vez de single, devuelve null si no hay
  if (error) throw new Error(error.message)
  return data || null
}

export async function marcarEjecutado(id) {
  const { error } = await supabase.from('comandos').update({ ejecutado: true }).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function getSesionActiva() {
  return getActiva()
}

export async function registrarHuella(alumno_id, huella_id) {
  const { error } = await supabase.from('alumnos').update({ huella_id }).eq('id', alumno_id)
  if (error) throw new Error(error.message)
}

export async function procesarAsistencia(huella_id) {
  const sesion = await getActiva()
  if (!sesion) throw new Error('No hay sesión activa')

  const { data: alumno } = await supabase.from('alumnos').select('*').eq('huella_id', huella_id).single()
  if (!alumno) throw new Error('Huella no registrada')
  
  const { data: inscripcion } = await supabase
    .from('inscripciones')
    .select('id')
    .eq('alumno_id', alumno.id)
    .eq('materia_id', sesion.materia_id)
    .maybeSingle()
  if (!inscripcion) throw new Error('Alumno no inscrito en esta materia')
    
  const diff   = (new Date() - new Date(sesion.hora_inicio)) / 60000
  const estado = diff <= sesion.minutos_tolerancia ? 'presente' : 'tarde'

  const { data: existe } = await supabase.from('asistencias').select('id').eq('sesion_id', sesion.id).eq('alumno_id', alumno.id).single()
  if (existe) throw new Error('Ya registrado en esta sesión')

  await supabase.from('asistencias').insert({ sesion_id: sesion.id, alumno_id: alumno.id, estado })
  return { alumno: alumno.nombre, estado, sesion_id: sesion.id }
}

