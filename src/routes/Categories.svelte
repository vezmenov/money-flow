<script>
  import { addCategory, categories } from '../stores/financeStore';

  let categoryName = '';
  let categoryColor = '#3b82f6';

  const handleAddCategory = async () => {
    const trimmedName = categoryName.trim();

    if (!trimmedName) {
      return;
    }

    await addCategory({
      id: crypto.randomUUID(),
      name: trimmedName,
      color: categoryColor,
      type: 'expense',
      createdAt: new Date().toISOString(),
    });

    categoryName = '';
    categoryColor = '#3b82f6';
  };
</script>

<section class="categories">
  <header class="categories__header">
    <h1>Категории</h1>
    <p>Создавайте категории расходов и доходов.</p>
  </header>

  <form class="category-form" on:submit|preventDefault={handleAddCategory}>
    <label class="category-form__field">
      <span>Цвет</span>
      <input type="color" bind:value={categoryColor} aria-label="Цвет категории" />
    </label>

    <label class="category-form__field">
      <span>Название</span>
      <input
        type="text"
        placeholder="Например: Продукты"
        bind:value={categoryName}
        aria-label="Название категории"
      />
    </label>

    <button class="category-form__submit" type="submit">Добавить</button>
  </form>

  <div class="categories__list">
    {#if $categories.length === 0}
      <p class="categories__empty">Категории пока не добавлены.</p>
    {:else}
      <ul>
        {#each $categories as category (category.id)}
          <li class="category-card">
            <span class="category-card__color" style={`background-color: ${category.color}`}></span>
            <span class="category-card__name">{category.name}</span>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</section>
