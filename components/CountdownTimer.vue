<template>
  <div class="countdown-container">
    <div class="timer-display">
      <div class="time-unit">
        <div class="time-card">
          <div class="time-value">{{ days }}</div>
        </div>
        <span class="label">Days</span>
      </div>
      
      <div class="separator">
        <span>:</span>
      </div>
      
      <div class="time-unit">
        <div class="time-card">
          <div class="time-value">{{ hours }}</div>
        </div>
        <span class="label">Hours</span>
      </div>
      
      <div class="separator">
        <span>:</span>
      </div>
      
      <div class="time-unit">
        <div class="time-card">
          <div class="time-value">{{ minutes }}</div>
        </div>
        <span class="label">Minutes</span>
      </div>
      
      <div class="separator">
        <span>:</span>
      </div>
      
      <div class="time-unit">
        <div class="time-card">
          <div class="time-value">{{ seconds }}</div>
        </div>
        <span class="label">Seconds</span>
      </div>
    </div>
    <div class="love-time-text">Time of Our Love</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  startDate: {
    type: String,
    default: '2025-06-01T00:00:00' // June 1, 2025
  }
});

const days = ref('00');
const hours = ref('00');
const minutes = ref('00');
const seconds = ref('00');

let timer = null;

function countUp() {
  // Parse the start date correctly
  const startDate = new Date(props.startDate);
  const currentDate = new Date();
  
  // If the start date is in the future, display zeros
  if (startDate > currentDate) {
    days.value = "00";
    hours.value = "00";
    minutes.value = "00";
    seconds.value = "00";
    return;
  }
  
  // Calculate elapsed time in milliseconds
  const elapsedTime = currentDate.getTime() - startDate.getTime();
  
  const secondsInMs = 1000;
  const minutesInMs = secondsInMs * 60;
  const hoursInMs = minutesInMs * 60;
  const daysInMs = hoursInMs * 24;

  // Calculate each time unit
  const daysValue = Math.floor(elapsedTime / daysInMs);
  const hoursValue = Math.floor((elapsedTime % daysInMs) / hoursInMs);
  const minutesValue = Math.floor((elapsedTime % hoursInMs) / minutesInMs);
  const secondsValue = Math.floor((elapsedTime % minutesInMs) / secondsInMs);

  // Format and set the values
  days.value = String(daysValue).padStart(2, "0");
  hours.value = String(hoursValue).padStart(2, "0");
  minutes.value = String(minutesValue).padStart(2, "0");
  seconds.value = String(secondsValue).padStart(2, "0");
}

onMounted(() => {
  countUp(); // Run once immediately
  timer = setInterval(countUp, 1000);
});

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style scoped>
.countdown-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 30px 20px;
  filter: drop-shadow(0 0 20px rgba(255, 182, 193, 0.7));
  position: relative;
}

.love-time-text {
  position: relative;
  font-family: 'Dancing Script', cursive;
  font-size: 1.8rem;
  color: #ff6b95;
  margin-top: 20px;
  text-shadow: 0 0 10px rgba(255, 107, 149, 0.5);
  opacity: 0.9;
}

.timer-display {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 25px 30px;
  box-shadow: 
    0 10px 30px rgba(156, 107, 148, 0.3),
    inset 0 0 15px rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.time-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 8px;
  position: relative;
}

.time-card {
  position: relative;
  width: 90px;
  height: 90px;
  border-radius: 10px;
  overflow: hidden;
      background: linear-gradient(135deg, #ff65ac 0%, #ff9a9a 100%);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
}

.time-value {
  color: white;
  font-size: 2.8rem;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.label {
  margin-top: 12px;
  font-size: 0.9rem;
  color: #9c6b94;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.separator {
  font-size: 2.5rem;
  font-weight: bold;
  color: #ff6b95;
  margin: 0 5px;
  align-self: center;
  margin-bottom: 30px;
  text-shadow: 0 0 10px rgba(255, 107, 149, 0.5);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

@media (max-width: 768px) {
  .timer-display {
    padding: 15px 20px;
  }
  
  .time-card {
    width: 80px;
    height: 70px;
  }
  
  .time-value {
    font-size: 2rem;
  }
  
  .separator {
    font-size: 2rem;
    margin-bottom: 20px;
  }
  
  .love-time-text {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .time-card {
    width: 60px;
    height: 55px;
  }
  
  .time-value {
    font-size: 1.5rem;
  }
  
  .separator {
    font-size: 1.5rem;
    margin: 0 2px;
    margin-bottom: 15px;
  }
  
  .label {
    font-size: 0.7rem;
    margin-top: 8px;
  }
  
  .love-time-text {
    font-size: 1.2rem;
  }
}
</style> 