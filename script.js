/************** CONFIG **************/
// Set your published Apps Script Web App URL here
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw_lkqKUOWTrA81DcvtRCtU8U3WGt2ggIhzMEYDG_XhT_00UJvzL7cL01LW3wXhh79r8Q/exec';

// Optional event datetime for countdown & calendar links:
const EVENT_START_ISO = ''; // e.g., "2025-10-18T18:00:00-07:00"
const EVENT_END_ISO   = ''; // e.g., "2025-10-18T21:00:00-07:00"
const EVENT_TITLE     = 'Officer Darren "D-Love" Johnson Retirement Celebration';
const EVENT_LOCATION  = ''; // e.g., "Ramstein Officers\' Club, Kaiserslautern, Germany"
const EVENT_DETAILS   = 'Join us to celebrate a legacy of service.';

/************** STATE **************/
let rsvpList = []; // unified in-memory list
const LS_KEY = 'rsvps_cache';

/************** UTIL **************/
const byId = (id)=>document.getElementById(id);
const show = (el)=>{el.classList.remove('hidden');};
const hide = (el)=>{el.classList.add('hidden');};

function toICS(startISO, endISO, title, desc, location){
  const dtStart = startISO.replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  const dtEnd   = (endISO||startISO).replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  const uid = 'retirement-' + Date.now() + '@jaydoo';
  const ics = [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Jaydoo//Retirement//EN','BEGIN:VEVENT',
    'UID:'+uid,
    'DTSTAMP:' + dtStart,
    'DTSTART:' + dtStart,
    'DTEND:' + dtEnd,
    'SUMMARY:' + (title||'Event'),
    'DESCRIPTION:' + (desc||''),
    'LOCATION:' + (location||''),
    'END:VEVENT','END:VCALENDAR'
  ].join('\r\n');
  return ics;
}

function downloadICS(){
  if(!EVENT_START_ISO) return;
  const blob = new Blob([toICS(EVENT_START_ISO, EVENT_END_ISO, EVENT_TITLE, EVENT_DETAILS, EVENT_LOCATION)], {type:'text/calendar'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'retirement-event.ics';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function googleCalendarLink(){
  if(!EVENT_START_ISO) return '';
  const fmt = (iso)=>iso.replace(/[-:]/g,'').split('.')[0];
  const dates = fmt(EVENT_START_ISO) + '/' + fmt(EVENT_END_ISO||EVENT_START_ISO);
  const params = new URLSearchParams({
    action:'TEMPLATE',
    text: EVENT_TITLE,
    dates,
    details: EVENT_DETAILS,
    location: EVENT_LOCATION
  });
  return 'https://calendar.google.com/calendar/render?' + params.toString();
}

/************** NAV **************/
async function showPage(e, pageName) {
  // hide/show pages
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  byId(pageName + '-page').classList.add('active');

  // nav button state
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  if (e && e.target) e.target.classList.add('active');

  // deep link
  location.hash = pageName;

  // if opening RSVP list, pull live data first, then render
  if (pageName === 'rsvp-list') {
    try {
      const server = await loadFromGoogle();
      if (Array.isArray(server)) {
        rsvpList = server;
        saveCache();
      }
    } catch (_) {
      // ignore network errors; cache will still show
    }
    updateRSVPListPage();
  }
}

/************** FORM BEHAVIOR **************/
const attendingSelect = byId('attending');
if (attendingSelect) {
  attendingSelect.addEventListener('change', function () {
    const guestGroup = byId('guestGroup');
    guestGroup.style.display = (this.value === 'yes') ? 'block' : 'none';
  });
}

const rsvpForm = byId('rsvpForm');
if (rsvpForm) {
  rsvpForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    // spam honeypot
    if (byId('company').value) return;

    const formData = new FormData(this);
    if(!formData.get('name') || !formData.get('email') || !formData.get('attending')){
      alert('Please complete required fields.');
      return;
    }

    const rsvp = {
      name: formData.get('name').trim(),
      email: formData.get('email').trim(),
      organization: (formData.get('organization')||'').trim(),
      attending: formData.get('attending'),
      guests: formData.get('guests') || '1',
      message: (formData.get('message')||'').trim(),
      timestamp: new Date().toISOString()
    };

    // optimistic local add
    rsvpList.push(rsvp);
    saveCache();
    updateRSVPListPage();

    // show success
    const successMessage = byId('successMessage');
    const errorMessage = byId('errorMessage');
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';

    // calendar helpers after submit
    if (EVENT_START_ISO){
      const calBox = byId('calendarLinks');
      calBox.innerHTML = `
        📅 Add to calendar:
        <a href="${googleCalendarLink()}" target="_blank" rel="noopener">Google Calendar</a>
        &middot;
        <a href="#" id="dlIcsLink">Download .ics</a>
      `;
      show(calBox);
      const dl = byId('dlIcsLink');
      if (dl) dl.addEventListener('click', (ev)=>{ev.preventDefault(); downloadICS();});
    }

    // reset form
    this.reset();
    byId('guestGroup').style.display = 'none';
    setTimeout(() => { successMessage.style.display = 'none'; }, 5000);

    // try to send to Google
    try {
      await sendToGoogle(rsvp);
    } catch (err) {
      console.warn('RSVP sync failed:', err);
      errorMessage.style.display = 'block';
      setTimeout(() => { errorMessage.style.display = 'none'; }, 7000);
    }
  });
}

/************** GOOGLE APPS SCRIPT I/O **************/
async function sendToGoogle(record){
  const res = await fetch(APPS_SCRIPT_URL, {
    method:'POST',
    mode:'cors',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({ action:'create', data: record })
  });
  if (!res.ok && res.type !== 'opaque') {
    throw new Error('Non-OK response');
  }
  return true;
}

async function loadFromGoogle(){
  const res = await fetch(APPS_SCRIPT_URL, { method:'GET', mode:'cors' });
  if (!res.ok) throw new Error('Failed to load RSVPs');
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error('Invalid RSVP payload');
  return data;
}

async function refreshFromServer(){
  try {
    const serverData = await loadFromGoogle();
    rsvpList = serverData;
    saveCache();
    updateRSVPListPage();
    alert('RSVPs refreshed.');
  } catch (e){
    console.warn(e);
    alert('Could not refresh from server.');
  }
}

/************** CACHE **************/
function saveCache(){
  try{ localStorage.setItem(LS_KEY, JSON.stringify(rsvpList)); }catch(e){}
}
function loadCache(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if (raw){
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) rsvpList = arr;
    }
  }catch(e){}
}

/************** LIST/UI **************/
function updateRSVPListPage() {
  const attending = rsvpList.filter(r => r.attending === 'yes');
  const notAttending = rsvpList.filter(r => r.attending === 'no');
  const totalGuests = attending.reduce((sum, r) => sum + parseInt(r.guests||'1', 10), 0);

  byId('totalResponses').textContent = rsvpList.length;
  byId('attendingCount').textContent = attending.length;
  byId('totalGuests').textContent = totalGuests;
  byId('notAttendingCount').textContent = notAttending.length;

  const detailsList = byId('rsvpDetailsList');
  if (rsvpList.length === 0) {
    detailsList.innerHTML = '<p style="text-align:center; color:#666; padding:40px;">No RSVPs received yet.</p>';
    return;
  }

  const order = { yes: 0, maybe: 1, no: 2 };
  const sorted = [...rsvpList].sort((a, b) => order[a.attending] - order[b.attending]);

  detailsList.innerHTML = sorted.map(rsvp => {
    const statusClass = rsvp.attending === 'yes' ? 'attending' : rsvp.attending === 'no' ? 'not-attending' : 'maybe';
    const statusText = rsvp.attending === 'yes' ? 'Attending' : rsvp.attending === 'no' ? 'Cannot Attend' : 'Maybe';
    const statusBadgeClass = rsvp.attending === 'yes' ? 'status-yes' : rsvp.attending === 'no' ? 'status-no' : 'status-maybe';
    const time = new Date(rsvp.timestamp).toLocaleString();

    return `
      <div class="rsvp-item ${statusClass}">
        <div class="rsvp-header">
          <span class="rsvp-name">${escapeHTML(rsvp.name)}</span>
          <span class="rsvp-status ${statusBadgeClass}">${statusText}</span>
        </div>
        <div style="margin-bottom:10px;">
          <strong>Organization:</strong> ${escapeHTML(rsvp.organization || 'Not specified')}
          ${rsvp.attending === 'yes'
            ? `<br/><strong>Party Size:</strong> ${escapeHTML(rsvp.guests || '1')} ${(rsvp.guests === '1' || !rsvp.guests) ? 'person' : 'people'}`
            : ''}
        </div>
        ${rsvp.message
          ? `<div style="background: rgba(255,255,255,0.7); padding:10px; border-radius:5px; font-style:italic;">"${escapeHTML(rsvp.message)}"</div>`
          : ''}
        <div style="margin-top:10px; font-size:.9rem; color:#666;">Submitted: ${time}</div>
      </div>
    `;
  }).join('');
}

function escapeHTML(str=''){
  return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function exportCSV(){
  if (!rsvpList.length){ alert('No data to export.'); return; }
  const headers = ['name','email','organization','attending','guests','message','timestamp'];
  const rows = [headers.join(',')].concat(
    rsvpList.map(r => headers.map(h => {
      const val = (r[h] ?? '').toString().replace(/"/g,'""');
      return `"${val}"`;
    }).join(','))
  );
  const blob = new Blob([rows.join('\r\n')], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'rsvps.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function copyShare(){
  const url = location.origin + location.pathname + '#rsvp-list';
  navigator.clipboard.writeText(url).then(()=>alert('Share link copied!'));
}

/************** MODAL & GALLERY **************/
function openModal(src) {
  const modal = byId('photoModal');
  const modalImg = byId('modalImage');
  modalImg.src = src;
  modal.style.display = 'block';
}
function closeModal() { byId('photoModal').style.display = 'none'; }

function sgScroll(dir){
  const track = byId('sgTrack');
  if(!track) return;
  const cardWidth = track.querySelector('.sg-item')?.getBoundingClientRect().width || 300;
  track.scrollBy({ left: dir * (cardWidth + 12), behavior: 'smooth' });
}

/************** INIT **************/
document.addEventListener('DOMContentLoaded', async function() {
  // Deep link routing
  if (location.hash === '#rsvp-list') showPage({target:document.querySelectorAll('.nav-btn')[1]}, 'rsvp-list');

  // Gallery drag-to-scroll
  const galleryTrack = document.querySelector('.sg-track');
  if (galleryTrack) {
    let isDown = false, startX, scrollLeft;
    galleryTrack.addEventListener('mousedown', (e) => {
      isDown = true; galleryTrack.classList.add('active');
      startX = e.pageX - galleryTrack.offsetLeft; scrollLeft = galleryTrack.scrollLeft;
    });
    ['mouseleave','mouseup'].forEach(ev=>{
      galleryTrack.addEventListener(ev, () => { isDown = false; galleryTrack.classList.remove('active'); });
    });
    galleryTrack.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - galleryTrack.offsetLeft;
      galleryTrack.scrollLeft = scrollLeft - (x - startX) * 2;
    });
  }

  // Hero two-image rotator
  const heroImg = byId('retireePhoto');
  const heroPhotos = ['assets/dlovek9beginning.jpg','assets/dloveK9.jpg'];
  heroPhotos.forEach(src => { const i = new Image(); i.src = src; });
  let heroIndex = 0;
  setInterval(() => {
    heroIndex = (heroIndex + 1) % heroPhotos.length;
    if (heroImg) {
      heroImg.style.opacity = 0;
      setTimeout(() => {
        heroImg.src = heroPhotos[heroIndex];
        heroImg.onload = () => { heroImg.style.opacity = 1; };
      }, 200);
    }
  }, 4000);

  // Load cached RSVPs first
  loadCache();
  updateRSVPListPage();

  // Then try server
  try {
    const server = await loadFromGoogle();
    if (Array.isArray(server) && server.length){
      rsvpList = server;
      saveCache();
      updateRSVPListPage();
    }
  } catch (e){ /* ignore if offline */ }

  // Event info & countdown
  hydrateEventInfo();
});

function hydrateEventInfo(){
  if (EVENT_TITLE) document.title = EVENT_TITLE;
  if (EVENT_LOCATION) byId('eventLocText').textContent = EVENT_LOCATION;

  if (EVENT_START_ISO){
    const start = new Date(EVENT_START_ISO);
    const end = EVENT_END_ISO ? new Date(EVENT_END_ISO) : null;
    byId('eventDateText').textContent = start.toLocaleDateString();
    byId('eventTimeText').textContent = start.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

    const countdownEl = byId('countdown');
    const tick = ()=>{
      const now = new Date();
      const diff = start - now;
      if (diff <= 0){
        countdownEl.textContent = 'Event is happening now or has passed.';
        return;
      }
      const days = Math.floor(diff/86400000);
      const hours = Math.floor((diff%86400000)/3600000);
      const mins = Math.floor((diff%3600000)/60000);
      countdownEl.textContent = `⏳ ${days}d ${hours}h ${mins}m until the celebration`;
    };
    tick(); show(countdownEl);
    setInterval(tick, 60000);

    const cal = byId('calendarLinks');
    cal.innerHTML = `📅 Add to calendar:
      <a href="${googleCalendarLink()}" target="_blank" rel="noopener">Google Calendar</a>
      &middot;
      <a href="#" id="dlIcsLinkTop">Download .ics</a>`;
    show(cal);
    const dlTop = byId('dlIcsLinkTop');
    if (dlTop) dlTop.addEventListener('click', (ev)=>{ev.preventDefault(); downloadICS();});
  }
}
