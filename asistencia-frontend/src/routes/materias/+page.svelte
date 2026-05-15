<script>
  import { onMount } from "svelte";
  import {
    getAll,
    create,
    update,
    remove,
    getAlumnos,
    inscribir,
    desinscribir,
  } from "$lib/api/materias.js";
  import { getAll as getAllAlumnos } from "$lib/api/alumnos.js";

  let materias = [];
  let todosAlumnos = [];
  let alumnosInscritos = [];
  let vista = null; // null | 'nuevo' | 'editar'
  let form = { nombre: "", codigo: "" };
  let errores = {};
  let errorForm = "";
  let cargando = false;
  let cargandoTabla = true;
  let materiaSeleccionada = null;
  let alumnoAInscribir = "";
  let errorInscripcion = "";

  onMount(async () => {
    [materias, todosAlumnos] = await Promise.all([getAll(), getAllAlumnos()]);
    cargandoTabla = false;
  });

  function validar() {
    errores = {};
    if (!form.nombre.trim()) errores.nombre = "El nombre es requerido";
    else if (form.nombre.trim().length < 2)
      errores.nombre = "Mínimo 2 caracteres";
    else if (form.nombre.trim().length > 100)
      errores.nombre = "Máximo 100 caracteres";

    if (!form.codigo.trim()) errores.codigo = "El código es requerido";
    else if (form.codigo.trim().length < 2)
      errores.codigo = "Mínimo 2 caracteres";
    else if (form.codigo.trim().length > 20)
      errores.codigo = "Máximo 20 caracteres";

    return Object.keys(errores).length === 0;
  }

  function abrirForm(m = null) {
    errores = {};
    errorForm = "";
    vista = m ? "editar" : "nuevo";
    form = m
      ? { nombre: m.nombre, codigo: m.codigo, _id: m.id }
      : { nombre: "", codigo: "" };
  }

  function cancelar() {
    vista = null;
    errores = {};
    errorForm = "";
  }

  async function guardar() {
    if (!validar()) return;
    try {
      cargando = true;
      errorForm = "";
      if (vista === "nuevo")
        await create({
          nombre: form.nombre.trim(),
          codigo: form.codigo.trim().toUpperCase(),
        });
      else
        await update(form._id, {
          nombre: form.nombre.trim(),
          codigo: form.codigo.trim().toUpperCase(),
        });
      materias = await getAll();
      vista = null;
    } catch (e) {
      const msg = e.message.toLowerCase();
      if (
        msg.includes("unique") ||
        msg.includes("duplicate") ||
        msg.includes("already")
      )
        errorForm = "Ya existe una materia con ese código";
      else errorForm = e.message;
    } finally {
      cargando = false;
    }
  }

  async function eliminar(id, nombre) {
    if (
      !confirm(
        `¿Eliminar "${nombre}"? Se perderán todas las inscripciones asociadas.`,
      )
    )
      return;
    try {
      await remove(id);
      materias = await getAll();
    } catch (e) {
      alert("No se pudo eliminar: " + e.message);
    }
  }

  async function verAlumnos(m) {
    materiaSeleccionada = m;
    alumnosInscritos = await getAlumnos(m.id);
    alumnoAInscribir = "";
    errorInscripcion = "";
  }

  async function handleInscribir() {
    if (!alumnoAInscribir) return;
    try {
      errorInscripcion = "";
      await inscribir(materiaSeleccionada.id, Number(alumnoAInscribir));
      alumnosInscritos = await getAlumnos(materiaSeleccionada.id);
      alumnoAInscribir = "";
    } catch (e) {
      const msg = e.message.toLowerCase();
      if (msg.includes("unique") || msg.includes("duplicate"))
        errorInscripcion = "El alumno ya está inscrito en esta materia";
      else errorInscripcion = e.message;
    }
  }

  async function handleDesinscribir(aid, nombre) {
    if (!confirm(`¿Quitar a "${nombre}" de esta materia?`)) return;
    try {
      await desinscribir(materiaSeleccionada.id, aid);
      alumnosInscritos = await getAlumnos(materiaSeleccionada.id);
    } catch (e) {
      alert("Error: " + e.message);
    }
  }

  function handleKeydown(e) {
    if (e.key === "Enter") guardar();
    if (e.key === "Escape") cancelar();
  }

  const noInscritos = () =>
    todosAlumnos.filter((a) => !alumnosInscritos.find((i) => i.id === a.id));
</script>

<!-- Vista: alumnos inscritos en materia -->
{#if materiaSeleccionada}
  <div class="flex items-center gap-3 mb-5">
    <button
      on:click={() => (materiaSeleccionada = null)}
      class="text-sm text-gray-400 hover:text-gray-700 flex items-center gap-1"
    >
      ← Volver
    </button>
    <span class="text-gray-300">|</span>
    <h1 class="text-xl font-bold text-gray-800">
      {materiaSeleccionada.nombre}
    </h1>
    <span
      class="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-mono"
    >
      {materiaSeleccionada.codigo}
    </span>
  </div>

  <!-- Inscribir alumno -->
  <div class="rounded-2xl border bg-white p-5 mb-4">
    <p class="text-sm font-medium text-gray-700 mb-3">Inscribir alumno</p>
    <div class="flex gap-2">
      <select
        bind:value={alumnoAInscribir}
        class="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 outline-none focus:border-indigo-400 transition-colors"
      >
        <option value="">Seleccionar alumno...</option>
        {#each noInscritos() as a}
          <option value={a.id}>{a.nombre} — {a.carnet}</option>
        {/each}
      </select>
      <button
        on:click={handleInscribir}
        disabled={!alumnoAInscribir}
        class="px-5 py-2 bg-indigo-500 text-white rounded-xl text-sm font-medium
               hover:bg-indigo-600 disabled:opacity-50 transition-colors"
      >
        Inscribir
      </button>
    </div>
    {#if errorInscripcion}
      <p class="text-red-500 text-xs mt-2">{errorInscripcion}</p>
    {/if}
    {#if noInscritos().length === 0 && alumnosInscritos.length > 0}
      <p class="text-xs text-gray-400 mt-2">
        Todos los alumnos ya están inscritos.
      </p>
    {/if}
  </div>

  <!-- Lista inscritos -->
  <div class="rounded-xl border bg-white overflow-hidden">
    <div
      class="px-4 py-3 bg-gray-50 border-b flex items-center justify-between"
    >
      <span class="text-xs font-semibold uppercase text-gray-400"
        >Alumnos inscritos</span
      >
      <span class="text-xs text-gray-400"
        >{alumnosInscritos.length} alumno{alumnosInscritos.length !== 1
          ? "s"
          : ""}</span
      >
    </div>
    {#each alumnosInscritos as a}
      <div
        class="flex items-center justify-between px-4 py-3 border-b last:border-0 hover:bg-gray-50 transition-colors"
      >
        <div>
          <p class="text-sm font-medium text-gray-800">{a.nombre}</p>
          <p class="text-xs text-gray-400">{a.carnet}</p>
        </div>
        <button
          on:click={() => handleDesinscribir(a.id, a.nombre)}
          class="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
        >
          Quitar
        </button>
      </div>
    {/each}
    {#if alumnosInscritos.length === 0}
      <p class="text-sm text-gray-400 text-center py-8">
        Sin alumnos inscritos en esta materia.
      </p>
    {/if}
  </div>

  <!-- Vista: formulario crear / editar -->
{:else if vista}
  <div class="flex items-center gap-3 mb-5">
    <button
      on:click={cancelar}
      class="text-sm text-gray-400 hover:text-gray-700">← Volver</button
    >
    <h1 class="text-xl font-bold text-gray-800">
      {vista === "nuevo" ? "Nueva materia" : "Editar materia"}
    </h1>
  </div>

  <div class="rounded-2xl border bg-white p-8 max-w-lg">
    <div class="flex flex-col gap-4">
      <!-- Nombre -->
      <div class="flex flex-col gap-1">
        <label for="nombre" class="text-sm font-medium text-gray-700">
          Nombre <span class="text-red-400">*</span>
        </label>
        <input
          id="nombre"
          bind:value={form.nombre}
          on:keydown={handleKeydown}
          type="text"
          placeholder="Ej. Programación I"
          maxlength="100"
          class="border rounded-lg px-3 py-2 text-sm outline-none transition-colors
             {errores.nombre
            ? 'border-red-400 bg-red-50'
            : 'border-gray-200 focus:border-indigo-400'}"
        />
        {#if errores.nombre}
          <p class="text-red-500 text-xs">{errores.nombre}</p>
        {/if}
      </div>

      <!-- Código -->
      <div class="flex flex-col gap-1">
        <label for="codigo" class="text-sm font-medium text-gray-700">
          Código <span class="text-red-400">*</span>
        </label>
        <input
          id="codigo"
          bind:value={form.codigo}
          on:keydown={handleKeydown}
          type="text"
          placeholder="Ej. PRG1"
          maxlength="20"
          class="border rounded-lg px-3 py-2 text-sm outline-none transition-colors
             {errores.codigo
            ? 'border-red-400 bg-red-50'
            : 'border-gray-200 focus:border-indigo-400'}"
        />
        {#if errores.codigo}
          <p class="text-red-500 text-xs">{errores.codigo}</p>
        {:else}
          <p class="text-xs text-gray-400">
            Se guardará en mayúsculas automáticamente
          </p>
        {/if}
      </div>

      <!-- Error servidor -->
      {#if errorForm}
        <div class="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <p class="text-red-600 text-sm">{errorForm}</p>
        </div>
      {/if}

      <!-- Botones -->
      <div class="flex gap-3 mt-1">
        <button
          on:click={guardar}
          disabled={cargando}
          class="px-6 py-2 bg-indigo-500 text-white rounded-xl text-sm font-medium
                 hover:bg-indigo-600 disabled:opacity-60 transition-colors"
        >
          {#if cargando}
            <span class="flex items-center gap-2">
              <span
                class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
              ></span>
              Guardando...
            </span>
          {:else}
            Guardar
          {/if}
        </button>
        <button
          on:click={cancelar}
          class="px-6 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>

  <!-- Vista: tabla principal -->
{:else}
  <div class="flex items-center justify-between mb-5">
    <h1 class="text-xl font-bold text-gray-800">Materias</h1>
    <button
      on:click={() => abrirForm()}
      class="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 transition-colors"
    >
      + Agregar materia
    </button>
  </div>

  <div class="rounded-xl border bg-white overflow-hidden">
    <div class="grid grid-cols-[1fr_100px_auto] bg-gray-50 border-b">
      {#each ["Materia", "Código", "Acciones"] as col}
        <div class="px-4 py-3 text-xs font-semibold uppercase text-gray-400">
          {col}
        </div>
      {/each}
    </div>

    {#if cargandoTabla}
      <div class="px-4 py-8 text-center text-sm text-gray-400">Cargando...</div>
    {:else if materias.length === 0}
      <div class="px-4 py-12 text-center">
        <p class="text-sm text-gray-400">No hay materias registradas.</p>
        <button
          on:click={() => abrirForm()}
          class="mt-3 text-sm text-indigo-500 hover:underline"
        >
          Agregar la primera
        </button>
      </div>
    {:else}
      {#each materias as m}
        <div
          class="grid grid-cols-[1fr_100px_auto] border-b last:border-0 items-center hover:bg-gray-50 transition-colors"
        >
          <div class="px-4 py-3">
            <p class="text-sm font-medium text-gray-800">{m.nombre}</p>
          </div>
          <div class="px-4 py-3">
            <span
              class="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
            >
              {m.codigo}
            </span>
          </div>
          <div class="px-4 py-3 flex gap-2">
            <button
              on:click={() => verAlumnos(m)}
              class="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              Alumnos
            </button>
            <button
              on:click={() => abrirForm(m)}
              class="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Editar
            </button>
            <button
              on:click={() => eliminar(m.id, m.nombre)}
              class="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      {/each}
    {/if}
  </div>
{/if}
