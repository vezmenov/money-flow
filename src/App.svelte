<script>
  import Router from 'svelte-spa-router';
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
  <nav class="nav">
    <a href="#/">Главная</a>
    <a href="#/categories">Категории</a>
    <a href="#/dashboards">Дашборды</a>
  </nav>

  <Router {routes} />
</div>
