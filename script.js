/************** CONFIG **************/
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw_lkqKUOWTrA81DcvtRCtU8U3WGt2ggIhzMEYDG_XhT_00UJvzL7cL01LW3wXhh79r8Q/exec';

const EVENT_START_ISO = ''; // e.g., "2025-10-18T18:00:00-07:00"
const EVENT_END_ISO   = '';
const EVENT_TITLE     = 'Officer Darren "D-Love" Johnson Retirement Celebration';
const EVENT_LOCATION  = '';
const EVENT_DETAILS   = 'Join us to celebrate a legacy of service.';

/************** STATE **************/
let rsvpList = [];
const LS_KEY = 'rsvps_cache';

/************** UTIL **************/
const byId = (id)=>document.getElementById(id);
const show = (el)=>{el.classList.remove('hidden');};
const hide = (el)=>{el.classList.add('hidden');};

function toICS(startISO, endISO, title, desc, location){
  const dtStart = startISO.replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  const dtEnd   = (endISO||startISO).replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  const uid = 'retirement-' + Date.now() + '@jaydoo';
  return [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Jaydoo//Retirement//EN','BEGIN:VEVENT',
    'UID:'+uid,'DTSTAMP:'+dtStart,'DTSTART:'+dtStart,'DTEND:'+dtEnd,
    'SUMMARY:'+(title||'Event'),'DESCRIPTION:'+(desc||''),'LOCATION:'+(location||''),
    'END:VEVENT','END:VCALENDAR'
  ].join('\r\n');
}

function downloadICS(){
  if(!EVENT_START_ISO) return;
  const blob = new Blob([toICS(EVENT_START_ISO, EVENT_END_ISO, EVENT_TITLE, EVENT_DETAILS, EVENT_LOCATION)], {type:'text/calendar'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'retirement-event.ics';
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

function googleCalendarLink(){
  if(!EVENT_START_ISO) return '';
  const fmt = (iso)=>iso.replace(/[-:]/g,'').split('.')[0];
  const dates = fmt(EVENT_START_ISO)+'/'+fmt(EVENT_END_ISO||EVENT_START_ISO);
  const params = new URLSearchParams({ action:'TEMPLATE', text:EVENT_TITLE, dates, details:EVENT_DETAILS, location:EVENT_LOCATION });
  return 'https://calendar.google.com/calendar/render?'+params.toString();
}

/************** NAV **************/
async function showPage(e, pageName) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  byId(pageName + '-page').classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (e && e.target) e.target.classList.add('active');
  location.hash = pageName;

  if (pageName === 'rsvp-list') {
    try {
      const server = await loadFromGoogle();
      if (Array.isArray(server)) { rsvpList = server; saveCache(); }
    } catch (_) { /* fall back to cache */ }
    updateRSVPListPage();
  }
}

/************** FORM BEHAVIOR **************/
const attendingSelect = byId('attending');
if (attendingSelect) {
  attendingSelect.addEventListener('change', function () {
    byId('guestGroup').style.display = (this.value === 'yes') ? 'block' : 'none';
  });
}

const rsvpForm = byId('rsvpForm');
if (rsvpForm) {
  rsvpForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (byId('company').value) return; // honeypot

    const fd = new FormData(this);
    if(!fd.get('name') || !fd.get('email') || !fd.get('attending')){
      alert('Please complete required fields.'); return;
    }

    const rsvp = {
      name: fd.get('name').trim(),
      email: fd.get('email').trim(),
      organization: (fd.get('organization')||'').trim(),
      attending: fd.get('attending'),
      guests: fd.get('guests') || '1',
      message: (fd.get('message')||'').trim(),
      timestamp: new Date().toISOString()
    };

    rsvpList.push(rsvp); saveCache(); updateRSVPListPage();

    const success = byId('successMessage'); const err = byId('errorMessage');
    success.style.display = 'block'; err.style.display = 'none';

    if (EVENT_START_ISO){
      const calBox = byId('calendarLinks');
      calBox.innerHTML = `📅 Add to calendar:
        <a href="${googleCalendarLink()}" target="_blank" rel="noopener">Google Calendar</a>
        &middot; <a href="#" id="dlIcsLink">Download .ics</a>`;
      show(calBox);
      byId('dlIcsLink')?.addEventListener('click', (ev)=>{ev.preventDefault(); downloadICS();});
    }

    this.reset(); byId('guestGroup').style.display = 'none';
    setTimeout(() => { success.style.display = 'none'; }, 5000);

    try { await sendToGoogle(rsvp); }
    catch (e) { console.warn('RSVP sync failed:', e);
      err.style.display = 'block'; setTimeout(()=>{err.style.display='none';},7000);
    }
  });
}

/************** GOOGLE APPS SCRIPT I/O **************/
async function sendToGoogle(record){
  const res = await fetch(APPS_SCRIPT_URL, {
    method:'POST', mode:'cors',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({ action:'create', data: record })
  });
  if (!res.ok && res.type !== 'opaque') throw new Error('Non-OK response');
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
    const res = await fetch(APPS_SCRIPT_URL, { method:'GET', mode:'cors' });
    if (!res.ok) {
      const t = await res.text().catch(()=> ''); throw new Error(`HTTP ${res.status} ${res.statusText} — ${t.slice(0,200)}`);
    }
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Response was not an array');
    rsvpList = data; saveCache(); updateRSVPListPage();
    alert('RSVPs refreshed.');
  } catch (e){
    console.warn('Refresh error:', e);
    alert(`Could not refresh from server.\n${String(e).slice(0,200)}`);
  }
}

/************** CACHE **************/
function saveCache(){ try{ localStorage.setItem(LS_KEY, JSON.stringify(rsvpList)); }catch(e){} }
function loadCache(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if (raw){ const arr = JSON.parse(raw); if (Array.isArray(arr)) rsvpList = arr; }
  }catch(e){}
}

/************** LIST/UI **************/
function updateRSVPListPage() {
  const attending = rsvpList.filter(r => r.attending === 'yes');
  const notAttending = rsvpList.filter(r => r.attending === 'no');
  const totalGuests = attending.reduce((s, r) => s + parseInt(r.guests||'1', 10), 0);

  byId('totalResponses').textContent = rsvpList.length;
  byId('attendingCount').textContent = attending.length;
  byId('totalGuests').textContent = totalGuests;
  byId('notAttendingCount').textContent = notAttending.length;

  const details = byId('rsvpDetailsList');
  if (!rsvpList.length) { details.innerHTML = '<p style="text-align:center; color:#666; padding:40px;">No RSVPs received yet.</p>'; return; }

  const order = { yes: 0, maybe: 1, no: 2 };
  const sorted = [...rsvpList].sort((a,b)=> order[a.attending]-order[b.attending]);

  details.innerHTML = sorted.map(r => {
    const statusClass = r.attending === 'yes' ? 'attending' : r.attending === 'no' ? 'not-attending' : 'maybe';
    const statusText = r.attending === 'yes' ? 'Attending' : r.attending === 'no' ? 'Cannot Attend' : 'Maybe';
    const statusBadgeClass = r.attending === 'yes' ? 'status-yes' : r.attending === 'no' ? 'status-no' : 'status-maybe';
    const time = new Date(r.timestamp).toLocaleString();
    return `
      <div class="rsvp-item ${statusClass}">
        <div class="rsvp-header">
          <span class="rsvp-name">${escapeHTML(r.name)}</span>
          <span class="rsvp-status ${statusBadgeClass}">${statusText}</span>
        </div>
        <div style="margin-bottom:10px;">
          <strong>Organization:</strong> ${escapeHTML(r.organization || 'Not specified')}
          ${r.attending === 'yes' ? `<br/><strong>Party Size:</strong> ${escapeHTML(r.guests || '1')} ${(r.guests === '1' || !r.guests) ? 'person' : 'people'}` : ''}
        </div>
        ${r.message ? `<div style="background: rgba(255,255,255,0.7); padding:10px; border-radius:5px; font-style:italic;">"${escapeHTML(r.message)}"</div>` : ''}
        <div style="margin-top:10px; font-size:.9rem; color:#666;">Submitted: ${time}</div>
      </div>`;
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
  a.href = url; a.download = 'rsvps.csv';
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

function copyShare(){
  const url = location.origin + location.pathname + '#rsvp-list';
  navigator.clipboard.writeText(url).then(()=>alert('Share link copied!'));
}

/************** MODAL & GALLERY **************/
function openModal(src) {
  const modal = byId('photoModal'); const modalImg = byId('modalImage');
  modalImg.src = src; modal.style.display = 'block';
}
function closeModal() { byId('photoModal').style.display = 'none'; }

function sgScroll(dir){
  const track = byId('sgTrack'); if(!track) return;
  const cardWidth = track.querySelector('.sg-item')?.getBoundingClientRect().width || 300;
  track.scrollBy({ left: dir * (cardWidth + 12), behavior: 'smooth' });
}

/************** INIT **************/
document.addEventListener('DOMContentLoaded', async function() {
  if (location.hash === '#rsvp-list') showPage({target:document.querySelectorAll('.nav-btn')[1]}, 'rsvp-list');

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

  loadCache();
  updateRSVPListPage();

  try {
    const server = await loadFromGoogle();
    if (Array.isArray(server) && server.length){
      rsvpList = server; saveCache(); updateRSVPListPage();
    }
  } catch (e){ /* offline ok */ }

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
      const now = new Date(); const diff = start - now;
      if (diff <= 0){ countdownEl.textContent = 'Event is happening now or has passed.'; return; }
      const days = Math.floor(diff/86400000);
      const hours = Math.floor((diff%86400000)/3600000);
      const mins = Math.floor((diff%3600000)/60000);
      countdownEl.textContent = `⏳ ${days}d ${hours}h ${mins}m until the celebration`;
    };
    tick(); show(countdownEl); setInterval(tick, 60000);

    const cal = byId('calendarLinks');
    cal.innerHTML = `📅 Add to calendar:
      <a href="${googleCalendarLink()}" target="_blank" rel="noopener">Google Calendar</a>
      &middot; <a href="#" id="dlIcsLinkTop">Download .ics</a>`;
    show(cal);
    byId('dlIcsLinkTop')?.addEventListener('click', (ev)=>{ev.preventDefault(); downloadICS();});
  }
}
