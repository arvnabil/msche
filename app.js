/**
 * ACTiV Room Booking Panel - Core JS Application Logic
 */

// --- DYNAMIC DATA STATE INITIALIZATION ---
let panelState = {
  roomName: "Alpha Meeting Room",
  deviceName: "ACTiV-WRP1000-04",
  companyName: "ACTiV",
  status: "available", // available, occupied, ending-soon, maintenance, offline
  isOnline: true,
  lastSyncTime: new Date(),
  checkinConfigMinutes: 10,
  checkinActive: false,
  checkinRemainingSeconds: 0,
  checkinTimerId: null,
  currentMeeting: null,
  upcomingMeetings: []
};

// SVG Icons Cache for platforms
const PLATFORM_ICONS = {
  "Google Meet": `<svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`,
  "Zoom": `<svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`,
  "Teams": `<svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
  "None": `<svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>`
};

// Generate an offline SVG QR Code representation
function getSVGQRCode(content) {
  // Return an attractive SVG mock of a QR Code
  return `
    <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; display: block;">
      <rect x="0" y="0" width="100" height="100" fill="#fff"/>
      <!-- Three primary corners alignment squares -->
      <rect x="5" y="5" width="25" height="25" fill="#111827"/>
      <rect x="9" y="9" width="17" height="17" fill="#fff"/>
      <rect x="13" y="13" width="9" height="9" fill="#111827"/>

      <rect x="70" y="5" width="25" height="25" fill="#111827"/>
      <rect x="74" y="9" width="17" height="17" fill="#fff"/>
      <rect x="78" y="13" width="9" height="9" fill="#111827"/>

      <rect x="5" y="70" width="25" height="25" fill="#111827"/>
      <rect x="9" y="74" width="17" height="17" fill="#fff"/>
      <rect x="13" y="78" width="9" height="9" fill="#111827"/>

      <!-- Center cluster and tiny details -->
      <rect x="40" y="10" width="8" height="8" fill="#111827"/>
      <rect x="50" y="5" width="6" height="6" fill="#111827"/>
      <rect x="45" y="25" width="12" height="6" fill="#111827"/>
      <rect x="10" y="45" width="6" height="12" fill="#111827"/>

      <!-- Random QR data matrices -->
      <rect x="35" y="35" width="15" height="15" fill="#111827"/>
      <rect x="39" y="39" width="7" height="7" fill="#fff"/>
      
      <rect x="55" y="40" width="20" height="5" fill="#111827"/>
      <rect x="60" y="50" width="5" height="20" fill="#111827"/>
      <rect x="70" y="45" width="25" height="10" fill="#111827"/>
      
      <rect x="35" y="60" width="10" height="30" fill="#111827"/>
      <rect x="50" y="75" width="30" height="10" fill="#111827"/>
      <rect x="80" y="70" width="15" height="20" fill="#111827"/>
      <rect x="85" y="30" width="10" height="10" fill="#111827"/>
      <rect x="5" y="40" width="15" height="5" fill="#111827"/>
    </svg>
  `;
}

// Generate schedule dynamically relative to today's date
function generateDefaultSchedule() {
  const now = new Date();
  
  // Set up mock calendar events
  // Meeting 1: Design Sync (Completed earlier today)
  const m1Start = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
  const m1End = new Date(now.getTime() - 1 * 60 * 60 * 1000);

  // Meeting 2: Marketing Review (Current slot simulation or upcoming depending on state)
  const m2Start = new Date(now.getTime() + 15 * 60 * 1000); // starts in 15 mins
  const m2End = new Date(now.getTime() + 45 * 60 * 1000);   // ends in 45 mins

  // Meeting 3: Sync alignment (starts in 2 hours)
  const m3Start = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const m3End = new Date(now.getTime() + 3 * 60 * 60 * 1000);

  // Meeting 4: Mekari Integrations (starts in 4 hours)
  const m4Start = new Date(now.getTime() + 4 * 60 * 60 * 1000);
  const m4End = new Date(now.getTime() + 5 * 60 * 60 * 1000);

  panelState.upcomingMeetings = [
    {
      id: "meet-1",
      title: "Design Sync & Assets Review",
      organizer: "Sarah Jenkins",
      start: m1Start,
      end: m1End,
      platform: "Google Meet",
      checkedIn: true
    },
    {
      id: "meet-2",
      title: "Marketing Campaign Kickoff",
      organizer: "Bruce Wayne",
      start: m2Start,
      end: m2End,
      platform: "Teams",
      checkedIn: false
    },
    {
      id: "meet-3",
      title: "Exchange Middleware Integration",
      organizer: "Diana Prince",
      start: m3Start,
      end: m3End,
      platform: "None",
      checkedIn: false
    },
    {
      id: "meet-4",
      title: "Mekari Calendar Sync Audit",
      organizer: "Nabil",
      start: m4Start,
      end: m4End,
      platform: "Zoom",
      checkedIn: false
    }
  ];

  // Try to load cached data from localStorage if exists
  const cache = localStorage.getItem("activ_panel_cache");
  if (cache) {
    try {
      const parsed = JSON.parse(cache);
      // Re-hydrate dates
      panelState.roomName = parsed.roomName || panelState.roomName;
      panelState.deviceName = parsed.deviceName || panelState.deviceName;
      if (parsed.currentMeeting) {
        panelState.currentMeeting = parsed.currentMeeting;
        panelState.currentMeeting.start = new Date(parsed.currentMeeting.start);
        panelState.currentMeeting.end = new Date(parsed.currentMeeting.end);
      }
      if (parsed.upcomingMeetings) {
        panelState.upcomingMeetings = parsed.upcomingMeetings.map(m => ({
          ...m,
          start: new Date(m.start),
          end: new Date(m.end)
        }));
      }
      panelState.status = parsed.status || panelState.status;
    } catch(e) {
      console.warn("Failed to load offline storage cache", e);
    }
  }

  // Adjust currentMeeting state
  evaluateRoomState();
}

// Write to cache
function saveCache() {
  localStorage.setItem("activ_panel_cache", JSON.stringify({
    roomName: panelState.roomName,
    deviceName: panelState.deviceName,
    status: panelState.status,
    currentMeeting: panelState.currentMeeting,
    upcomingMeetings: panelState.upcomingMeetings
  }));
}

// Evaluate room status based on current time & meetings list
function evaluateRoomState() {
  const now = new Date();
  
  // Clean up finished meetings from active slot
  if (panelState.currentMeeting && panelState.currentMeeting.end <= now) {
    panelState.currentMeeting = null;
    panelState.status = "available";
    clearCheckinTimer();
  }

  // Check if we have an active meeting right now
  let activeMeeting = null;
  for (let m of panelState.upcomingMeetings) {
    if (m.start <= now && m.end > now) {
      activeMeeting = m;
      break;
    }
  }

  if (activeMeeting) {
    // Transfer from upcoming schedule to current meeting slot
    panelState.currentMeeting = activeMeeting;
    panelState.upcomingMeetings = panelState.upcomingMeetings.filter(m => m.id !== activeMeeting.id);
    
    // Evaluate if Check-in is needed
    if (!activeMeeting.checkedIn) {
      triggerCheckInCountdown(activeMeeting);
    }
    
    panelState.status = "occupied";
  }

  // Check if current meeting is ending soon (e.g. less than 5 minutes remaining)
  if (panelState.currentMeeting) {
    const timeRemaining = panelState.currentMeeting.end - now;
    const minsRemaining = timeRemaining / (1000 * 60);
    
    if (minsRemaining <= 5 && minsRemaining > 0 && panelState.status === "occupied") {
      panelState.status = "ending-soon";
    }
  }

  updateUI();
  saveCache();
}

// --- CHECK-IN LOGIC ---
function triggerCheckInCountdown(meeting) {
  if (panelState.checkinActive) return;
  
  panelState.checkinActive = true;
  // Calculate remaining seconds: meeting starts + 10 mins (or speed up simulated to 30 seconds for quick testing)
  // For realism, let's set checkin timeout relative to when the meeting started:
  const now = new Date();
  const meetingAgeSeconds = Math.max(0, Math.floor((now - meeting.start) / 1000));
  const checkinDurationSeconds = panelState.checkinConfigMinutes * 60;
  
  panelState.checkinRemainingSeconds = Math.max(0, checkinDurationSeconds - meetingAgeSeconds);
  
  if (panelState.checkinTimerId) clearInterval(panelState.checkinTimerId);
  
  panelState.checkinTimerId = setInterval(() => {
    panelState.checkinRemainingSeconds--;
    
    if (panelState.checkinRemainingSeconds <= 0) {
      // Timeout - Release Room!
      handleCheckinTimeout();
    } else {
      updateCheckinBanner();
    }
  }, 1000);
  
  updateCheckinBanner();
}

function updateCheckinBanner() {
  const banner = document.getElementById("checkin-warning");
  const text = document.getElementById("checkin-warning-text");
  
  if (panelState.checkinActive && panelState.checkinRemainingSeconds > 0) {
    banner.style.display = "flex";
    const mins = Math.floor(panelState.checkinRemainingSeconds / 60);
    const secs = panelState.checkinRemainingSeconds % 60;
    text.textContent = `Check-in required: Room will release in ${mins}:${secs.toString().padStart(2, '0')}`;
  } else {
    banner.style.display = "none";
  }
}

function clearCheckinTimer() {
  panelState.checkinActive = false;
  panelState.checkinRemainingSeconds = 0;
  if (panelState.checkinTimerId) {
    clearInterval(panelState.checkinTimerId);
    panelState.checkinTimerId = null;
  }
  const banner = document.getElementById("checkin-warning");
  if (banner) banner.style.display = "none";
}

function triggerCheckIn() {
  if (panelState.currentMeeting) {
    panelState.currentMeeting.checkedIn = true;
    clearCheckinTimer();
    panelState.status = "occupied";
    updateUI();
    saveCache();
    notifyAPI("checkin", { meetingId: panelState.currentMeeting.id });
    
    // Smooth check-in toast
    showToast("Check-in successful! Room reserved.");
  }
}

function handleCheckinTimeout() {
  clearCheckinTimer();
  if (panelState.currentMeeting) {
    const oldTitle = panelState.currentMeeting.title;
    notifyAPI("end", { meetingId: panelState.currentMeeting.id, reason: "checkin_timeout" });
    panelState.currentMeeting = null;
    panelState.status = "available";
    updateUI();
    saveCache();
    showToast(`Released: "${oldTitle}" canceled due to check-in timeout.`);
  }
}

// --- APP OPERATIONS: Book, Extend, End ---

function handleBookRoom(event) {
  event.preventDefault();
  const title = document.getElementById("book-title").value;
  const organizer = document.getElementById("book-organizer").value;
  const duration = parseInt(document.getElementById("book-duration").value);
  const platform = document.getElementById("book-platform").value;
  
  const now = new Date();
  const end = new Date(now.getTime() + duration * 60 * 1000);
  
  // Conflict Detection: check if this slot overlaps any future meetings
  let conflict = false;
  for (let m of panelState.upcomingMeetings) {
    if (m.start < end && m.end > now) {
      conflict = true;
      break;
    }
  }
  
  if (conflict) {
    showToast("Error: Booking overlaps with an upcoming schedule!", true);
    return;
  }
  
  // Create meeting object
  const newMeeting = {
    id: "adhoc-" + Date.now(),
    title: title,
    organizer: organizer,
    start: now,
    end: end,
    platform: platform,
    checkedIn: true // Auto checked-in because booked directly on panel
  };
  
  panelState.currentMeeting = newMeeting;
  panelState.status = "occupied";
  
  notifyAPI("book", newMeeting);
  closeModal('book-modal');
  updateUI();
  saveCache();
  showToast(`Booking Successful: Room is yours for ${duration} mins.`);
}

function handleExtend(minutes) {
  if (!panelState.currentMeeting) return;
  
  const targetEnd = new Date(panelState.currentMeeting.end.getTime() + minutes * 60 * 1000);
  
  // Conflict Detection
  let conflict = false;
  let nextMeeting = null;
  
  for (let m of panelState.upcomingMeetings) {
    if (m.start < targetEnd && m.end > panelState.currentMeeting.end) {
      conflict = true;
      nextMeeting = m;
      break;
    }
  }
  
  if (conflict) {
    const minsAvailable = Math.floor((nextMeeting.start - panelState.currentMeeting.end) / 60000);
    const warningEl = document.getElementById("extend-conflict-warning");
    const labelEl = document.getElementById("conflict-time-left");
    
    warningEl.style.display = "block";
    labelEl.textContent = `${minsAvailable} minutes (Next meeting: "${nextMeeting.title}" starts soon)`;
    showToast(`Conflict detected! Max extension is ${minsAvailable} mins.`, true);
    return;
  }
  
  panelState.currentMeeting.end = targetEnd;
  
  // If we had checkin countdown active, refresh or recalculate if ending soon
  evaluateRoomState();
  closeModal('extend-modal');
  notifyAPI("extend", { meetingId: panelState.currentMeeting.id, newEnd: targetEnd });
  showToast(`Room extended by ${minutes} minutes.`);
}

function handleCustomExtend() {
  const customMins = parseInt(document.getElementById("custom-extend-mins").value) || 0;
  if (customMins > 0) {
    handleExtend(customMins);
  }
}

function endCurrentMeetingEarly() {
  if (!panelState.currentMeeting) return;
  
  if (confirm("Are you sure you want to end this meeting early? This will release the room immediately.")) {
    notifyAPI("end", { meetingId: panelState.currentMeeting.id });
    panelState.currentMeeting = null;
    panelState.status = "available";
    clearCheckinTimer();
    updateUI();
    saveCache();
    showToast("Meeting ended early. Room is now available.");
  }
}

// --- UI UPDATER ENGINE ---
function updateUI() {
  const body = document.getElementById("panel-body");
  
  // Update overall class list representing status
  body.className = `dark-theme status-${panelState.status}`;
  
  // Update Room Labels
  document.getElementById("display-room-name").textContent = panelState.roomName;
  document.getElementById("display-company-name").textContent = panelState.companyName;
  
  // Update current meeting details panel
  const meetingTitle = document.getElementById("meeting-title");
  const meetingOrg = document.getElementById("meeting-organizer");
  const meetingTime = document.getElementById("meeting-time-range");
  const countdownBox = document.getElementById("countdown-section");
  const bannerText = document.getElementById("status-banner-text-content");
  
  // Action Buttons selectors
  const btnBook = document.getElementById("btn-book-now");
  const btnCheckIn = document.getElementById("btn-check-in");
  const btnExtend = document.getElementById("btn-extend");
  const btnEnd = document.getElementById("btn-end-meeting");
  
  // Render based on state
  if (panelState.status === "maintenance") {
    meetingTitle.textContent = "Under Maintenance";
    meetingOrg.textContent = "Unavailable for bookings";
    meetingTime.textContent = "Please use alternative meeting facilities on this floor.";
    countdownBox.style.display = "none";
    clearCheckinTimer();
    
    if (bannerText) bannerText.textContent = `Room Maintenance • ${panelState.roomName}`;
    
    // Buttons
    btnBook.style.display = "none";
    btnCheckIn.style.display = "none";
    btnExtend.style.display = "none";
    btnEnd.style.display = "none";
  } 
  else if (panelState.status === "offline") {
    meetingTitle.textContent = "Offline / Connection Lost";
    meetingOrg.textContent = "Displaying cached calendar schedule";
    meetingTime.textContent = "Ad-hoc bookings disabled until synchronization restored.";
    countdownBox.style.display = "none";
    clearCheckinTimer();
    
    if (bannerText) bannerText.textContent = `Device Offline • Cached Schedule Mode`;
    
    // Buttons
    btnBook.style.display = "none";
    btnCheckIn.style.display = "none";
    btnExtend.style.display = "none";
    btnEnd.style.display = "none";
  }
  else if (panelState.currentMeeting) {
    const meeting = panelState.currentMeeting;
    meetingTitle.textContent = meeting.title;
    meetingOrg.textContent = `Organized by: ${meeting.organizer}`;
    
    const startStr = formatTime(meeting.start);
    const endStr = formatTime(meeting.end);
    meetingTime.textContent = `${startStr} - ${endStr} (${getDurationMinutes(meeting.start, meeting.end)} min)`;
    
    countdownBox.style.display = "block";
    
    if (bannerText) {
      const bannerTextVal = panelState.status === "ending-soon" ? "Ending Soon" : "Occupied";
      bannerText.textContent = `${bannerTextVal} until ${formatTime(meeting.end, false)} • ${panelState.roomName}`;
    }
    
    // Button setup
    btnBook.style.display = "none";
    btnEnd.style.display = "flex";
    
    if (meeting.checkedIn) {
      btnCheckIn.style.display = "none";
      btnExtend.style.display = "flex";
    } else {
      btnCheckIn.style.display = "flex";
      btnExtend.style.display = "none";
    }
  } 
  else {
    // Available
    meetingTitle.textContent = "Ready for Bookings";
    meetingOrg.textContent = "No ongoing sessions";
    
    // Find next upcoming meeting
    const future = getNextUpcomingMeeting();
    if (future) {
      meetingTime.textContent = `Next meeting starts at ${formatTime(future.start)} ("${future.title}")`;
    } else {
      meetingTime.textContent = "No more meetings scheduled for today.";
    }
    
    countdownBox.style.display = "none";
    clearCheckinTimer();
    
    if (bannerText) bannerText.textContent = `Room Available • ${panelState.roomName}`;
    
    // Buttons
    btnBook.style.display = "flex";
    btnCheckIn.style.display = "none";
    btnExtend.style.display = "none";
    btnEnd.style.display = "none";
  }
  
  // Render Upcoming meetings list (up to 5)
  renderScheduleList();
  
  // Render adjacent rooms in modal
  renderAdjacentRooms();
  
  // Update footer info
  const connDot = document.getElementById("footer-connection-dot");
  const connText = document.getElementById("footer-connection-text");
  
  if (panelState.isOnline) {
    connDot.className = "status-indicator online";
    connText.textContent = "Online";
  } else {
    connDot.className = "status-indicator offline";
    connText.textContent = "Offline";
  }
  
  document.getElementById("footer-sync-time").textContent = formatTime(panelState.lastSyncTime);
  document.getElementById("footer-device-name").textContent = panelState.deviceName;
}

function renderScheduleList() {
  const container = document.getElementById("schedule-list");
  container.innerHTML = "";
  
  const now = new Date();
  
  // Filter out ended meetings, sort by start time
  const activeAndFuture = panelState.upcomingMeetings
    .filter(m => m.end > now)
    .sort((a,b) => a.start - b.start);
    
  document.getElementById("schedule-counter").textContent = `${activeAndFuture.length} meetings`;
  
  if (activeAndFuture.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--text-muted); font-size: 13px;">
        No meetings scheduled for the rest of today.
      </div>
    `;
    return;
  }
  
  activeAndFuture.forEach(m => {
    const item = document.createElement("div");
    item.className = "schedule-item";
    
    // Determine status relative to start time
    let dotClass = "available";
    const minsToStart = (m.start - now) / 60000;
    if (minsToStart <= 0) dotClass = "occupied";
    else if (minsToStart <= 15) dotClass = "soon";
    
    item.innerHTML = `
      <div class="schedule-time-box">
        <span class="schedule-start">${formatTime(m.start, false)}</span>
        <span class="schedule-end">${formatTime(m.end, false)}</span>
      </div>
      <div class="schedule-content">
        <span class="schedule-item-title">${m.title}</span>
        <span class="schedule-item-organizer">${m.organizer} &bull; ${m.platform}</span>
      </div>
      <div class="schedule-item-status-dot ${dotClass}"></div>
    `;
    
    container.appendChild(item);
  });
}

function renderAdjacentRooms() {
  const container = document.getElementById("other-rooms-list");
  if (!container) return;
  
  // Mock data of nearby rooms
  const rooms = [
    { name: "Beta meeting room", floor: "Floor 4", cap: "6 Pax", status: "occupied", meta: "Ending in 22 min" },
    { name: "Gamma Boardroom", floor: "Floor 4", cap: "20 Pax", status: "available", meta: "Free all day" },
    { name: "Delta Huddle Room", floor: "Floor 4", cap: "4 Pax", status: "available", meta: "Next at 5:00 PM" },
    { name: "Theta Webinar Studio", floor: "Floor 5", cap: "8 Pax", status: "maintenance", meta: "Closed today" }
  ];
  
  container.innerHTML = "";
  
  rooms.forEach(r => {
    const card = document.createElement("div");
    card.className = "other-room-card";
    
    let statusClass = r.status;
    let badgeText = r.status === "available" ? "Free" : r.status === "occupied" ? "In Use" : "Offline";
    
    card.innerHTML = `
      <div>
        <div class="other-room-name">${r.name}</div>
        <div class="other-room-meta">${r.floor} &bull; ${r.cap} &bull; ${r.meta}</div>
      </div>
      <span class="other-room-status-badge ${statusClass}">${badgeText}</span>
    `;
    
    container.appendChild(card);
  });
}

// --- UTILITY HELPER FUNCTIONS ---
function formatTime(date, showSeconds = true) {
  if (!date) return "--:--";
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: showSeconds ? '2-digit' : undefined,
    hour12: true
  });
}

function formatDate(date) {
  return date.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function getDurationMinutes(start, end) {
  return Math.round((end - start) / 60000);
}

function getNextUpcomingMeeting() {
  const now = new Date();
  const sorted = panelState.upcomingMeetings
    .filter(m => m.start > now)
    .sort((a,b) => a.start - b.start);
  return sorted[0] || null;
}

// Update clock and active countdowns
function updateRealtimeClock() {
  const now = new Date();
  
  // Main header clocks
  document.getElementById("current-time").textContent = formatTime(now);
  document.getElementById("current-date").textContent = formatDate(now);
  
  // Check if we need to countdown
  if (panelState.currentMeeting) {
    const diffMs = panelState.currentMeeting.end - now;
    if (diffMs > 0) {
      const hours = Math.floor(diffMs / 3600000);
      const minutes = Math.floor((diffMs % 3600000) / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);
      
      document.getElementById("countdown-timer").textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
      document.getElementById("countdown-label").textContent = "Time Remaining";
      
      // Auto transition to ending soon if remaining minutes <= 5
      if (minutes < 5 && hours === 0 && panelState.status === "occupied") {
        panelState.status = "ending-soon";
        updateUI();
      }
    } else {
      // Meeting ended!
      evaluateRoomState();
    }
  } else {
    // If not occupied, check if next meeting starts in less than 30 mins, countdown to start
    const next = getNextUpcomingMeeting();
    if (next) {
      const diffMs = next.start - now;
      const minsToStart = diffMs / 60000;
      if (minsToStart <= 30 && diffMs > 0) {
        const minutes = Math.floor(diffMs / 60000);
        const seconds = Math.floor((diffMs % 60000) / 1000);
        
        document.getElementById("countdown-timer").textContent = 
          `00:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById("countdown-label").textContent = "Next Meeting Countdown";
        document.getElementById("countdown-section").style.display = "block";
      } else {
        document.getElementById("countdown-section").style.display = "none";
      }
    } else {
      document.getElementById("countdown-section").style.display = "none";
    }
  }
}

// Update booking popup dynamic helper text
function updateBookTimeSummary() {
  const duration = parseInt(document.getElementById("book-duration").value);
  const now = new Date();
  const end = new Date(now.getTime() + duration * 60 * 1000);
  document.getElementById("booking-time-summary").textContent = `Target Slot: ${formatTime(now, false)} to ${formatTime(end, false)}`;
}

// --- MODAL CONTROLLERS ---
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add("open");
    
    // Modal-specific logic triggers
    if (id === 'book-modal') {
      updateBookTimeSummary();
    } else if (id === 'extend-modal') {
      document.getElementById("extend-conflict-warning").style.display = "none";
    } else if (id === 'qr-modal') {
      const zoomContainer = document.getElementById("zoomed-qr-code");
      zoomContainer.innerHTML = getSVGQRCode(`https://activ.id/room/${panelState.deviceName}`);
    }
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("open");
}

// Close modal when clicking overlay bg
window.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.remove("open");
  }
});

// Toast Notifications popup
function showToast(message, isError = false) {
  let toast = document.createElement("div");
  toast.className = `toast-banner ${isError ? 'error' : ''}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // Trigger animation next frame
  setTimeout(() => toast.classList.add("show"), 10);
  
  // Cleanup after 3.5s
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// Add Toast Styles dynamically
const styleNode = document.createElement("style");
styleNode.textContent = `
  .toast-banner {
    position: fixed;
    top: 24px;
    left: 50%;
    transform: translate(-50%, -40px);
    background: rgba(31, 41, 55, 0.95);
    border: 1px solid rgba(255,255,255,0.1);
    color: #fff;
    padding: 12px 24px;
    border-radius: 40px;
    font-size: 13px;
    font-weight: 600;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    z-index: 9999;
    opacity: 0;
    pointer-events: none;
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s;
  }
  .toast-banner.show {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  .toast-banner.error {
    background: rgba(220, 38, 38, 0.95);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;
document.head.appendChild(styleNode);

// --- SIMULATED MIDDLEWARE API TRIGGERS ---
function notifyAPI(endpoint, payload) {
  console.log(`[API POST] /api/${endpoint}`, payload);
  
  // Heartbeat ping timing refresh
  document.getElementById("debug-ping-time").textContent = "0s ago";
  panelState.lastSyncTime = new Date();
  document.getElementById("footer-sync-time").textContent = formatTime(panelState.lastSyncTime);
  
  // Sync Status display glow flash
  const syncDot = document.getElementById("footer-connection-dot");
  const oldClass = syncDot.className;
  syncDot.className = "status-indicator syncing";
  setTimeout(() => syncDot.className = oldClass, 1000);
}

// --- INTERACTIVE SIMULATOR SIDEBAR FUNCTIONS ---
function toggleSimulator() {
  const sim = document.getElementById("control-simulator");
  sim.classList.toggle("collapsed");
}

function simSetRoomState(state) {
  // If occupied/ending-soon, make sure we have a mockup meeting
  if (state === "occupied" || state === "ending-soon") {
    if (!panelState.currentMeeting) {
      panelState.currentMeeting = {
        id: "sim-meeting",
        title: "Simulator Test Sync",
        organizer: "Admin Tester",
        start: new Date(Date.now()), // starts now
        end: new Date(Date.now() + 30 * 60 * 1000),   // ends in 30m
        platform: "Google Meet",
        checkedIn: true
      };
    }
  } else {
    panelState.currentMeeting = null;
    clearCheckinTimer();
  }
  
  panelState.status = state;
  updateUI();
  saveCache();
  
  // Highlight active badge in simulator
  document.querySelectorAll(".sim-badge").forEach(b => b.classList.remove("active"));
  const btn = Array.from(document.querySelectorAll(".sim-badge")).find(b => b.textContent.toLowerCase() === state.replace('-', ' '));
  if (btn) btn.classList.add("active");
  
  showToast(`Simulator: Force set state to "${state}"`);
}

function simTriggerCheckInWarning() {
  if (!panelState.currentMeeting) {
    // Inject mock occupied meeting first
    simSetRoomState("occupied");
  }
  panelState.currentMeeting.checkedIn = false;
  panelState.status = "occupied";
  updateUI();
  triggerCheckInCountdown(panelState.currentMeeting);
  showToast("Simulator: Triggered Check-in warning countdown.");
}

function simForceCheckInTimeout() {
  if (panelState.checkinActive) {
    handleCheckinTimeout();
  } else {
    showToast("Simulator: Check-in countdown must be active first!", true);
  }
}

function simSetOnline(online) {
  panelState.isOnline = online;
  if (!online) {
    panelState.status = "offline";
    document.getElementById("sim-net-online").classList.remove("active");
    document.getElementById("sim-net-offline").classList.add("active");
    showToast("Simulator: Device Offline (Cache Enabled)");
  } else {
    panelState.status = "available";
    document.getElementById("sim-net-online").classList.add("active");
    document.getElementById("sim-net-offline").classList.remove("active");
    evaluateRoomState();
    showToast("Simulator: Device Online (Middleware Sync Enabled)");
  }
  updateUI();
}

function simUpdateDeviceName(val) {
  panelState.deviceName = val;
  updateUI();
  saveCache();
}

function simUpdateRoomName(val) {
  panelState.roomName = val;
  updateUI();
  saveCache();
}

// --- DISPLAY SCALING CONTROL FUNCTIONS ---
function setPanelResolution(width, height) {
  const container = document.getElementById("kiosk-container");
  
  // Reset inline size styling
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  
  // Calculate target scales
  const parentWidth = window.innerWidth;
  const parentHeight = window.innerHeight;
  
  // Add auto scaling factor
  const scaleX = parentWidth / width;
  const scaleY = parentHeight / height;
  const minScale = Math.min(scaleX, scaleY, 1); // Avoid scaling larger than 1 to prevent blurriness
  
  container.style.setProperty("--scale-factor", minScale);
  showToast(`Resolution Simulator: ${width}x${height} scale factor: ${minScale.toFixed(2)}`);
}

function setPanelOrientation(mode) {
  const container = document.getElementById("kiosk-container");
  if (mode === 'portrait') {
    container.classList.add("portrait-mode");
    container.style.width = "600px";
    container.style.height = "1024px";
  } else {
    container.classList.remove("portrait-mode");
    container.style.width = "1280px";
    container.style.height = "800px";
  }
  resetPanelScaling();
}

function resetPanelScaling() {
  const container = document.getElementById("kiosk-container");
  const isPortrait = container.classList.contains("portrait-mode");
  
  const width = isPortrait ? 600 : 1280;
  const height = isPortrait ? 1024 : 800;
  
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  
  const scaleX = window.innerWidth / width;
  const scaleY = window.innerHeight / height;
  const minScale = Math.min(scaleX, scaleY, 0.95);
  
  container.style.setProperty("--scale-factor", minScale);
}

// --- CRON / HEARTBEAT ENGINE SIMULATIONS ---
function startHeartbeatEngine() {
  // Update real-time clock every second
  setInterval(updateRealtimeClock, 1000);
  
  // Simulation: API Heartbeat ping updates every 60 seconds
  let heartbeatCounter = 0;
  setInterval(() => {
    heartbeatCounter++;
    if (panelState.isOnline) {
      document.getElementById("debug-heartbeat-status").textContent = "Active (" + heartbeatCounter + ")";
      document.getElementById("debug-ping-time").textContent = "0s ago";
      panelState.lastSyncTime = new Date();
      document.getElementById("footer-sync-time").textContent = formatTime(panelState.lastSyncTime);
    }
  }, 60000);

  // Sync Calendar Data every 30 seconds
  setInterval(() => {
    if (panelState.isOnline) {
      evaluateRoomState();
    }
  }, 30000);

  // Auto-update ping timer label in simulator debug console
  let secSincePing = 0;
  setInterval(() => {
    secSincePing++;
    document.getElementById("debug-ping-time").textContent = `${secSincePing}s ago`;
  }, 1000);

  // Handle window resizing scale updates
  window.addEventListener("resize", resetPanelScaling);
}

// --- INITIATE ---
window.addEventListener("DOMContentLoaded", () => {
  generateDefaultSchedule();
  
  // Render mini QR code in widget
  document.getElementById("mini-qr-code").innerHTML = getSVGQRCode(`https://activ.id/room/${panelState.deviceName}`);
  
  updateRealtimeClock();
  startHeartbeatEngine();
  resetPanelScaling();
});
