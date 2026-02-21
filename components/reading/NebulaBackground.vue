<template>
  <div class="nebula" aria-hidden="true">
    <span class="nebula-orb nebula-1"></span>
    <span class="nebula-orb nebula-2"></span>
    <span class="nebula-orb nebula-3"></span>
  </div>
</template>

<style scoped>
.nebula {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.nebula-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  pointer-events: none;
}

/* Warm brown — top-left, drifts right/down */
.nebula-1 {
  width: 650px;
  height: 500px;
  top: -10%;
  left: -20%;
  background: rgba(150, 90, 25, 0.07);
  animation: drift-1 32s ease-in-out infinite;
}

/* Cool purple — bottom-right, drifts left/up */
.nebula-2 {
  width: 500px;
  height: 450px;
  bottom: -10%;
  right: -15%;
  background: rgba(55, 35, 85, 0.05);
  animation: drift-2 42s ease-in-out infinite;
}

/* Warm gold — center, breathes */
.nebula-3 {
  width: 350px;
  height: 280px;
  top: 40%;
  left: 30%;
  background: rgba(170, 100, 35, 0.035);
  animation: drift-3 26s ease-in-out infinite;
}

@keyframes drift-1 {
  0%, 100% {
    opacity: 0.5;
    transform: translate(0, 0);
  }
  50% {
    opacity: 0.95;
    transform: translate(40px, 30px);
  }
}

@keyframes drift-2 {
  0%, 100% {
    opacity: 0.5;
    transform: translate(0, 0);
  }
  50% {
    opacity: 0.9;
    transform: translate(-30px, -25px);
  }
}

@keyframes drift-3 {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.95;
    transform: scale(1.15);
  }
}

@media (prefers-reduced-motion: reduce) {
  .nebula-orb {
    animation: none;
    opacity: 0.7;
  }
}
</style>
