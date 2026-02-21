<template>
  <div class="book-list">
    <div class="book-list-label">Your constellation</div>
    <ul class="book-rows">
      <li
        v-for="(book, i) in books"
        :key="i"
        class="book-row"
        :class="{ 'is-moved-on': book.relationship === 'MOVED ON' }"
      >
        <span class="book-dot" :class="{ 'has-glow': book.relationship === 'LOVED' }"></span>
        <span class="book-title">{{ book.title }}</span>
        <span class="book-relationship">{{ book.relationship }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  books: {
    type: Array,
    required: true,
  },
})
</script>

<style scoped>
.book-list {
  margin-top: var(--sp-lg, 34px);
}

.book-list-label {
  font-family: var(--font-serif);
  font-size: 13px;
  font-weight: 500;
  font-style: italic;
  letter-spacing: 0.06em;
  color: var(--gold-dim);
  margin-bottom: var(--sp-md, 21px);
}

.book-rows {
  list-style: none;
  padding: 0;
  margin: 0;
}

.book-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(58, 42, 20, 0.5);
}

.book-row:last-child {
  border-bottom: none;
}

.book-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--gold);
  flex-shrink: 0;
}

.book-dot.has-glow {
  box-shadow: 0 0 8px var(--gold), 0 0 16px rgba(208, 160, 96, 0.3);
}

.book-title {
  flex: 1;
  font-family: var(--font-serif);
  font-size: 16px;
  font-weight: 300;
  font-style: italic;
  color: var(--cream-mid);
}

.book-relationship {
  font-family: var(--font-label, 'Spectral', 'Georgia', serif);
  font-size: 10px;
  font-weight: 300;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--cream-dim);
  flex-shrink: 0;
}

/* Moved on books: dimmer */
.is-moved-on .book-dot {
  opacity: 0.25;
  box-shadow: none;
}

.is-moved-on .book-title {
  color: var(--cream-dim);
}

.is-moved-on .book-relationship {
  color: var(--cream-ghost);
}
</style>
