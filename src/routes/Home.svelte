<script>
  const categories = ['Еда', 'Транспорт', 'Коммунальные', 'Развлечения', 'Прочее'];
  const currencies = ['RUB', 'USD', 'EUR'];
</script>

<main class="app">
  <section class="card form-card">
    <h2>Добавить операцию</h2>
    <form class="entry-form">
      <label class="field">
        <span class="field-label">Категория</span>
        <select name="category">
          {#each categories as category}
            <option value={category}>{category}</option>
          {/each}
        </select>
      </label>

      <label class="field">
        <span class="field-label">Сумма</span>
        <input name="amount" type="number" min="0" step="0.01" placeholder="0.00" />
      </label>

      <label class="field">
        <span class="field-label">Валюта</span>
        <select name="currency">
          {#each currencies as currency}
            <option value={currency}>{currency}</option>
          {/each}
        </select>
      </label>

      <label class="field">
        <span class="field-label">Заметка</span>
        <textarea name="note" rows="3" placeholder="Короткий комментарий"></textarea>
      </label>

      <button class="primary-button" type="submit">Сохранить</button>
    </form>
  </section>
</main>
