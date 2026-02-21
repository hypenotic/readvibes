<template>
  <div class="book-list">
    <div class="book-list-label">Your constellation</div>
    <ul class="book-rows">
      <li
        v-for="(book, i) in books"
        :key="i"
        class="book-row"
        :class="{ 'is-moved-on': book.movedOn }"
      >
        <span
          class="book-dot"
          :style="{ opacity: dotOpacity(book), boxShadow: dotGlow(book) }"
        ></span>
        <span class="book-title">{{ book.title }}</span>
        <span v-if="book.movedOn" class="book-status">moved on</span>
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

function dotOpacity(book) {
  if (book.movedOn) return 0.25
  const immersion = typeof book.immersion === 'number' ? book.immersion : 0.75
  return 0.4 + immersion * 0.6
}

function dotGlow(book) {
  if (book.movedOn) return 'none'
  const immersion = typeof book.immersion === 'number' ? book.immersion : 0.75
  if (immersion >= 0.7) {
    const intensity = (immersion - 0.7) / 0.3
    return `0 0 ${8 + intensity * 8}px var(--gold, #d0a060), 0 0 ${16 + intensity * 8}px rgba(208, 160, 96, ${0.15 + intensity * 0.2})`
  }
  return 'none'
}
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

.book-title {
  flex: 1;
  font-family: var(--font-serif);
  font-size: 16px;
  font-weight: 300;
  font-style: italic;
  color: var(--cream-mid);
}

.book-status {
  font-family: var(--font-label, 'Spectral', 'Georgia', serif);
  font-size: 10px;
  font-weight: 300;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--cream-ghost);
  flex-shrink: 0;
}

/* Moved on books: dimmer */
.is-moved-on .book-title {
  color: var(--cream-dim);
}
</style>
