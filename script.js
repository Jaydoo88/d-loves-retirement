/************** CONFIG **************/
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw_lkqKUOWTrA81DcvtRCtU8U3WGt2ggIhzMEYDG_XhT_00UJvzL7cL01LW3wXhh79r8Q/exec';

/* Event (main ceremony) — fill if you want calendar links to appear after RSVP */
const EVENT_START_ISO = ''; // e.g., '2026-05-23T17:00:00'
const EVENT_END_ISO   = ''; // optional
const EVENT_TITLE     = 'Officer Darren "D-Love" Johnson Retirement Celebration';
const EVENT_LOCATION  = 'German American Club of Louisville';
const EVENT_DETAILS   = 'Join us to celebrate a legacy of service.';

/* Golf — fill if you want calendar links to appear on the Golf page */
const GOLF_START_ISO = '';
const GOLF_END_ISO   = '';
const GOLF_TITLE     = 'D-Love Retirement Golf Outing';
const GOLF_COURSE    = '';
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

function escapeHTML(str=''){
  return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

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
function downloadICS(startISO, endISO, title, details, location, filename){
  if(!startISO) return;
  const blob = new Blob([toICS(startISO, endISO, title, details, location)], {type:'text/calendar'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename || 'event.ics';
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}
function googleCalendarLink(startISO, endISO, title, details, location){
  if(!startISO) return '';
  const fmt = (iso)=>iso.replace(/[-:]/g,'').split('.')[0];
  const dates = fmt(startISO)+'/'+fmt(endISO||startISO);
  const params = new URLSearchParams({
    action:'TEMPLATE', text:title||'Event', dates,
    details: details||'', location: location||''
  });
  return 'https://calendar.google.com/calendar/render?'+params.toString();
}

/************** NAV + HASH ROUTING **************/
async function showPage(e, pageName) {
  // normalize to short key (strip trailing -page if present)
  const key = pageName.endsWith('-page') ? pageName.slice(0, -5) : pageName;

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  byId(key + '-page')?.classList.add('active');

  // active chip button (desktop)
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (e && e.target && e.target.classList.contains('nav-btn')) e.target.classList.add('active');

  // update hash
  if (location.hash !== '#' + key) location.hash = key;

  // page-specific loads
  if (key === 'rsvp-list') {
    try {
      const server = await loadFromGoogle();
      if (Array.isArray(server)) { rsvpList = server; saveCache(); }
    } catch (_) {}
    updateRSVPListPage();
  }
  if (key === 'golf') {
    try {
      const server = await loadGolfFromGoogle();
      if (Array.isArray(server)) { golfList = server; saveGolfCache(); }
    } catch (_) {}
    updateGolfPage();
  }
  if (key === 'venue') {
    setTimeout(() => { init3DRing(); }, 200);
  }

  // scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// initial hash route
document.addEventListener('DOMContentLoaded', () => {
  const raw = (location.hash || '').replace('#','').trim();
  const key = raw.endsWith('-page') ? raw.slice(0,-5) : raw;
  if (key && byId(key+'-page')) showPage(null, key);
});

/************** SCROLLING GALLERY (CAROUSEL) **************/
function sgScroll(direction = 1) {
  const track = document.getElementById('sgTrack');
  if (!track) return;
  const item = track.querySelector('.sg-item');
  const gap = 12; // matches CSS gap
  const step = item ? item.getBoundingClientRect().width + gap : 300;
  track.scrollBy({ left: direction * step, behavior: 'smooth' });
}
window.sgScroll = sgScroll;

/************** UNIVERSAL LIGHTBOX (Photo Reel + any image) **************/
document.addEventListener('DOMContentLoaded', () => {
  // Create once
  let lb = document.createElement('div');
  lb.className = 'universal-lb';
  lb.id = 'universalLightbox';
  lb.setAttribute('aria-hidden', 'true');
  lb.innerHTML = `
    <button class="universal-lb-close" aria-label="Close">&times;</button>
    <img src="" alt="Expanded image">
  `;
  document.body.appendChild(lb);

  const img = lb.querySelector('img');
  const closeBtn = lb.querySelector('.universal-lb-close');

  // Global open
  window.openModal = function (src) {
    if (!src) return;
    img.src = src;
    lb.setAttribute('aria-hidden', 'false');
  };

  function closeModal() {
    lb.setAttribute('aria-hidden', 'true');
    img.src = '';
  }
  closeBtn.addEventListener('click', closeModal);
  lb.addEventListener('click', (e) => { if (e.target === lb) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
});

/************** 3D RING + LIGHTBOX (Venue page) **************/
function init3DRing() {
  const ring = document.getElementById('newsletterRing');
  if (!ring) return;

  const imgs = ring.querySelectorAll('img');
  const total = imgs.length || 1;
  const radius = 430;
  const degStep = 360 / total;

  imgs.forEach((img, i) => {
    const ry = degStep * i;
    img.style.setProperty('--ry', ry + 'deg');
    img.style.setProperty('--tz', radius + 'px');
    img.style.transform = `translate(-50%,-50%) rotateY(${ry}deg) translateZ(${radius}px)`;
  });
}
document.addEventListener('DOMContentLoaded', init3DRing);

function initRingLightbox() {
  const ring = document.getElementById('newsletterRing');
  const lb = document.getElementById('ringLightbox');
  const lbImg = lb?.querySelector('img');
  const closeBtn = lb?.querySelector('.ring-lb-close');
  if (!ring || !lb || !lbImg || !closeBtn) return;

  ring.querySelectorAll('img').forEach(img => {
    img.addEventListener('click', () => {
      lbImg.src = img.src;
      lb.setAttribute('aria-hidden', 'false');
    });
  });

  const close = () => lb.setAttribute('aria-hidden', 'true');
  closeBtn.addEventListener('click', close);
  lb.addEventListener('click', (e)=>{ if (e.target === lb) close(); });
  document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') close(); });
}
document.addEventListener('DOMContentLoaded', initRingLightbox);

/************** HOTELS CALLOUT (dismiss + remember) **************/
document.addEventListener('DOMContentLoaded', () => {
  const KEY = 'hotels_callout_dismissed';
  const bar = document.getElementById('hotelsCallout');
  if (!bar) return;

  try { if (localStorage.getItem(KEY) === '1') { bar.style.display = 'none'; return; } } catch(e){}

  const closeBtn = bar.querySelector('.callout-close');
  if (closeBtn){
    closeBtn.addEventListener('click', () => {
      bar.style.display = 'none';
      try { localStorage.setItem(KEY, '1'); } catch(e){}
    });
  }
});

/************** MOBILE NAV TOGGLE **************/
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('mobileMenuBtn');
  const mobileNav = document.getElementById('mobileNav');
  if (!toggleBtn || !mobileNav) return;

  toggleBtn.addEventListener('click', () => {
    const isHidden = mobileNav.getAttribute('aria-hidden') === 'true' || mobileNav.hasAttribute('hidden');
    if (isHidden) {
      mobileNav.setAttribute('aria-hidden', 'false');
      mobileNav.removeAttribute('hidden');
      toggleBtn.setAttribute('aria-expanded', 'true');
    } else {
      mobileNav.setAttribute('aria-hidden', 'true');
      mobileNav.setAttribute('hidden', '');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // closes menu after navigation
  window.closeMobileNav = function () {
    mobileNav.setAttribute('aria-hidden', 'true');
    mobileNav.setAttribute('hidden', '');
    toggleBtn.setAttribute('aria-expanded', 'false');
  };
});

/************** RSVP FORM **************/
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
    if (!fd.get('name') || !fd.get('email') || !fd.get('attending')) {
      alert('Please complete required fields.');
      return;
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

    // Calendar links after a successful RSVP
    if (EVENT_START_ISO){
      const calBox = byId('calendarLinks');
      if (calBox){
        const gLink = googleCalendarLink(EVENT_START_ISO, EVENT_END_ISO, EVENT_TITLE, EVENT_DETAILS, EVENT_LOCATION);
        calBox.innerHTML = `📅 Add to calendar:
          <a href="${gLink}" target="_blank" rel="noopener">Google Calendar</a>
          &middot; <a href="#" id="dlIcsLink">Download .ics</a>`;
        show(calBox);
        byId('dlIcsLink')?.addEventListener('click', (ev)=>{ev.preventDefault();
          downloadICS(EVENT_START_ISO, EVENT_END_ISO, EVENT_TITLE, EVENT_DETAILS, EVENT_LOCATION, 'retirement-event.ics');
        });
      }
    }

    this.reset();
    const gg = byId('guestGroup'); if (gg) gg.style.display = 'none';
    setTimeout(() => { if (success) success.style.display = 'none'; }, 5000);

    try { await sendToGoogle(rsvp); }
    catch (e) {
      console.warn('RSVP sync failed:', e);
      if (err){ err.style.display = 'block'; setTimeout(()=>{err.style.display='none';},7000); }
    }
  });
}

/************** GOLF FORM **************/
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
      email,
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
    setTimeout(()=>{ if (success) success.style.display = 'none'; }, 5000);

    try { await sendGolfToGoogle(record); }
    catch (e) {
      console.warn('Golf sync failed:', e);
      if (err){ err.style.display = 'block'; setTimeout(()=>{err.style.display='none';},7000); }
    }
  });
}

/************** GOOGLE APPS SCRIPT I/O **************/
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
  let arr = [];
  if (Array.isArray(data)) arr = data;
  else if (data && Array.isArray(data.golf)) arr = data.golf;
  const isGolf = (r)=> r && (r.type === 'golf' || 'handicap' in r || 'party_size' in r);
  return (arr || []).filter(isGolf);
}

/************** CACHE **************/
function saveCache(){ try{ localStorage.setItem(LS_KEY, JSON.stringify(rsvpList)); }catch(e){} }
function saveGolfCache(){ try{ localStorage.setItem(GOLF_LS_KEY, JSON.stringify(golfList)); }catch(e){} }
function loadCaches(){
  try {
    const a = JSON.parse(localStorage.getItem(LS_KEY)||'[]');
    if (Array.isArray(a)) rsvpList = a;
  } catch(e){}
  try {
    const b = JSON.parse(localStorage.getItem(GOLF_LS_KEY)||'[]');
    if (Array.isArray(b)) golfList = b;
  } catch(e){}
}
document.addEventListener('DOMContentLoaded', () => {
  loadCaches();
  updateRSVPListPage();
  updateGolfPage();
});

/************** LIST/UI (RSVP & GOLF) **************/
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
  const sorted = [...rsvpList].sort((a,b)=> (order[a.attending]??9) - (order[b.attending]??9) || new Date(b.timestamp) - new Date(a.timestamp));

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
          ${r.attending === 'yes' ? `<br/><strong>Party Size:</strong> ${escapeHTML(r.guests || '1')}` : ''}
        </div>
        ${r.message ? `<div style="background: rgba(255,255,255,0.7); padding:10px; border-radius:5px; font-style:italic;">"${escapeHTML(r.message)}"</div>` : ''}
        <div style="margin-top:10px; font-size:.9rem; color:#666;">Submitted: ${time}</div>
      </div>`;
  }).join('');
}

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

/************** SUMMARY PAGE BUTTONS (RSVP) **************/
async function refreshFromServer(){
  try {
    const data = await loadFromGoogle();
    if (Array.isArray(data)) { rsvpList = data; saveCache(); }
  } catch (e) { console.warn('Refresh RSVPs failed', e); }
  updateRSVPListPage();
}
function exportCSV(){
  const rows = [
    ['name','email','organization','attending','guests','message','timestamp'],
    ...rsvpList.map(r=>[
      r.name, r.email, r.organization||'', r.attending||'',
      r.guests||'1', (r.message||'').replace(/\r?\n/g,' '), r.timestamp
    ])
  ];
  const csv = rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\r\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'rsvps.csv';
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}
function copyShare(){
  const u = new URL(location.href);
  u.hash = 'rsvp-list';
  navigator.clipboard?.writeText(u.toString()).then(()=>{
    alert('Share link copied!');
  }).catch(()=>{ alert('Link: '+u.toString()); });
}

/************** SUMMARY PAGE BUTTONS (GOLF) **************/
async function refreshGolfFromServer(){
  try{
    const data = await loadGolfFromGoogle();
    if (Array.isArray(data)) { golfList = data; saveGolfCache(); }
  }catch(e){ console.warn('Refresh golf failed', e); }
  updateGolfPage();
}
function exportGolfCSV(){
  const rows = [
    ['name','email','handicap','party_size','pairing_pref','notes','timestamp'],
    ...golfList.map(r=>[
      r.name, r.email, r.handicap||'', r.party_size||'1',
      (r.pairing_pref||'').replace(/\r?\n/g,' '),
      (r.notes||'').replace(/\r?\n/g,' '),
      r.timestamp
    ])
  ];
  const csv = rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\r\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'golf_signups.csv';
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}
function copyGolfShare(){
  const u = new URL(location.href);
  u.hash = 'golf';
  navigator.clipboard?.writeText(u.toString()).then(()=>{
    alert('Share link copied!');
  }).catch(()=>{ alert('Link: '+u.toString()); });
}

/************** OPTIONAL: Golf calendar links on Golf page **************/
document.addEventListener('DOMContentLoaded', () => {
  if (!GOLF_START_ISO) return;
  const box = byId('golfCalendarLinks');
  if (!box) return;
  const gLink = googleCalendarLink(GOLF_START_ISO, GOLF_END_ISO, GOLF_TITLE, GOLF_DETAILS, GOLF_COURSE);
  box.innerHTML = `📅 Add to calendar:
    <a href="${gLink}" target="_blank" rel="noopener">Google Calendar</a>
    &middot; <a href="#" id="dlGolfIcs">Download .ics</a>`;
  box.style.display = 'block';
  byId('dlGolfIcs')?.addEventListener('click', (ev)=>{ev.preventDefault();
    downloadICS(GOLF_START_ISO, GOLF_END_ISO, GOLF_TITLE, GOLF_DETAILS, GOLF_COURSE, 'golf-outing.ics');
  });
});

/* ---------- HERO CROSSFADE (2–N images) ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const hero = document.getElementById('retireePhoto');
  if (!hero) return;

  // Put the two (or more) images you want to rotate here:
  const HERO_IMAGES = [
    'assets/dlovek9beginning.jpg',
    'assets/photos/dloveK9.jpg'
  ];

  // If user prefers reduced motion, don’t auto-rotate.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (HERO_IMAGES.length <= 1 || reduceMotion) return;

  // Preload to avoid flicker
  HERO_IMAGES.forEach(src => { const i = new Image(); i.src = src; });

  let idx = 0;
  const DURATION = 5000;   // time each image is shown (ms)
  const FADE = 600;        // keep in sync with CSS transition (ms)

  function nextHero() {
    idx = (idx + 1) % HERO_IMAGES.length;
    // fade out
    hero.style.opacity = '0';
    setTimeout(() => {
      hero.src = HERO_IMAGES[idx];
      // fade back in
      requestAnimationFrame(() => { hero.style.opacity = '1'; });
    }, FADE);
  }

  // ensure we start from the first in the list
  if (hero.src.indexOf(HERO_IMAGES[0]) === -1) {
    hero.src = HERO_IMAGES[0];
  }

  setInterval(nextHero, DURATION);
});
