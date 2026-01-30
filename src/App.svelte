<script>
  const features = [
    'Svelte + Vite',
    'Готовая точка входа',
    'Структура для будущих страниц',
  ];
</script>

<main class="app">
  <header class="hero">
    <p class="eyebrow">Money Flow</p>
    <h1>Базовая архитектура проекта на Svelte</h1>
    <p class="subtitle">
      Каркас проекта готов — можно добавлять страницы, модули и бизнес-логику.
    </p>
  </header>

  <section class="card">
    <h2>Что уже есть</h2>
    <ul>
      {#each features as feature}
        <li>{feature}</li>
      {/each}
    </ul>
  </section>
</main>
