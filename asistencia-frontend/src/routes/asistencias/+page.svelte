<script>
  import { onMount } from "svelte";
  import { getReporte } from "$lib/api/asistencias.js";
  import { getAll } from "$lib/api/materias.js";

  let materias = [];
  let materia_id = "";
  let fecha = new Date().toISOString().split("T")[0];
  let reporte = [];
  let cargando = false;
  let buscado = false;
  let errores = {};

  onMount(async () => (materias = await getAll()));

  function validar() {
    errores = {};
    if (!materia_id) errores.materia = "Selecciona una materia";
    if (!fecha) errores.fecha = "Selecciona una fecha";
    return Object.keys(errores).length === 0;
  }

  async function buscar() {
    if (!validar()) return;
    try {
      cargando = true;
      buscado = false;
      reporte = await getReporte(materia_id, fecha);
      buscado = true;
    } catch (e) {
      alert("Error al obtener reporte: " + e.message);
    } finally {
      cargando = false;
    }
  }

  function formatHora(ts) {
    if (!ts) return "---";
    return new Date(ts).toLocaleTimeString("es-SV", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const colores = {
    presente: { bg: "#dcfce7", text: "#16a34a" },
    tarde: { bg: "#fef9c3", text: "#854d0e" },
    ausente: { bg: "#fee2e2", text: "#dc2626" },
  };

  $: totalPresente = reporte.filter((r) => r.estado === "presente").length;
  $: totalTarde = reporte.filter((r) => r.estado === "tarde").length;
  $: totalAusente = reporte.filter((r) => r.estado === "ausente").length;
  $: nombreMateria =
    materias.find((m) => String(m.id) === String(materia_id))?.nombre ?? "";
</script>

<h1 class="text-xl font-bold text-gray-800 mb-5">Asistencias</h1>

<!-- Filtros -->
<div class="rounded-2xl border bg-white p-5 mb-5">
  <p class="text-sm font-medium text-gray-700 mb-3">Consultar reporte</p>
  <div class="flex gap-3 flex-wrap">
    <!-- Materia -->
    <div class="flex flex-col gap-1 flex-1 min-w-[180px]">
      <label for="materia" class="text-xs text-gray-500">Materia</label>
      <select
        id="materia"
        bind:value={materia_id}
        class="border rounded-lg px-3 py-2 text-sm outline-none transition-colors
           {errores.materia
          ? 'border-red-400 bg-red-50'
          : 'border-gray-200 focus:border-indigo-400'}"
      >
        <option value="">Seleccionar materia...</option>
        {#each materias as m}
          <option value={m.id}>{m.nombre} ({m.codigo})</option>
        {/each}
      </select>
      {#if errores.materia}
        <p class="text-red-500 text-xs">{errores.materia}</p>
      {/if}
    </div>

    <!-- Fecha -->
    <div class="flex flex-col gap-1">
      <label for="fecha" class="text-xs text-gray-500">Fecha</label>
      <input
        id="fecha"
        bind:value={fecha}
        type="date"
        class="border rounded-lg px-3 py-2 text-sm outline-none transition-colors
           {errores.fecha
          ? 'border-red-400 bg-red-50'
          : 'border-gray-200 focus:border-indigo-400'}"
      />
      {#if errores.fecha}
        <p class="text-red-500 text-xs">{errores.fecha}</p>
      {/if}
    </div>

    <!-- Botón buscar -->
    <div class="flex items-end">
      <button
        on:click={buscar}
        disabled={cargando}
        class="px-6 py-2 bg-indigo-500 text-white rounded-xl text-sm font-medium
               hover:bg-indigo-600 disabled:opacity-50 transition-colors"
      >
        {#if cargando}
          <span class="flex items-center gap-2">
            <span
              class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
            ></span>
            Buscando...
          </span>
        {:else}
          Buscar
        {/if}
      </button>
    </div>
  </div>
</div>

<!-- Resultados -->
{#if cargando}
  <div class="rounded-xl border bg-white p-8 text-center text-sm text-gray-400">
    Cargando reporte...
  </div>
{:else if buscado && reporte.length === 0}
  <div class="rounded-xl border bg-white p-12 text-center">
    <p class="text-sm text-gray-400">
      No hay sesiones registradas para esta materia en esa fecha.
    </p>
  </div>
{:else if buscado && reporte.length > 0}
  <!-- Stats resumen -->
  <div class="grid grid-cols-3 gap-3 mb-4">
    <div class="rounded-xl bg-white border p-4 text-center">
      <p class="text-2xl font-bold text-green-600">{totalPresente}</p>
      <p class="text-xs text-gray-400 mt-1">Presentes</p>
    </div>
    <div class="rounded-xl bg-white border p-4 text-center">
      <p class="text-2xl font-bold text-yellow-600">{totalTarde}</p>
      <p class="text-xs text-gray-400 mt-1">Tarde</p>
    </div>
    <div class="rounded-xl bg-white border p-4 text-center">
      <p class="text-2xl font-bold text-red-500">{totalAusente}</p>
      <p class="text-xs text-gray-400 mt-1">Ausentes</p>
    </div>
  </div>

  <!-- Tabla reporte -->
  <div class="rounded-xl border bg-white overflow-hidden">
    <div
      class="px-4 py-3 bg-gray-50 border-b flex items-center justify-between"
    >
      <span class="text-xs font-semibold uppercase text-gray-400">
        {nombreMateria} — {new Date(fecha + "T12:00:00").toLocaleDateString(
          "es-SV",
          { day: "numeric", month: "long", year: "numeric" },
        )}
      </span>
      <span class="text-xs text-gray-400"
        >{reporte.length} alumno{reporte.length !== 1 ? "s" : ""}</span
      >
    </div>

    <div class="grid grid-cols-[1fr_120px_120px_100px] bg-gray-50 border-b">
      {#each ["Alumno", "Carnet", "Hora", "Estado"] as col}
        <div class="px-4 py-2.5 text-xs font-semibold uppercase text-gray-400">
          {col}
        </div>
      {/each}
    </div>

    {#each reporte as r}
      <div
        class="grid grid-cols-[1fr_120px_120px_100px] border-b last:border-0 items-center hover:bg-gray-50 transition-colors"
      >
        <div class="px-4 py-3">
          <p class="text-sm font-medium text-gray-800">{r.alumno_nombre}</p>
        </div>
        <div class="px-4 py-3 text-sm text-gray-500 font-mono">{r.carnet}</div>
        <div class="px-4 py-3 text-sm text-gray-500">
          {formatHora(r.timestamp)}
        </div>
        <div class="px-4 py-3">
          <span
            class="text-xs px-2.5 py-1 rounded-full font-medium"
            style="background:{colores[r.estado]?.bg}; color:{colores[r.estado]
              ?.text}"
          >
            {r.estado}
          </span>
        </div>
      </div>
    {/each}
  </div>
{/if}
