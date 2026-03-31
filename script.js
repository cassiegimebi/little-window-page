const quotes = [
  { text: "We are all in the gutter, but some of us are looking at the stars.", author: "Oscar Wilde" },
  { text: "Hope is the thing with feathers that perches in the soul.", author: "Emily Dickinson" },
  { text: "To love and be loved is to feel the sun from both sides.", author: "David Viscott" },
  { text: "I carry your heart with me (I carry it in my heart).", author: "E.E. Cummings" },
  { text: "Where there is love there is life.", author: "Mahatma Gandhi" },
  { text: "The universe is built on a plan the profound symmetry of which is somehow present in the inner structure of our intellect.", author: "Paul Valéry" },
  { text: "Yours is the light by which my spirit's born: yours is the darkness of my soul's return.", author: "E.E. Cummings" }
];

const songs = [
  { title: "Put Your Records On", artist: "Corinne Bailey Rae", url: "https://www.youtube.com/watch?v=rjOhZZyn30k" },
  { title: "Here Comes The Sun", artist: "The Beatles", url: "https://www.youtube.com/watch?v=KQetemT1sWc" },
  { title: "Lovely Day", artist: "Bill Withers", url: "https://www.youtube.com/watch?v=bEeaS6fuUoA" },
  { title: "Just The Way You Are", artist: "Bruno Mars", url: "https://www.youtube.com/watch?v=LjhCEhWiKXk" },
  { title: "Vienna", artist: "Billy Joel", url: "https://www.youtube.com/watch?v=oZdiXvDU4P0" },
  { title: "What A Wonderful World", artist: "Louis Armstrong", url: "https://www.youtube.com/watch?v=A3yCcXgbKrE" }
];

let currentAttachment = null;

function updateDailyContent() {
  const now = new Date();
  
  // Update image
  const dateStr = now.toISOString().split('T')[0];
  document.getElementById("daily-img").src = `https://picsum.photos/seed/${dateStr}/400/200`;
  
  // Update quote
  const quoteIndex = now.getDate() % quotes.length;
  document.getElementById("quote-box").innerHTML = `"${quotes[quoteIndex].text}"<br><span class="quote-author">- ${quotes[quoteIndex].author}</span>`;

  // Update song
  const songIndex = now.getDate() % songs.length;
  document.getElementById("song-title").innerText = songs[songIndex].title;
  document.getElementById("song-artist").innerText = songs[songIndex].artist;
  document.getElementById("song-link").href = songs[songIndex].url;
}

async function fetchWeather() {
  try {
    const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=35.6895&longitude=139.6917&current_weather=true");
    const data = await res.json();
    const temp = Math.round(data.current_weather.temperature);
    const code = data.current_weather.weathercode;
    
    let icon = "☁️", desc = "Cloudy";
    if (code === 0) { icon = "☀️"; desc = "Clear"; }
    else if (code === 1 || code === 2 || code === 3) { icon = "🌤️"; desc = "Partly Cloudy"; }
    else if (code === 45 || code === 48) { icon = "🌫️"; desc = "Foggy"; }
    else if (code >= 51 && code <= 67) { icon = "🌧️"; desc = "Rainy"; }
    else if (code >= 71 && code <= 77) { icon = "❄️"; desc = "Snowy"; }
    else if (code >= 95) { icon = "⛈️"; desc = "Stormy"; }
    
    document.getElementById("weather-icon").innerText = icon;
    document.getElementById("weather-temp").innerText = temp + "°C";
    document.getElementById("weather-desc").innerText = desc;
  } catch (e) {
    document.getElementById("weather-desc").innerText = "Tokyo";
  }
}

function updateDate() {
  const now = new Date();

  document.getElementById("cal-month").innerText = now.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  document.getElementById("cal-day").innerText = now.getDate();
  document.getElementById("cal-weekday").innerText = now.toLocaleDateString("en-GB", { weekday: "long" });
}

function updateClocks() {
  const now = new Date();

  const tokyo = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  const france = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Paris" }));

  setHands("tokyo", tokyo);
  setHands("fr", france);
}

function setHands(prefix, time) {
  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  const secondDeg = seconds * 6 - 90;
  const minuteDeg = minutes * 6 + seconds * 0.1 - 90;
  const hourDeg = (hours % 12) * 30 + minutes * 0.5 - 90;

  document.getElementById(prefix + "-second").style.transform = `rotate(${secondDeg}deg)`;
  document.getElementById(prefix + "-minute").style.transform = `rotate(${minuteDeg}deg)`;
  document.getElementById(prefix + "-hour").style.transform = `rotate(${hourDeg}deg)`;
}

/* file attachment and diary logic */
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    currentAttachment = e.target.result;
    document.getElementById("imagePreview").innerHTML = `<img src="${currentAttachment}">`;
  };
  reader.readAsDataURL(file);
}

function saveToDiary(text, attachment) {
  const entries = JSON.parse(localStorage.getItem("mom_diary") || "[]");
  entries.unshift({
    date: new Date().toLocaleDateString("en-GB", { weekday: "long", month: "long", day: "numeric", hour: "2-digit", minute:"2-digit" }),
    text: text,
    image: attachment
  });
  localStorage.setItem("mom_diary", JSON.stringify(entries));
  alert("Saved to your Diary! 📖");
}

function renderDiary() {
  const entries = JSON.parse(localStorage.getItem("mom_diary") || "[]");
  const container = document.getElementById("diary-entries");
  if (entries.length === 0) {
    container.innerHTML = "<div class='diary-empty'>No entries yet. Write your first note! 📝</div>";
    return;
  }
  
  container.innerHTML = entries.map(e => `
    <div class="diary-entry">
      <div class="diary-date">${e.date}</div>
      <div class="diary-text">${e.text}</div>
      ${e.image ? `<img src="${e.image}" class="diary-img">` : ""}
    </div>
  `).join("");
}

/* modals */
function openNote() {
  document.getElementById("noteModal").style.display = "flex";
  document.getElementById("noteText").value = "";
  document.getElementById("imagePreview").innerHTML = "";
  document.getElementById("fileUpload").value = "";
  currentAttachment = null;
}

function closeNote() {
  document.getElementById("noteModal").style.display = "none";
}

function openDiary() { 
  renderDiary();
  document.getElementById("diaryModal").style.display = "flex"; 
}

function closeDiary() { 
  document.getElementById("diaryModal").style.display = "none"; 
}

function openSong() { 
  document.getElementById("songModal").style.display = "flex"; 
}

function closeSong() { 
  document.getElementById("songModal").style.display = "none"; 
}

function sendNote(type) {
  const text = document.getElementById("noteText").value;

  if (!text) {
    alert("write something first 💭");
    return;
  }
  
  saveToDiary(text, currentAttachment);

  const message = encodeURIComponent("mom's note 💌:\n\n" + text);

  if (type === "whatsapp") {
    const phone = "819067179962";
    window.location.href = "https://wa.me/" + phone + "?text=" + message;
  }

  if (type === "email") {
    window.location.href = "mailto:?subject=Daily Note 💗&body=" + message;
  }
  
  closeNote();
}

setInterval(updateClocks, 1000);
updateClocks();
updateDate();
updateDailyContent();
fetchWeather();