<template>
  <div class="lyrics-container" ref="lyricsContainer">
    <h3 class="lyrics-title">Lyrics</h3>
    <div class="lyrics-content">
      <transition name="fade-page" mode="out-in">
        <div 
          :key="`page-${currentPageIndex}`" 
          class="lyrics-page"
        >
          <p 
            v-for="(line, index) in currentLyricsPage" 
            :key="`line-${index}`" 
            class="lyrics-line"
            :class="{ 'active-line': index === activeLineIndex, 'paused': !isPlaying }"
          >
            {{ line }}
          </p>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';

// Timed lyrics for each song with timestamps in seconds
const timedLyrics = {
 1: [
 { time: 1.20, text: "হু.ম.ম ..ম.." },
{ time: 6.48, text: "হু.ম.ম ..ম........" },
{ time: 12.13, text: "তারারা......আ...." },
{ time: 22.39, text: "হতে পারে রূপকথার এক দেশের🌟" },
{ time: 27.56, text: "রাতের আকাশের এক ফালি চাঁদ🌛" },
{ time: 33.83, text: "তোমার আমার চিরকাল🫂" },
{ time: 43.66, text: "তুমি-আমি হাতে রেখে হাত🤝" },
{ time: 49.06, text: "ছুঁয়ে দিয়ে আঙুলে আঙুল...🫰" },
{ time: 54.98, text: "দেখতে পারো ....কিছু আদুরে সকাল🌄" },
{ time: 64.98, text: "হতে পারে এ পথের শুরু ..🛣️" },
{ time: 70.83, text: "নিয়ে যাবে আমাদের অজানায়" },
{ time: 75.60, text: "তুমি-আমি আমাদের পৃথিবী.🌍" },
{ time: 81.00, text: "সাজিয়ে নিবো ভালোবাসায় ..💖" },
{ time: 89.46, text:  "ভালোবাসি বলে দাও আমায় ❤️☺️" },
{ time: 94.98, text: "বলে দাও, হ্যাঁ, সব কবুল 😅" },
{ time: 100.38, text: "তুমি শুধু আমারই হবে ☺️" },
{ time: 105.68, text: "যদি করো মিষ্টি এই ভুল" },
{ time: 111.03, text: "হাতে হাত রাখতে পারো🤝" },
{ time: 116.39, text: "সন্ধি আঙুলে আঙুল👉👈" },
{ time: 121.54, text: "ভালোবাসা বাড়াতে আরও💓" },
{ time: 126.92, text: "হৃদয় ভীষণ ব্যাকুল" },
{ time: 132.34, text: "...." },
{ time: 141.70, text: "...." },
{ time: 147.94, text: "তারারা...." },
{ time: 153.75, text: "প্রতিদিন কী জানি কী হয়ে যায় ???" },
{ time: 158.94, text: "শুধু তোমার কল্পনায় .....ডুবে থাকা..😅" },
{ time: 166.25, text: "আমায় ভালোলাগায়" },
{ time: 169.63, text: "ভালোলাগার স্বপ্ন বোনায়" },
{ time: 174.76, text: "কখনো হারাবে না তুমি" },
{ time: 180.29, text: "চোখে চোখ রেখে কথা দাও👁️👁️" },
{ time: 185.32, text: "থাকবে কাছে ছায়ার মত" },
{ time: 191.08, text: "ছেড়ে যাবে না কোথাও 👉👈🥺" },
{ time: 198.53, text: "হতে পারে তোমার একটু চাওয়ায়👉👈" },
{ time: 203.01, text: "এনে দেবো শুকতারা কুড়িয়ে" },
{ time: 208.98, text: "স্বপ্ন আঁকব চন্দ্র দিয়ে🌕" },
{ time: 214.20, text: "পূর্ণিমাতে তোমায় বুকে জড়িয়ে.....🌕" },
{ time: 223.14, text:  "ভালোবাসি বলে দাও আমায় ❤️☺️" },
{ time: 228.36, text: "বলে দাও, হ্যাঁ, সব কবুল 😅" },
{ time: 232.88, text: "তুমি শুধু আমারই হবে" },
{ time: 239.04, text: "যদি করো মিষ্টি এই ভুল" },
{ time: 244.37, text: "হাতে হাত রাখতে পারো" },
{ time: 249.77, text: "সন্ধি আঙুলে আঙুল" },
{ time: 255.06, text: "ভালোবাসা বাড়াতে আরও💓" },
{ time: 260.46, text: "হৃদয় ভীষণ ব্যাকুল" },
 ],
  2: [
    { time: 0.30, text: "Music🎶🎵💖" },
{ time: 10.40, text: "Hmm…" },
{ time: 20.03, text: "Hmm… mm… mm…" },
{ time: 29.91, text: "Her Parkhera Basechhu Nee Ma" },
{ time: 34.89, text: "Sunnalaayi Timro Tyo Boli" },
{ time: 39.79, text: "Suna Mera Ee Bhaawanaharu" },
{ time: 44.73, text: "Kina Laagchha Yo Maaya Nai Ho Ki" },
{ time: 49.85, text: "Mero Saara Maaya Timilai Nai Chha" },
{ time: 54.71, text: "Timro Muskaanma Harayi Sake" },
{ time: 59.61, text: "Khusi Chhu Timro Saath Paayera" },
{ time: 64.63, text: "Nachhodhnu Hai Yo Haath Kahile" },
{ time: 69.78, text: "Bhoolidiula Yo Sansaar Timi Nai Bhaye" },
{ time: 74.47, text: "Timi Muskurauda Mann Mero Atalinu Parne" },
{ time: 79.74, text: "Kasaari Vyekta Garu Timlai Maaya Chha Bhani Ee" },
{ time: 87.30, text: "Hmm… Timi Haansi Dinu Hai, Mero Chheu Aaudai" },
{ time: 93.98, text: "Basirahanechhu Sadhai, Timrai Pratikshama Nai" },
{ time: 99.19, text: "Timi Haansi Dinu Hai, Mero Chheu Aaudai" },
{ time: 103.79, text: "Basirahanechhu Sadhai, Timrai Pratikshama Nai" },
{ time: 109.54, text: "Hmm…" },
{ time: 119.56, text: "Hmm… mm… mm…" },
{ time: 129.39, text: "Timrai Laagi Maaya Chha Ni, Tara Vannai Garo Bho" },
{ time: 134.33, text: "Aajabholi Geeta Kordai, Timrai Laagi Gaauchhu Ma" },
{ time: 139.02, text: "Timle Herda Muskuraune, Timro Baanile Aaja" },
{ time: 143.65, text: "Mana Chori Lagisakyo Ho…" },
{ time: 149.20, text: "Sabai Dukha Mero, Sunauna Timilai" },
{ time: 154.04, text: "Angaaloma Baadhi Haami, Saanjh Bhulai" },
{ time: 159.02, text: "Bihaan Biujhiyera Paayein, Timilai Nai Saathma" },
{ time: 164.08, text: "Raat Din Bitayi Rahane Chhu Ma Timrai Kaakhma" },
{ time: 172.12, text: "Timrai Pratikshama (Ma Haan)" },
{ time: 178.97, text: "Bhoolidiula Yo Sansaar Timi Nai Bhaaye" },
{ time: 183.94, text: "Timi Muskurauda Mann Mero Atalinu Parne" },
{ time: 188.76, text: "Kasaari Vyekta Garu Timlai Maaya Chha Bhani Ee" },
{ time: 196.64, text: "Hmm…" },
{ time: 199.04, text: "Timi Haansi Dinu Hai, Mero Chheu Aaudai" },
{ time: 203.25, text: "Basirahanechhu Sadhai, Timrai Pratikshama Nai" },
{ time: 208.67, text: "Timi Haansi Dinu Hai, Mero Chheu Aaudai" },
{ time: 213.13, text: "Basirahanechhu Sadhai, Timrai Pratikshama Nai (Maaya)" },
{ time: 218.66, text: "Hmm…" },
{ time: 221.58, text: "Timrai Pratikshama" },
{ time: 223.58, text: "Hmm… mm… mm…" },
  ],
  3: [
    { time: 0, text: "music 🎵🎶🎼" },
    { time: 9.94, text: "Paaya maine, paaya tumhe, rab ne milaya tumhe" },
    { time: 12.70, text: "Honthon pe sajaya tumhe, nagme sagaya tumhe" },
    { time: 15.05, text: "Paaya maine, paaya tumhe, sab se chupaya tumhe" },
    { time: 18.52, text: "Sapna banaya tumhe, neendon mein bulaya tumhe" },
    { time: 20.39, text: "Tum jo aaye zindagi mein baat ban gayi" },
    { time: 27.23, text: "Ishq mazhab, ishq meri zaat ban gayi" },
    { time: 32.85, text: "Paaya maine, paaya tumhe, rab ne milaya tumhe" },
    { time: 35.41, text: "Honthon pe sajaya tumhe, nagme sagaya tumhe" },
    { time: 37.90, text: "Paaya maine, paaya tumhe, sab se chupaya tumhe" },
    { time: 41.73, text: "Sapna banaya tumhe, neendon mein bulaya tumhe" },
    { time: 44.41, text: "Ho tum jo aaye zindagi mein baat ban gayi" },
    { time: 50.01, text: "Sapne teri chahaton ke, sapne teri chahaton ke" },
    { time: 55.75, text: "Dekhti hoon ab kayee" },
    { time: 58.66, text: "Din hai sona aur chaandi raat ban gayi" },
    { time: 63.41, text: "Hoo tum jo aaye zindagi mein baat ban gayi" },
    { time: 69.98, text: "Paaya maine, paaya tumhe, rab ne milaya tumhe" },
    { time: 72.46, text: "Honthon pe sajaya tumhe, nagme sagaya tumhe" },
    { time: 75.33, text: "Paaya maine, paaya tumhe, sab se chupaya tumhe" },
    { time: 78.34, text: "Sapna banaya tumhe, neendon mein bulaya tumhe" },
    { time: 110.63, text: "Chahaton ka mazaa, faasalon mein nahin" },
    { time: 116.31, text: "Aa chupa loon tumhe hauslon mein kahin" },
    { time: 122.02, text: "Sab se upar likha, hai tere naam ko" },
    { time: 127.63, text: "Khwaishon se jude silsilon mein kahin" },
    { time: 133.35, text: "Khwaishein milne ki tumse, khwaishein milne ki tumse" },
    { time: 138.72, text: "Roz hoti hai nayi" },
    { time: 141.51, text: "Mere dil ki jeet meri maat ban gayi" },
    { time: 146.35, text: "Hoo tum jo aaye zindagi mein baat ban gayi" },
    { time: 175.75, text: "Paaya maine, paaya tumhe, rab ne milaya tumhe" },
    { time: 178.60, text: "Honthon pe sajaya tumhe, nagme sagaya tumhe" },
    { time: 181.13, text: "Paaya maine, paaya tumhe, sab se chupaya tumhe" },
    { time: 183.98, text: "Sapna banaya tumhe, neendon mein bulaya tumhe" },
    { time: 187.67, text: "Zindagi bewaafa hai yeh maana magar" },
    { time: 193.14, text: "Chod kar raah mein jaoge tum agar" },
    { time: 199.13, text: "Cheen launga main aasman se tumhe" },
    { time: 204.68, text: "Soona hoga na yeh, do dilon ka nagar" },
    { time: 210.39, text: "Ronke hain dil ke dar pe, ronke hain dil ke dar pe" },
    { time: 215.93, text: "Dhadkane hain surmayi" },
    { time: 218.55, text: "Meri kismat bhi tumhari, saath ban gayi" },
    { time: 223.54, text: "Hoo tum jo aaye zindagi mein baat ban gayi" },
    { time: 230.05, text: "Ishq mazhab, ishq meri zaat ban gayi" },
    { time: 235.72, text: "Sapne teri chahaton ke, sapne teri chahaton ke" },
    { time: 241.50, text: "Dekhti hoon ab kayee" },
    { time: 244.29, text: "Din hai sona aur chaandi raat ban gayi" },
    { time: 249.15, text: "Hoo tum jo aaye zindagi mein baat ban gayi" },
    { time: 255.83, text: "Paaya maine, paaya tumhe, rab ne milaya tumhe" },
    { time: 258.52, text: "Honthon pe sajaya tumhe, nagme sagaya tumhe" },
    { time: 261.11, text: "Paaya maine, paaya tumhe, sab se chupaya tumhe" },
    { time: 264.02, text: "Sapna banaya tumhe, neendon mein bulaya tumhe" },
    { time: 266.47, text: "Paaya maine, paaya tumhe, rab ne milaya tumhe" },
    { time: 269.62, text: "Honthon pe sajaya tumhe, nagme sagaya tumhe" },
    { time: 272.53, text: "Paaya maine, paaya tumhe, sab se chupaya tumhe" },
    { time: 275.39, text: "Sapna banaya tumhe, neendon mein bulaya tumhe..." }
  ]
};

// Props to receive from parent (MusicPlayer)
const props = defineProps({
  currentSongId: {
    type: Number,
    default: 1
  },
  isPlaying: {
    type: Boolean,
    default: false
  },
  currentTime: {
    type: Number,
    default: 0
  }
});

// Emits to communicate with parent
const emit = defineEmits(['update:currentTime']);

const lyricsContainer = ref(null);
const linesPerPage = ref(4); // Fixed to display exactly 4 lines per page
const activeLineIndex = ref(0);
const currentPageIndex = ref(0);
let pageTransitionInProgress = ref(false);

// Get current lyrics based on song ID
const currentLyrics = computed(() => {
  return timedLyrics[props.currentSongId] || [];
});

// Extract just the text for display
const currentLyricsText = computed(() => {
  return currentLyrics.value.map(line => line.text);
});

// Get the current page of lyrics based on page index
const currentLyricsPage = computed(() => {
  const startIndex = currentPageIndex.value * linesPerPage.value;
  return currentLyricsText.value.slice(startIndex, startIndex + linesPerPage.value);
});

// Check if we're on the last page
const isLastPage = computed(() => {
  return (currentPageIndex.value + 1) * linesPerPage.value >= currentLyricsText.value.length;
});

// Find the active line based on current playback time
const findActiveLine = (time) => {
  let activeIndex = 0;
  
  // Find the current active line based on time
  for (let i = 0; i < currentLyrics.value.length; i++) {
    const currentLineTime = currentLyrics.value[i].time;
    
    // If this line's time is less than or equal to current playback time
    // AND is greater than previous active line's time, it becomes the active line
    if (time >= currentLineTime) {
      // If we're at the last line or the next line's time is greater than current time
      if (i === currentLyrics.value.length - 1 || 
          (i + 1 < currentLyrics.value.length && time < currentLyrics.value[i + 1].time)) {
        activeIndex = i;
        // We found our line, no need to continue
        break;
      }
    }
  }
  
  // Calculate which page this line is on
  const newPageIndex = Math.floor(activeIndex / linesPerPage.value);
  
  // Always update the active line index first
  activeLineIndex.value = activeIndex % linesPerPage.value;
  
  // If we need to change page and not in transition
  if (newPageIndex !== currentPageIndex.value && !pageTransitionInProgress.value) {
    pageTransitionInProgress.value = true;
    currentPageIndex.value = newPageIndex;
    
    // Reset transition flag after animation completes
    setTimeout(() => {
      pageTransitionInProgress.value = false;
    }, 600);
  }
};

// Using a fixed value of 4 lines per page

// Reset display when song changes
const resetLyricsDisplay = () => {
  currentPageIndex.value = 0;
  activeLineIndex.value = 0;
  pageTransitionInProgress.value = false;
  
  // Force immediate update of active line based on current time
  // This ensures the correct line is highlighted right after song change
  nextTick(() => {
    findActiveLine(props.currentTime);
  });
};

// Watch for song changes
watch(() => props.currentSongId, () => {
  resetLyricsDisplay();
});

// Watch for playback time changes
watch(() => props.currentTime, (newTime) => {
  // Always check for active line, even when paused
  // This ensures lyrics update properly when seeking or changing songs
  findActiveLine(newTime);
});

// Watch for play/pause state changes
watch(() => props.isPlaying, (isPlaying) => {
  if (!isPlaying) {
    // We don't need to do anything special on pause
    // The lyrics will stay at current position
  }
});

// Handle window resize
const handleResize = () => {
  // No need to recalculate lines per page as it's fixed to 4
  // Just recalculate active line after resize
  findActiveLine(props.currentTime);
};

onMounted(() => {
  // Initialize with first line active
  activeLineIndex.value = 0;
  
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.lyrics-container {
  width: 100%;
  height: 100%;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(156, 107, 148, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.lyrics-title {
  font-size: 1.2rem;
  color: #ff6b95;
  margin-top: 0;
  margin-bottom: 15px;
  text-align: center;
  font-weight: 600;
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(255, 107, 149, 0.3);
}

.lyrics-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;
  position: relative;
  overflow: hidden;
}

.lyrics-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lyrics-line {
  margin: 5px 0;
  color: #9c6b94;
  font-size: 1rem;
  line-height: 1.5;
  text-align: center;
  width: 100%;
  transition: all 0.5s ease;
  opacity: 0.7;
}

.lyrics-line.active-line {
  color: #ff6b95;
  font-weight: 500;
  opacity: 1;
  transform: scale(1.05);
  text-shadow: 0 0 15px rgba(255, 107, 149, 0.7);
  animation: glow 1.5s infinite alternate;
}

.lyrics-line.active-line.paused {
  animation-play-state: paused;
}

.lyrics-line:empty {
  height: 15px;
}

/* Page transition - smoother with mode="out-in" */
.fade-page-enter-active,
.fade-page-leave-active {
  transition: all 0.5s ease;
}

.fade-page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@keyframes glow {
  from {
    text-shadow: 0 0 10px rgba(255, 107, 149, 0.5);
  }
  to {
    text-shadow: 0 0 20px rgba(255, 107, 149, 0.9), 0 0 30px rgba(255, 107, 149, 0.5);
  }
}

@media (max-width: 768px) {
  .lyrics-title {
    font-size: 1.1rem;
  }
  
  .lyrics-line {
    font-size: 0.9rem;
  }
}
</style>