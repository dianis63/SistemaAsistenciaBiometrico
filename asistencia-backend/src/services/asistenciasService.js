import { supabase } from '../db.js'

export async function getPorSesion(sesion_id) {
  const { data, error } = await supabase
    .from('asistencias')
    .select('*, alumnos(nombre, carnet)')
    .eq('sesion_id', sesion_id)
    .order('timestamp')
  if (error) throw new Error(error.message)
  return data.map(a => ({ ...a, alumno_nombre: a.alumnos?.nombre, carnet: a.alumnos?.carnet }))
}

export async function getReporte(materia_id, fecha) {
  const { data: sesiones } = await supabase.from('sesiones').select('id, hora_inicio, hora_fin').eq('materia_id', materia_id).eq('fecha', fecha)
  if (!sesiones?.length) return []

  const { data: inscritos } = await supabase.from('inscripciones').select('alumnos(id, nombre, carnet)').eq('materia_id', materia_id)
  const alumnos = inscritos.map(i => i.alumnos)

  const { data: asistencias } = await supabase.from('asistencias').select('*').in('sesion_id', sesiones.map(s => s.id))

  const rows = []
  for (const sesion of sesiones) {
    for (const alumno of alumnos) {
      const reg = asistencias?.find(a => a.sesion_id === sesion.id && a.alumno_id === alumno.id)
      rows.push({
        sesion_id:     sesion.id,
        hora_inicio:   sesion.hora_inicio,
        hora_fin:      sesion.hora_fin,
        alumno_nombre: alumno.nombre,
        carnet:        alumno.carnet,
        estado:        reg?.estado ?? 'ausente',
        timestamp:     reg?.timestamp ?? null,
      })
    }
  }
  return rows.sort((a, b) => a.alumno_nombre.localeCompare(b.alumno_nombre))
}