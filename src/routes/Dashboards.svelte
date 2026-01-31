<script>
  import { categories, transactions } from '../stores/financeStore';

  const getMonthKey = (date) => date.slice(0, 7);

  $: categoryMap = new Map($categories.map((category) => [category.id, category]));
  $: totalBalance = $transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  $: categoryTotals = $transactions.reduce((acc, transaction) => {
    const total = acc.get(transaction.categoryId) ?? 0;
    acc.set(transaction.categoryId, total + transaction.amount);
    return acc;
  }, new Map());
  $: topCategories = Array.from(categoryTotals.entries())
    .map(([categoryId, total]) => ({
      category: categoryMap.get(categoryId),
      total,
    }))
    .filter((item) => item.category)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
  $: monthlyTotals = $transactions.reduce((acc, transaction) => {
    const key = getMonthKey(transaction.date);
    acc[key] = (acc[key] ?? 0) + transaction.amount;
    return acc;
  }, {});
  $: sortedMonths = Object.keys(monthlyTotals).sort();
  $: currentMonth = sortedMonths.at(-1);
  $: previousMonth = sortedMonths.at(-2);
</script>

<main class="page">
  <header>
    <p class="eyebrow">Раздел</p>
    <h1>Дашборды</h1>
    <p>Собирайте ключевые показатели и наблюдайте динамику.</p>
  </header>

  <section class="card">
    <h2>Баланс</h2>
    <p>Общая сумма операций: {totalBalance.toFixed(2)}</p>
  </section>

  <section class="card">
    <h2>Топ категорий</h2>
    {#if topCategories.length === 0}
      <p>Пока нет операций.</p>
    {:else}
      <ul>
        {#each topCategories as item}
          <li>{item.category.name}: {item.total.toFixed(2)}</li>
        {/each}
      </ul>
    {/if}
  </section>

  <section class="card">
    <h2>Сравнение месяцев</h2>
    {#if !currentMonth}
      <p>Нет данных для сравнения.</p>
    {:else}
      <p>
        {currentMonth}: {monthlyTotals[currentMonth].toFixed(2)}
      </p>
      {#if previousMonth}
        <p>
          {previousMonth}: {monthlyTotals[previousMonth].toFixed(2)}
        </p>
      {/if}
    {/if}
  </section>
</main>
