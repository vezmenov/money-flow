<script>
  import { onMount } from 'svelte';
  import Nav from './components/Nav.svelte';
  import Home from './routes/Home.svelte';
  import Categories from './routes/Categories.svelte';
  import Dashboards from './routes/Dashboards.svelte';
  import { initStore } from './stores/financeStore';

  const routes = {
    '/': Home,
    '/categories': Categories,
    '/dashboards': Dashboards,
  };

  let currentPath = '/';

  const getPath = () => {
    if (typeof window === 'undefined') {
      return '/';
    }

    const hash = window.location.hash.replace('#', '');
    return hash || '/';
  };

  onMount(() => {
    const updatePath = () => {
      currentPath = getPath();
    };

    updatePath();
    window.addEventListener('hashchange', updatePath);
    initStore();

    return () => {
      window.removeEventListener('hashchange', updatePath);
    };
  });

  $: CurrentComponent = routes[currentPath] ?? Home;
</script>

<div class="app">
  <Nav />

  <svelte:component this={CurrentComponent} />
</div>
