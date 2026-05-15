import { supabase } from '../db.js'
export async function loginService(correo, contrasena) {
  const { data, error } = await supabase.rpc('verificar_contrasena', {
    correo_input:     correo,
    contrasena_input: contrasena,
  })
  
  console.log('data:', data)
  console.log('error:', error)
  
  if (error || !data?.[0]) throw new Error('Credenciales incorrectas')
  return data[0]
}