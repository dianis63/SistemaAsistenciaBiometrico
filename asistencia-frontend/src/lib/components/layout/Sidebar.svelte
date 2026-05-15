<script>
  import { page }    from '$app/stores';
  import { goto }    from '$app/navigation';
  import { usuario } from '$lib/stores/auth.js';
  import { logout }  from '$lib/api/auth.js';

  const links = [
    { href: '/dashboard',   label: 'Dashboard'   },
    { href: '/alumnos',     label: 'Alumnos'     },
    { href: '/materias',    label: 'Materias'     },
    { href: '/asistencias', label: 'Asistencias'  },
  ];

  async function handleLogout() {
    await logout();
    usuario.set(null);
    goto('/login');
  }
</script>

<aside class="w-48 flex-shrink-0 flex flex-col border-r bg-white">
  <div class="px-4 py-3 border-b">
    <p class="font-semibold text-sm">Sistema Asistencia</p>
  </div>
  <nav class="flex-1 py-3">
    {#each links as l}
      <a href={l.href}
        class="flex items-center px-4 py-2.5 text-sm mx-2 rounded-lg transition-colors"
        class:bg-indigo-50={$page.url.pathname === l.href}
        class:text-indigo-600={$page.url.pathname === l.href}
        class:text-gray-500={$page.url.pathname !== l.href}>
        {l.label}
      </a>
    {/each}
  </nav>
  <div class="border-t p-3">
    <p class="text-xs text-gray-400 px-2 mb-2">{$usuario?.nombre}</p>
    <button on:click={handleLogout}
      class="w-full text-left px-4 py-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100">
      Cerrar sesión
    </button>
  </div>
</aside>