<script>
  import { categories, addTransaction, transactions } from '../stores/financeStore';

  const currencies = ['RUB', 'USD', 'EUR'];

  let selectedCategoryId = '';
  let amount = '';
  let currency = currencies[0];
  let note = '';
  let transactionDate = new Date().toISOString().slice(0, 10);

  const getMonthRange = (date) => {
    const value = new Date(date);
    const start = new Date(value.getFullYear(), value.getMonth(), 1);
    const end = new Date(value.getFullYear(), value.getMonth() + 1, 0);
    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    };
  };

  const defaultMonthRange = getMonthRange(new Date());
  let periodStart = defaultMonthRange.start;
  let periodEnd = defaultMonthRange.end;

  const resetForm = () => {
    amount = '';
    note = '';
    if ($categories.length) {
      selectedCategoryId = $categories[0].id;
    }
  };

  const handleSubmit = async () => {
    const numericAmount = Number.parseFloat(amount);

    if (!selectedCategoryId || Number.isNaN(numericAmount) || numericAmount <= 0) {
      return;
    }

    await addTransaction({
      id: crypto.randomUUID(),
      amount: numericAmount,
      currency,
      categoryId: selectedCategoryId,
      note: note.trim(),
      date: transactionDate,
      createdAt: new Date().toISOString(),
    });

    resetForm();
  };

  $: if ($categories.length && !selectedCategoryId) {
    selectedCategoryId = $categories[0].id;
  }

  $: categoryMap = new Map($categories.map((category) => [category.id, category]));
  $: filteredTransactions = $transactions
    .filter((transaction) => {
      if (periodStart && transaction.date < periodStart) {
        return false;
      }
      if (periodEnd && transaction.date > periodEnd) {
        return false;
      }
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));
</script>

<main class="app">
  <section class="card form-card">
    <h2>Добавить операцию</h2>
    <form class="entry-form" on:submit|preventDefault={handleSubmit}>
      <label class="field">
        <span class="field-label">Категория</span>
        <select name="category" bind:value={selectedCategoryId}>
          {#if $categories.length === 0}
            <option value="" disabled selected>Нет категорий</option>
          {:else}
            {#each $categories as category}
              <option value={category.id}>{category.name}</option>
            {/each}
          {/if}
        </select>
      </label>

      <label class="field">
        <span class="field-label">Сумма</span>
        <input
          name="amount"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          bind:value={amount}
        />
      </label>

      <label class="field">
        <span class="field-label">Дата</span>
        <input name="date" type="date" bind:value={transactionDate} />
      </label>

      <label class="field">
        <span class="field-label">Валюта</span>
        <select name="currency" bind:value={currency}>
          {#each currencies as currency}
            <option value={currency}>{currency}</option>
          {/each}
        </select>
      </label>

      <label class="field">
        <span class="field-label">Заметка</span>
        <textarea
          name="note"
          rows="3"
          placeholder="Короткий комментарий"
          bind:value={note}
        ></textarea>
      </label>

      <button class="primary-button" type="submit">Сохранить</button>
    </form>
  </section>

  <section class="card">
    <h2>Траты за период</h2>
    <div class="entry-form">
      <label class="field">
        <span class="field-label">С</span>
        <input name="periodStart" type="date" bind:value={periodStart} />
      </label>
      <label class="field">
        <span class="field-label">По</span>
        <input name="periodEnd" type="date" bind:value={periodEnd} />
      </label>
    </div>

    {#if filteredTransactions.length === 0}
      <p>За выбранный период операций нет.</p>
    {:else}
      <ul>
        {#each filteredTransactions as transaction (transaction.id)}
          <li>
            {transaction.date} · {categoryMap.get(transaction.categoryId)?.name ?? 'Без категории'} ·
            {transaction.amount.toFixed(2)} {transaction.currency}
          </li>
        {/each}
      </ul>
    {/if}
  </section>
</main>
