<script>
  import { onMount, onDestroy } from "svelte";
  import { getActiva, iniciar, cerrar } from "$lib/api/sesiones.js";
  import { getPorSesion } from "$lib/api/asistencias.js";
  import { getAll as getMaterias } from "$lib/api/materias.js";

  let sesion = null;
  let asistencias = [];
  let materias = [];
  let mostrarModal = false;
  let materia_id = "";
  let tolerancia = 15;
  let errorModal = "";
  let erroresModal = {};
  let cargandoIniciar = false;
  let intervalo;

  onMount(async () => {
    materias = await getMaterias();
    await cargar();
    intervalo = setInterval(cargar, 3000);
  });

  onDestroy(() => clearInterval(intervalo));

  async function cargar() {
    try {
      sesion = await getActiva();
      if (sesion) asistencias = await getPorSesion(sesion.id);
      else asistencias = [];
    } catch {
      // backend no disponible
    }
  }

  function abrirModal() {
    materia_id = "";
    tolerancia = 15;
    errorModal = "";
    erroresModal = {};
    mostrarModal = true;
  }

  function validarModal() {
    erroresModal = {};
    if (!materia_id) erroresModal.materia = "Selecciona una materia";
    if (tolerancia === "" || tolerancia === null)
      erroresModal.tolerancia = "La tolerancia es requerida";
    else if (Number(tolerancia) < 0 || Number(tolerancia) > 60)
      erroresModal.tolerancia = "Debe ser entre 0 y 60 minutos";
    return Object.keys(erroresModal).length === 0;
  }

  async function handleIniciar() {
    errorModal = "";
    if (!validarModal()) return;
    try {
      cargandoIniciar = true;
      await iniciar({
        materia_id: Number(materia_id),
        minutos_tolerancia: Number(tolerancia),
      });
      mostrarModal = false;
      await cargar();
    } catch (e) {
      errorModal = e.message;
    } finally {
      cargandoIniciar = false;
    }
  }

  async function handleCerrar() {
    if (
      !confirm(
        "¿Cerrar la sesión activa? Los alumnos ya no podrán registrar asistencia.",
      )
    )
      return;
    try {
      await cerrar(sesion.id);
      sesion = null;
      asistencias = [];
    } catch (e) {
      alert(e.message);
    }
  }

  function formatHora(ts) {
    return new Date(ts).toLocaleTimeString("es-SV", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const colores = {
    presente: { bg: "#dcfce7", text: "#16a34a" },
    tarde: { bg: "#fef9c3", text: "#854d0e" },
  };
</script>

<h1 class="text-xl font-bold mb-5 text-gray-800">Dashboard</h1>

<!-- Sin sesión activa -->
{#if !sesion}
  <div
    class="rounded-2xl border border-dashed border-gray-300 p-12 text-center bg-white"
  >
    <div
      class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4"
    >
      <svg
        class="w-6 h-6 text-gray-400"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
        />
      </svg>
    </div>
    <p class="text-gray-500 text-sm mb-5">
      No hay ninguna sesión de clase activa
    </p>
    <button
      on:click={abrirModal}
      class="px-6 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 transition-colors"
    >
      Iniciar clase
    </button>
  </div>

  <!-- Sesión activa -->
{:else}
  <div class="rounded-2xl border bg-white p-6 mb-5">
    <!-- Header sesión -->
    <div class="flex items-start justify-between mb-5">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span class="text-xs text-green-600 font-medium">Sesión activa</span>
        </div>
        <p class="text-lg font-bold text-gray-800">{sesion.materia_nombre}</p>
        <p class="text-sm text-gray-400 mt-0.5">
          Inicio: {formatHora(sesion.hora_inicio)} — Tolerancia: {sesion.minutos_tolerancia}
          min
        </p>
      </div>
      <button
        on:click={handleCerrar}
        class="px-4 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors"
      >
        Cerrar sesión
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-3 mb-5">
      <div class="rounded-xl bg-gray-50 p-4 text-center">
        <p class="text-2xl font-bold text-gray-800">{asistencias.length}</p>
        <p class="text-xs text-gray-400 mt-1">Registradas</p>
      </div>
      <div class="rounded-xl bg-green-50 p-4 text-center">
        <p class="text-2xl font-bold text-green-600">
          {asistencias.filter((a) => a.estado === "presente").length}
        </p>
        <p class="text-xs text-gray-400 mt-1">A tiempo</p>
      </div>
      <div class="rounded-xl bg-yellow-50 p-4 text-center">
        <p class="text-2xl font-bold text-yellow-600">
          {asistencias.filter((a) => a.estado === "tarde").length}
        </p>
        <p class="text-xs text-gray-400 mt-1">Tarde</p>
      </div>
    </div>

    <!-- Lista asistencias -->
    {#if asistencias.length === 0}
      <p class="text-sm text-gray-400 text-center py-4">
        Esperando que los alumnos registren asistencia...
      </p>
    {:else}
      <div class="rounded-xl border overflow-hidden">
        <div class="grid grid-cols-[1fr_1fr_auto] bg-gray-50 border-b">
          {#each ["Alumno", "Hora", "Estado"] as col}
            <div
              class="px-4 py-2.5 text-xs font-semibold uppercase text-gray-400"
            >
              {col}
            </div>
          {/each}
        </div>
        {#each asistencias as a}
          <div
            class="grid grid-cols-[1fr_1fr_auto] border-b last:border-0 items-center"
          >
            <div class="px-4 py-3">
              <p class="text-sm font-medium text-gray-800">{a.alumno_nombre}</p>
              <p class="text-xs text-gray-400">{a.carnet}</p>
            </div>
            <div class="px-4 py-3 text-sm text-gray-500">
              {formatHora(a.timestamp)}
            </div>
            <div class="px-4 py-3">
              <span
                class="text-xs px-2.5 py-1 rounded-full font-medium"
                style="background:{colores[a.estado]?.bg}; color:{colores[
                  a.estado
                ]?.text}"
              >
                {a.estado}
              </span>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<!-- Modal iniciar clase -->
{#if mostrarModal}
  <div
    class="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
      <h2 class="text-base font-bold text-gray-800 mb-5">Iniciar clase</h2>

      <div class="flex flex-col gap-4">
        <!-- Materia -->
        <div class="flex flex-col gap-1">
          <label for="materia" class="text-sm font-medium text-gray-700"
            >Materia</label
          >
          <select
            id="materia"
            bind:value={materia_id}
            class="border rounded-lg px-3 py-2 text-sm outline-none transition-colors
             {erroresModal.materia
              ? 'border-red-400 bg-red-50'
              : 'border-gray-200 focus:border-indigo-400'}"
          >
            <option value="">Seleccionar...</option>
            {#each materias as m}
              <option value={m.id}>{m.nombre} ({m.codigo})</option>
            {/each}
          </select>
          {#if erroresModal.materia}
            <p class="text-red-500 text-xs">{erroresModal.materia}</p>
          {/if}
        </div>

        <!-- Tolerancia -->
        <div class="flex flex-col gap-1">
          <label for="tolerancia" class="text-sm font-medium text-gray-700"
            >Minutos de tolerancia</label
          >
          <input
            id="tolerancia"
            bind:value={tolerancia}
            type="number"
            min="0"
            max="60"
            class="border rounded-lg px-3 py-2 text-sm outline-none transition-colors
             {erroresModal.tolerancia
              ? 'border-red-400 bg-red-50'
              : 'border-gray-200 focus:border-indigo-400'}"
          />
          {#if erroresModal.tolerancia}
            <p class="text-red-500 text-xs">{erroresModal.tolerancia}</p>
          {:else}
            <p class="text-xs text-gray-400">
              Tiempo después del inicio en que se marca "tarde"
            </p>
          {/if}
        </div>

        <!-- Error general -->
        {#if errorModal}
          <div class="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <p class="text-red-600 text-sm">{errorModal}</p>
          </div>
        {/if}

        <!-- Botones -->
        <div class="flex gap-3 mt-1">
          <button
            on:click={handleIniciar}
            disabled={cargandoIniciar}
            class="flex-1 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-medium
                   hover:bg-indigo-600 disabled:opacity-50 transition-colors"
          >
            {#if cargandoIniciar}
              <span class="flex items-center justify-center gap-2">
                <span
                  class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                ></span>
                Iniciando...
              </span>
            {:else}
              Iniciar
            {/if}
          </button>
          <button
            on:click={() => (mostrarModal = false)}
            class="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
