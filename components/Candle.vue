<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  blown: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['blown']);

const flame = ref(null);
const wick = ref(null);

function blowCandle() {
  if (props.blown) return;
  
  // Set flame opacity to 0
  flame.value.style.opacity = "0";
  
  // Make wick visible
  wick.value.classList.add("visible");
  
  // Create smoke element
  const smoke = document.createElement("div");
  smoke.classList.add("smoke");
  
  // Append smoke to flame
  flame.value.appendChild(smoke);
  
  // Remove smoke after animation
  setTimeout(() => smoke.remove(), 2000);
  
  // Emit event
  emit('blown');
}

onMounted(() => {
  if (props.blown) {
    flame.value.style.opacity = "0";
    wick.value.classList.add("visible");
  }
});
</script>

<template>
  <div class="candle" @click="blowCandle">
    <div class="fire" ref="flame">
      <div class="fire1"></div>
      <div class="fire2"></div>
      <div class="fire3"></div>
    </div>
    <div class="wax">
      <div class="wick" ref="wick"></div>
    </div>
  </div>
</template>

<style scoped>
.candle {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;
}

.fire {
  position: relative;
  width: 50px;
  height: 100px;
  transition: opacity 0.5s ease;
  margin-left: -45px;
}

.fire1, .fire2, .fire3 {
  position: absolute;
  bottom: 0;
  right: 0;
  border-radius: 0 100%;
  transform-origin: bottom right;
}

.fire1 {
  width: 50px;
  height: 100px;
  background-color: #fcf3a5;
  filter: drop-shadow(0 0 40px #ffdc42);
  animation: anim1 5s linear infinite;
  z-index: 1;
}

.fire2 {
  width: 25px;
  height: 60px;
  background-color: #ffd932;
  filter: drop-shadow(0 0 5px #ffd932);
  animation: anim2 4s linear infinite;
  animation-delay: 0.5s;
  z-index: 2;
}

.fire3 {
  width: 15px;
  height: 25px;
  background-color: #7fa5ff;
  filter: drop-shadow(0 0 15px #7fa5ff);
  animation: anim3 2s linear infinite;
  animation-delay: 1s;
  z-index: 3;
}

.wax {
  width: 20px;
  height: 80px;
  background-color: #ffffdf;
  border-radius: 10px 10px 0 0;
  position: relative;
  z-index: 0;
}

@keyframes anim1 {
  0% { transform: rotate(30deg) scale(1.1); }
  50% { transform: rotate(20deg); }
  100% { transform: rotate(30deg) scale(1.1); }
}

@keyframes anim2 {
  0% { transform: rotate(18deg) scale(1.1); }
  50% { transform: rotate(5deg); }
  100% { transform: rotate(18deg) scale(1.1); }
}

@keyframes anim3 {
  0% { transform: rotate(15deg) scale(1.1); }
  50% { transform: rotate(5deg); }
  100% { transform: rotate(15deg) scale(1.1); }
}

.smoke {
  position: absolute;
  top: -20px;
  left: 5px;
  width: 15px;
  height: 30px;
  background: radial-gradient(ellipse at center, rgba(180,180,180,0.5) 0%, rgba(0,0,0,0) 80%);
  border-radius: 50%;
  opacity: 0.7;
  animation: smokeRise 2s ease-out forwards;
}

@keyframes smokeRise {
  0% {
    transform: translateY(0px) scale(1);
    opacity: 0.7;
  }
  100% {
    transform: translateY(-80px) scale(1.5);
    opacity: 0;
  }
}

.wick {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 3px;
  height: 10px;
  background-color: black;
  border-radius: 2px;
  opacity: 0;
  transition: opacity 0.5s;
}

.wick.visible {
  opacity: 1;
}
</style> 