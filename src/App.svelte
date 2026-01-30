<script>
  import Router from 'svelte-spa-router';
  import Nav from './components/Nav.svelte';
  import Home from './routes/Home.svelte';
  import Categories from './routes/Categories.svelte';
  import Dashboards from './routes/Dashboards.svelte';

  const routes = {
    '/': Home,
    '/categories': Categories,
    '/dashboards': Dashboards,
  };
</script>

<div class="app">
  <Nav />

  <Router {routes} />
</div>
