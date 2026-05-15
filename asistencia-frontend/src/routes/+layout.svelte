<script>
  import { onMount }  from 'svelte';
  import { goto }     from '$app/navigation';
  import { page }     from '$app/stores';
  import { usuario }  from '$lib/stores/auth.js';
  import { me }       from '$lib/api/auth.js';
  import Sidebar      from '$lib/components/layout/Sidebar.svelte';
  import Topbar       from '$lib/components/layout/Topbar.svelte';
  import '../app.css';

  let cargando = true;

  onMount(async () => {
    try {
      const data = await me();
      usuario.set(data.usuario);
    } catch {
      usuario.set(null);
    } finally {
      cargando = false;
      const esLogin = $page.url.pathname === '/login';
      if (!$usuario && !esLogin) goto('/login');
    }
  });

  $: esLogin = $page.url.pathname === '/login';
</script>

{#if cargando}
  <div class="flex h-screen items-center justify-center bg-gray-50">
    <div class="flex flex-col items-center gap-3">
      <div class="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="text-sm text-gray-400">Cargando...</p>
    </div>
  </div>
{:else if esLogin}
  <slot />
{:else if $usuario}
  <div class="flex h-screen overflow-hidden bg-gray-50">
    <Sidebar />
    <div class="flex-1 flex flex-col overflow-hidden">
      <Topbar />
      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>
{/if}