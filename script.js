/************** CONFIG **************/
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw_lkqKUOWTrA81DcvtRCtU8U3WGt2ggIhzMEYDG_XhT_00UJvzL7cL01LW3wXhh79r8Q/exec';

const EVENT_START_ISO = ''; // e.g., "2025-10-18T18:00:00-07:00"
const EVENT_END_ISO   = '';
const EVENT_TITLE     = 'Officer Darren "D-Love" Johnson Retirement Celebration';
const EVENT_LOCATION  = '';
const EVENT_DETAILS   = 'Join us to celebrate a legacy of service.';

/************** GOLF CONFIG **************/
const GOLF_START_ISO = ''; // e.g., "2025-10-19T08:00:00-07:00"
const GOLF_END_ISO   = '';
const GOLF_TITLE     = 'D-Love Retirement Golf Outing';
const GOLF_COURSE    = ''; // e.g., "Falcon Dunes Golf Course, 15100 W Northern Ave, Waddell, AZ"
const GOLF_FORMAT    = 'Scramble';
const GOLF_DETAILS   = 'Join us for a round to celebrate Darren!';

/************** STATE **************/
let rsvpList = [];
const LS_KEY = 'rsvps_cache';

let golfList = [];
const GOLF_LS_KEY = 'golf_cache';

/************** UTIL **************/
const byId = (id)=>document.getElementById(id);
const show = (el)=>{el?.classList.remove('hidden');};
const hide = (el)=>{el?.classList.add('hidden');};

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
  byId(pageName + '-page')?.classList.add('active');
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

  if (pageName === 'golf') {
    try {
      const server = await loadGolfFromGoogle();
      if (Array.isArray(server)) { golfList = server; saveGolfCache(); }
    } catch (_) { /* fallback to cache */ }
    updateGolfPage();
  }
}

/************** FORM BEHAVIOR (RSVP) **************/
const attendingSelect = byId('attending');
if (attendingSelect) {
  attendingSelect.addEventListener('change', function () {
    const gg = byId('guestGroup');
    if (gg) gg.style.display = (this.value === 'yes') ? 'block' : 'none';
  });
}

const rsvpForm = byId('rsvpForm');
if (rsvpForm) {
  rsvpForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (byId('company')?.value) return; // honeypot

    const fd = new FormData(this);
    if(!fd.get('name') || !fd.get('email') || !fd.get('attending')){
      alert('Please complete required fields.'); return;
    }

    const rsvp = {
      name: (fd.get('name')||'').trim(),
      email: (fd.get('email')||'').trim(),
      organization: (fd.get('organization')||'').trim(),
      attending: fd.get('attending'),
      guests: fd.get('guests') || '1',
      message: (fd.get('message')||'').trim(),
      timestamp: new Date().toISOString()
    };

    rsvpList.push(rsvp); saveCache(); updateRSVPListPage();

    const success = byId('successMessage'); const err = byId('errorMessage');
    if (success && err) { success.style.display = 'block'; err.style.display = 'none'; }

    if (EVENT_START_ISO){
      const calBox = byId('calendarLinks');
      if (calBox){
        calBox.innerHTML = `📅 Add to calendar:
          <a href="${googleCalendarLink()}" target="_blank" rel="noopener">Google Calendar</a>
          &middot; <a href="#" id="dlIcsLink">Download .ics</a>`;
        show(calBox);
        byId('dlIcsLink')?.addEventListener('click', (ev)=>{ev.preventDefault(); downloadICS();});
      }
    }

    this.reset(); const gg = byId('guestGroup'); if (gg) gg.style.display = 'none';
    setTimeout(() => { if (success) success.style.display = 'none'; }, 5000);

    try { await sendToGoogle(rsvp); }
    catch (e) { console.warn('RSVP sync failed:', e);
      if (err){ err.style.display = 'block'; setTimeout(()=>{err.style.display='none';},7000); }
    }
  });
}

/************** FORM BEHAVIOR (GOLF) **************/
const golfForm = byId('golfForm');
if (golfForm) {
  golfForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (byId('golfCompany')?.value) return; // honeypot

    const fd = new FormData(this);
    const name  = (fd.get('name')||'').trim();
    const email = (fd.get('email')||'').trim();
    if (!name || !email) { alert('Please complete required fields.'); return; }

    const record = {
      name,
      email, // stored, but NOT displayed publicly
      handicap: fd.get('handicap') || '',
      party_size: fd.get('party_size') || '1',
      pairing_pref: (fd.get('pairing_pref')||'').trim(),
      notes: (fd.get('notes')||'').trim(),
      timestamp: new Date().toISOString(),
      type: 'golf'
    };

    golfList.push(record); saveGolfCache(); updateGolfPage();

    const success = byId('golfSuccessMessage'); const err = byId('golfErrorMessage');
    if (success && err) { success.style.display = 'block'; err.style.display = 'none'; }
    this.reset();

    if (GOLF_START_ISO) {
      const links = byId('golfCalendarLinks');
      if (links){
        links.innerHTML = `📅 Add to calendar:
          <a href="${googleCalendarLinkGolf()}" target="_blank" rel="noopener">Google Calendar</a>
          &middot; <a href="#" id="golfDlIcsLink">Download .ics</a>`;
        links.style.display = 'block';
        byId('golfDlIcsLink')?.addEventListener('click', (ev)=>{ev.preventDefault(); downloadGolfICS();});
      }
    }

    setTimeout(()=>{ if (success) success.style.display = 'none'; }, 5000);

    try { await sendGolfToGoogle(record); }
    catch (e) { console.warn('Golf sync failed:', e);
      if (err){ err.style.display = 'block'; setTimeout(()=>{err.style.display='none';},7000); }
    }
  });
}

/************** GOOGLE APPS SCRIPT I/O (RSVP) **************/
async function sendToGoogle(record){
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify({ action: 'create', data: record })
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  const data = JSON.parse(text);
  if (!data.ok) throw new Error(data.error || 'Unknown server error');
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

/************** GOOGLE APPS SCRIPT I/O (GOLF) **************/
async function sendGolfToGoogle(record){
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify({ action: 'create', type: 'golf', data: record })
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  const data = JSON.parse(text);
  if (!data.ok) throw new Error(data.error || 'Unknown server error');
  return true;
}

async function loadGolfFromGoogle(){
  const url = APPS_SCRIPT_URL.includes('?') ? APPS_SCRIPT_URL + '&type=golf' : APPS_SCRIPT_URL + '?type=golf';
  const res = await fetch(url, { method:'GET', mode:'cors' });
  if (!res.ok) throw new Error('Failed to load golf sign-ups');
  const data = await res.json();

  // Normalize to an array
  let arr = [];
  if (Array.isArray(data)) arr = data;
  else if (data && Array.isArray(data.golf)) arr = data.golf;

  // Keep only true golf rows (prevents phantom/test items)
  const isGolf = (r)=> r && (r.type === 'golf' || 'handicap' in r || 'party_size' in r);
  return (arr || []).filter(isGolf);
}

async function refreshGolfFromServer(){
  try {
    const data = await loadGolfFromGoogle();
    golfList = data; saveGolfCache(); updateGolfPage();
    alert('Golf sign-ups refreshed.');
  } catch (e){
    console.warn('Golf refresh error:', e);
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

function saveGolfCache(){ try{ localStorage.setItem(GOLF_LS_KEY, JSON.stringify(golfList)); }catch(e){} }
function loadGolfCache(){
  try{
    const raw = localStorage.getItem(GOLF_LS_KEY);
    if (!raw) return;
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return;
    const isGolf = (r)=> r && (r.type === 'golf' || 'handicap' in r || 'party_size' in r);
    golfList = arr.filter(isGolf);
  }catch(e){}
}

/************** LIST/UI (RSVP) **************/
function updateRSVPListPage() {
  const attending = rsvpList.filter(r => r.attending === 'yes');
  const notAttending = rsvpList.filter(r => r.attending === 'no');
  const totalGuests = attending.reduce((s, r) => s + parseInt(r.guests||'1', 10), 0);

  byId('totalResponses')?.replaceChildren(document.createTextNode(rsvpList.length));
  byId('attendingCount')?.replaceChildren(document.createTextNode(attending.length));
  byId('totalGuests')?.replaceChildren(document.createTextNode(totalGuests));
  byId('notAttendingCount')?.replaceChildren(document.createTextNode(notAttending.length));

  const details = byId('rsvpDetailsList');
  if (!details) return;
  if (!rsvpList.length) {
    details.innerHTML = '<p style="text-align:center; color:#666; padding:40px;">No RSVPs received yet.</p>';
    return;
  }

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

/************** LIST/UI (GOLF) **************/
function updateGolfPage(){
  const totalSignups = golfList.length;
  const totalPlayers = golfList.reduce((s, r)=> s + parseInt(r.party_size||'1',10), 0);
  const foursomes = Math.floor(totalPlayers / 4);
  const remainder = totalPlayers % 4;

  byId('golfTotalSignups')?.replaceChildren(document.createTextNode(totalSignups));
  byId('golfTotalPlayers')?.replaceChildren(document.createTextNode(totalPlayers));
  byId('golfFoursomes')?.replaceChildren(document.createTextNode(foursomes));
  byId('golfRemainder')?.replaceChildren(document.createTextNode(remainder));

  const details = byId('golfDetailsList');
  if (!details) return;
  if (!golfList.length){
    details.innerHTML = '<p style="text-align:center; color:#666; padding:40px;">No golf sign-ups yet.</p>';
    return;
  }

  const sorted = [...golfList].sort((a,b)=> new Date(b.timestamp) - new Date(a.timestamp));
  details.innerHTML = sorted.map(r => {
    const time = new Date(r.timestamp).toLocaleString();
    return `
      <div class="rsvp-item golf">
        <div class="rsvp-header">
          <span class="rsvp-name">${escapeHTML(r.name)}</span>
          <span class="rsvp-status status-yes">Registered</span>
        </div>
        <div style="margin-bottom:10px;">
          <strong>Handicap:</strong> ${escapeHTML(r.handicap || '—')}<br/>
          <strong>Party Size:</strong> ${escapeHTML(r.party_size || '1')}
        </div>
        ${r.pairing_pref ? `<div style="background: rgba(255,255,255,0.7); padding:10px; border-radius:5px;"><strong>Pairing Pref:</strong> ${escapeHTML(r.pairing_pref)}</div>` : ''}
        ${r.notes ? `<div style="background: rgba(255,255,255,0.7); padding:10px; border-radius:5px; margin-top:6px;"><strong>Notes:</strong> ${escapeHTML(r.notes)}</div>` : ''}
        <div style="margin-top:10px; font-size:.9rem; color:#666;">Submitted: ${time}</div>
      </div>`;
  }).join('');
}

function exportGolfCSV(){
  if (!golfList.length){ alert('No data to export.'); return; }
  const headers = ['name','email','handicap','party_size','pairing_pref','notes','timestamp'];
  const rows = [headers.join(',')].concat(
    golfList.map(r => headers.map(h => {
      const val = (r[h] ?? '').toString().replace(/"/g,'""');
      return `"${val}"`;
    }).join(','))
  );
  const blob = new Blob([rows.join('\r\n')], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'golf_signups.csv';
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

function copyGolfShare(){
  const url = location.origin + location.pathname + '#golf';
  navigator.clipboard.writeText(url).then(()=>alert('Golf share link copied!'));
}

/************** MODAL & GALLERY **************/
function openModal(src) {
  const modal = byId('photoModal'); const modalImg = byId('modalImage');
  if (!modal || !modalImg) return;
  modalImg.src = src; modal.style.display = 'block';
}
function closeModal() { const m=byId('photoModal'); if (m) m.style.display = 'none'; }

function sgScroll(dir){
  const track = byId('sgTrack'); if(!track) return;
  const cardWidth = track.querySelector('.sg-item')?.getBoundingClientRect().width || 300;
  track.scrollBy({ left: dir * (cardWidth + 12), behavior: 'smooth' });
}

/************** CAL: GOLF HELPERS **************/
function googleCalendarLinkGolf(){
  if(!GOLF_START_ISO) return '';
  const fmt = (iso)=>iso.replace(/[-:]/g,'').split('.')[0];
  const dates = fmt(GOLF_START_ISO)+'/'+fmt(GOLF_END_ISO||GOLF_START_ISO);
  const params = new URLSearchParams({
    action:'TEMPLATE',
    text:GOLF_TITLE,
    dates,
    details:GOLF_DETAILS,
    location:GOLF_COURSE
  });
  return 'https://calendar.google.com/calendar/render?'+params.toString();
}

function downloadGolfICS(){
  if(!GOLF_START_ISO) return;
  const blob = new Blob([toICS(GOLF_START_ISO, GOLF_END_ISO, GOLF_TITLE, GOLF_DETAILS, GOLF_COURSE)], {type:'text/calendar'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'golf-outing.ics';
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

/************** INIT **************/
document.addEventListener('DOMContentLoaded', async function() {
  if (location.hash === '#rsvp-list') showPage({target:document.querySelectorAll('.nav-btn')[1]}, 'rsvp-list');
  if (location.hash === '#golf') showPage({target:document.querySelectorAll('.nav-btn')[2]}, 'golf');

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
  loadGolfCache();
  updateRSVPListPage();
  updateGolfPage();

  try {
    const server = await loadFromGoogle();
    if (Array.isArray(server) && server.length){
      rsvpList = server; saveCache(); updateRSVPListPage();
    }
  } catch (e){ /* offline ok */ }

  try {
    const serverGolf = await loadGolfFromGoogle();
    if (Array.isArray(serverGolf) && serverGolf.length){
      golfList = serverGolf; saveGolfCache(); updateGolfPage();
    }
  } catch (e){ /* offline ok */ }

  hydrateEventInfo();
  hydrateGolfInfo();
});

function hydrateEventInfo(){
  if (EVENT_TITLE) document.title = EVENT_TITLE;
  if (EVENT_LOCATION) byId('eventLocText')?.replaceChildren(document.createTextNode(EVENT_LOCATION));

  if (EVENT_START_ISO){
    const start = new Date(EVENT_START_ISO);
    byId('eventDateText')?.replaceChildren(document.createTextNode(start.toLocaleDateString()));
    byId('eventTimeText')?.replaceChildren(document.createTextNode(start.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})));

    const countdownEl = byId('countdown');
    if (countdownEl){
      const tick = ()=>{
        const now = new Date(); const diff = start - now;
        if (diff <= 0){ countdownEl.textContent = 'Event is happening now or has passed.'; return; }
        const days = Math.floor(diff/86400000);
        const hours = Math.floor((diff%86400000)/3600000);
        const mins = Math.floor((diff%3600000)/60000);
        countdownEl.textContent = `⏳ ${days}d ${hours}h ${mins}m until the celebration`;
      };
      tick(); show(countdownEl); setInterval(tick, 60000);
    }

    const cal = byId('calendarLinks');
    if (cal){
      cal.innerHTML = `📅 Add to calendar:
        <a href="${googleCalendarLink()}" target="_blank" rel="noopener">Google Calendar</a>
        &middot; <a href="#" id="dlIcsLinkTop">Download .ics</a>`;
      show(cal);
      byId('dlIcsLinkTop')?.addEventListener('click', (ev)=>{ev.preventDefault(); downloadICS();});
    }
  }
}

function hydrateGolfInfo(){
  if (GOLF_COURSE) byId('golfCourseText')?.replaceChildren(document.createTextNode(GOLF_COURSE));
  if (GOLF_FORMAT) byId('golfFormatText')?.replaceChildren(document.createTextNode(GOLF_FORMAT));

  if (GOLF_START_ISO){
    const start = new Date(GOLF_START_ISO);
    byId('golfDateText')?.replaceChildren(document.createTextNode(start.toLocaleDateString()));
    byId('golfTimeText')?.replaceChildren(document.createTextNode(start.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})));

    const countdownEl = byId('golfCountdown');
    if (countdownEl){
      const tick = ()=>{
        const now = new Date(); const diff = start - now;
        if (diff <= 0){ countdownEl.textContent = 'Tee time is now or has passed.'; return; }
        const days = Math.floor(diff/86400000);
        const hours = Math.floor((diff%86400000)/3600000);
        const mins = Math.floor((diff%3600000)/60000);
        countdownEl.textContent = `⏳ ${days}d ${hours}h ${mins}m until tee time`;
      };
      tick(); show(countdownEl); setInterval(tick, 60000);
    }

    const links = byId('golfCalendarLinks');
    if (links){
      links.innerHTML = `📅 Add to calendar:
        <a href="${googleCalendarLinkGolf()}" target="_blank" rel="noopener">Google Calendar</a>
        &middot; <a href="#" id="golfDlIcsLinkTop">Download .ics</a>`;
      links.style.display = 'block';
      byId('golfDlIcsLinkTop')?.addEventListener('click', (ev)=>{ev.preventDefault(); downloadGolfICS();});
    }
  }
}

(function () {
  const btn = document.getElementById('mobileMenuBtn');
  const panel = document.getElementById('mobileNav');
  if (!btn || !panel) return;

  function open() {
    panel.hidden = false;
    panel.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
  }
  function close() {
    panel.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
    // use a tiny timeout so attribute change is applied before hiding
    setTimeout(() => { panel.hidden = true; }, 0);
  }
  window.closeMobileNav = close;

  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    expanded ? close() : open();
  });

  // close when clicking outside
  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
      if (btn.getAttribute('aria-expanded') === 'true') close();
    }
  });

  // close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') close();
  });
})();

/************** OPTIONAL: Quick cache reset **************/
function clearLocalCaches(){
  try { localStorage.removeItem(LS_KEY); } catch(e){}
  try { localStorage.removeItem(GOLF_LS_KEY); } catch(e){}
  alert('Local caches cleared. Refresh the page.');
}
