<script>
  import { onMount } from 'svelte';
  import { getAll, create, update, remove,
           registrarHuella, borrarHuella } from '$lib/api/alumnos.js';

  let alumnos   = [];
  let vista     = null; // null | 'nuevo' | 'editar'
  let form      = { nombre: '', carnet: '' };
  let errores   = {};
  let errorForm = '';
  let cargando  = false;
  let cargandoTabla = true;

  onMount(async () => {
    alumnos       = await getAll();
    cargandoTabla = false;
  });

  function validar() {
    errores = {};
    if (!form.nombre.trim())
      errores.nombre = 'El nombre es requerido';
    else if (form.nombre.trim().length < 2)
      errores.nombre = 'Mínimo 2 caracteres';
    else if (form.nombre.trim().length > 100)
      errores.nombre = 'Máximo 100 caracteres';

    if (!form.carnet.trim())
      errores.carnet = 'El carnet es requerido';
    else if (form.carnet.trim().length < 3)
      errores.carnet = 'Mínimo 3 caracteres';
    else if (form.carnet.trim().length > 20)
      errores.carnet = 'Máximo 20 caracteres';

    return Object.keys(errores).length === 0;
  }

  function abrirForm(alumno = null) {
    errores   = {};
    errorForm = '';
    vista = alumno ? 'editar' : 'nuevo';
    form  = alumno
      ? { nombre: alumno.nombre, carnet: alumno.carnet, _id: alumno.id }
      : { nombre: '', carnet: '' };
  }

  function cancelar() {
    vista     = null;
    errores   = {};
    errorForm = '';
  }

  async function guardar() {
    if (!validar()) return;
    try {
      cargando  = true;
      errorForm = '';
      if (vista === 'nuevo') await create({ nombre: form.nombre.trim(), carnet: form.carnet.trim() });
      else await update(form._id, { nombre: form.nombre.trim(), carnet: form.carnet.trim() });
      alumnos = await getAll();
      vista   = null;
    } catch (e) {
      const msg = e.message.toLowerCase();
      if (msg.includes('unique') || msg.includes('duplicate') || msg.includes('already'))
        errorForm = 'Ya existe un alumno con ese carnet';
      else
        errorForm = e.message;
    } finally {
      cargando = false;
    }
  }

  async function eliminar(id, nombre) {
    if (!confirm(`¿Eliminar a "${nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await remove(id);
      alumnos = await getAll();
    } catch (e) {
      alert('No se pudo eliminar: ' + e.message);
    }
  }

  async function handleRegistrarHuella(id, nombre) {
    try {
      await registrarHuella(id);
      alert(`Comando enviado para "${nombre}".\n\nColoca el dedo en el sensor cuando el Arduino lo indique en el LCD.`);
    } catch (e) {
      alert('Error: ' + e.message);
    }
  }

  async function handleBorrarHuella(id, nombre) {
    if (!confirm(`¿Borrar la huella registrada de "${nombre}"?`)) return;
    try {
      await borrarHuella(id);
      alumnos = await getAll();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Enter') guardar();
    if (e.key === 'Escape') cancelar();
  }
</script>

<div class="flex items-center justify-between mb-5">
  <h1 class="text-xl font-bold text-gray-800">Alumnos</h1>
  {#if !vista}
    <button on:click={() => abrirForm()}
      class="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 transition-colors">
      + Agregar alumno
    </button>
  {/if}
</div>

<!-- Formulario crear / editar -->
{#if vista}
  <div class="rounded-2xl border bg-white p-8 max-w-lg mb-5">
    <h2 class="text-base font-bold text-gray-800 mb-5">
      {vista === 'nuevo' ? 'Agregar alumno' : 'Editar alumno'}
    </h2>

    <div class="flex flex-col gap-4">

      <!-- Nombre -->
  <div class="flex flex-col gap-1">
    <label for="nombre" class="text-sm font-medium text-gray-700">
      Nombre completo <span class="text-red-400">*</span>
    </label>
    <input
      id="nombre"
      bind:value={form.nombre}
      on:keydown={handleKeydown}
      type="text"
      placeholder="Ej. Ana García López"
      maxlength="100"
      class="border rounded-lg px-3 py-2 text-sm outline-none transition-colors
             {errores.nombre ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-indigo-400'}"
    />
    {#if errores.nombre}
      <p class="text-red-500 text-xs">{errores.nombre}</p>
    {/if}
  </div>

  <!-- Carnet -->
  <div class="flex flex-col gap-1">
    <label for="carnet" class="text-sm font-medium text-gray-700">
      Carnet <span class="text-red-400">*</span>
    </label>
    <input
      id="carnet"
      bind:value={form.carnet}
      on:keydown={handleKeydown}
      type="text"
      placeholder="Ej. 2024001"
      maxlength="20"
      class="border rounded-lg px-3 py-2 text-sm outline-none transition-colors
             {errores.carnet ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-indigo-400'}"
    />
    {#if errores.carnet}
      <p class="text-red-500 text-xs">{errores.carnet}</p>
    {/if}
  </div>

      <!-- Error del servidor -->
      {#if errorForm}
        <div class="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <p class="text-red-600 text-sm">{errorForm}</p>
        </div>
      {/if}

      <!-- Botones -->
      <div class="flex gap-3 mt-1">
        <button on:click={guardar} disabled={cargando}
          class="px-6 py-2 bg-indigo-500 text-white rounded-xl text-sm font-medium
                 hover:bg-indigo-600 disabled:opacity-60 transition-colors">
          {#if cargando}
            <span class="flex items-center gap-2">
              <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Guardando...
            </span>
          {:else}
            Guardar
          {/if}
        </button>
        <button on:click={cancelar}
          class="px-6 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
          Cancelar
        </button>
      </div>

    </div>
  </div>
{/if}

<!-- Tabla -->
<div class="rounded-xl border bg-white overflow-hidden">

  <!-- Header tabla -->
  <div class="grid grid-cols-[1fr_120px_130px_auto] bg-gray-50 border-b">
    {#each ['Alumno', 'Carnet', 'Huella', 'Acciones'] as col}
      <div class="px-4 py-3 text-xs font-semibold uppercase text-gray-400">{col}</div>
    {/each}
  </div>

  {#if cargandoTabla}
    <div class="px-4 py-8 text-center text-sm text-gray-400">Cargando...</div>
  {:else if alumnos.length === 0}
    <div class="px-4 py-12 text-center">
      <p class="text-sm text-gray-400">No hay alumnos registrados.</p>
      <button on:click={() => abrirForm()}
        class="mt-3 text-sm text-indigo-500 hover:underline">
        Agregar el primero
      </button>
    </div>
  {:else}
    {#each alumnos as a}
      <div class="grid grid-cols-[1fr_120px_130px_auto] border-b last:border-0 items-center hover:bg-gray-50 transition-colors">

        <!-- Nombre -->
        <div class="px-4 py-3">
          <p class="text-sm font-medium text-gray-800">{a.nombre}</p>
        </div>

        <!-- Carnet -->
        <div class="px-4 py-3 text-sm text-gray-500">{a.carnet}</div>

        <!-- Badge huella -->
        <div class="px-4 py-3">
          <span class="text-xs px-2.5 py-1 rounded-full font-medium"
            style="background:{a.huella_id ? '#dcfce7' : '#fee2e2'};
                   color:{a.huella_id ? '#16a34a' : '#dc2626'}">
            {a.huella_id ? '✓ Registrada' : '✗ Sin huella'}
          </span>
        </div>

        <!-- Acciones -->
        <div class="px-4 py-3 flex gap-2 flex-wrap">
          <button on:click={() => abrirForm(a)}
            class="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            Editar
          </button>

          {#if a.huella_id}
            <button on:click={() => handleBorrarHuella(a.id, a.nombre)}
              class="text-xs px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors">
              Borrar huella
            </button>
          {:else}
            <button on:click={() => handleRegistrarHuella(a.id, a.nombre)}
              class="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
              Registrar huella
            </button>
          {/if}

          <button on:click={() => eliminar(a.id, a.nombre)}
            class="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
            Eliminar
          </button>
        </div>

      </div>
    {/each}
  {/if}
</div>