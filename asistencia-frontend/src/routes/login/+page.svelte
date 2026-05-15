<script>
  import { goto }    from '$app/navigation';
  import { usuario } from '$lib/stores/auth.js';
  import { login }   from '$lib/api/auth.js';

  let correo     = '';
  let contrasena = '';
  let error      = '';
  let loading    = false;
  let errores    = {};

  function validar() {
    errores = {};
    if (!correo.trim())
      errores.correo = 'El correo es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo))
      errores.correo = 'Ingresa un correo válido';

    if (!contrasena.trim())
      errores.contrasena = 'La contraseña es requerida';
    else if (contrasena.length < 3)
      errores.contrasena = 'Mínimo 3 caracteres';

    return Object.keys(errores).length === 0;
  }

  async function handleLogin() {
    error = '';
    if (!validar()) return;
    try {
      loading    = true;
      const data = await login(correo, contrasena);
      usuario.set(data.usuario);
      goto('/dashboard');
    } catch (e) {
      error = 'Correo o contraseña incorrectos';
    } finally {
      loading = false;
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Enter') handleLogin();
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-100">
  <div class="bg-white rounded-2xl shadow-xl p-10 w-full max-w-sm">

    <!-- Logo / título -->
    <div class="text-center mb-8">
      <div class="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" stroke-width="2"
          viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M12 11c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zM6 20v-1a6 6 0 0112 0v1"/>
        </svg>
      </div>
      <h1 class="text-xl font-bold text-gray-800">Sistema de Asistencia</h1>
      <p class="text-sm text-gray-400 mt-1">Ingresa con tu cuenta</p>
    </div>

    <!-- Formulario -->
    <div class="flex flex-col gap-4">
  <div class="flex flex-col gap-1">
    <label for="correo" class="text-sm font-medium text-gray-700">Correo</label>
    <input
      id="correo"
      bind:value={correo}
      on:keydown={handleKeydown}
      type="email"
      placeholder="admin@sistema.com"
      class="border rounded-lg px-3 py-2 text-sm outline-none transition-colors
             {errores.correo ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-indigo-400'}"
    />
    {#if errores.correo}
      <p class="text-red-500 text-xs">{errores.correo}</p>
    {/if}
  </div>

  <div class="flex flex-col gap-1">
    <label for="contrasena" class="text-sm font-medium text-gray-700">Contraseña</label>
    <input
      id="contrasena"
      bind:value={contrasena}
      on:keydown={handleKeydown}
      type="password"
      placeholder="••••••••"
      class="border rounded-lg px-3 py-2 text-sm outline-none transition-colors
             {errores.contrasena ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-indigo-400'}"
    />
    {#if errores.contrasena}
      <p class="text-red-500 text-xs">{errores.contrasena}</p>
    {/if}
  </div>

      <!-- Error general -->
      {#if error}
        <div class="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <p class="text-red-600 text-sm">{error}</p>
        </div>
      {/if}

      <!-- Botón -->
      <button
        on:click={handleLogin}
        disabled={loading}
        class="bg-indigo-500 text-white py-2.5 rounded-lg text-sm font-medium
               hover:bg-indigo-600 disabled:opacity-60 transition-colors mt-1"
      >
        {#if loading}
          <span class="flex items-center justify-center gap-2">
            <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Ingresando...
          </span>
        {:else}
          Ingresar
        {/if}
      </button>

    </div>
  </div>
</div>