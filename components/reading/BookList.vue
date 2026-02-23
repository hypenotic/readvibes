<template>
  <div class="book-list">
    <div class="book-list-label">Your constellation</div>
    <ul class="book-rows">
      <li
        v-for="(book, i) in books"
        :key="i"
        class="book-row"
      >
        <span class="book-dot"></span>
        <span class="book-title">{{ getTitle(book) }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
const props = defineProps({
  books: {
    type: Array,
    required: true,
  },
})

function getTitle(book) {
  if (typeof book === 'string') return book
  return book?.title || ''
}
</script>

<style scoped>
.book-list {
  margin-top: var(--sp-lg, 34px);
}

.book-list-label {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 400;
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
  opacity: 0.7;
}

.book-title {
  flex: 1;
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 400;
  font-style: italic;
  color: var(--cream-mid);
}
</style>
