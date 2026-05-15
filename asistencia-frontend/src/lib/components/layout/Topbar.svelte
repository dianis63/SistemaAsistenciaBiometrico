<script>
  import { page } from '$app/stores';

  const titulos = {
    '/dashboard':   'Dashboard',
    '/alumnos':     'Alumnos',
    '/materias':    'Materias',
    '/asistencias': 'Asistencias',
  };
</script>

<header class="h-12 border-b flex items-center px-6 bg-white flex-shrink-0">
  <p class="text-sm font-medium text-gray-700">
    {titulos[$page.url.pathname] ?? 'Sistema de Asistencia'}
  </p>
</header>