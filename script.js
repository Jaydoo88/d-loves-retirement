/************** CONFIG **************/
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw_lkqKUOWTrA81DcvtRCtU8U3WGt2ggIhzMEYDG_XhT_00UJvzL7cL01LW3wXhh79r8Q/exec';

const EVENT_START_ISO = '';
const EVENT_END_ISO   = '';
const EVENT_TITLE     = 'Officer Darren "D-Love" Johnson Retirement Celebration';
const EVENT_LOCATION  = '';
const EVENT_DETAILS   = 'Join us to celebrate a legacy of service.';

/************** GOLF CONFIG **************/
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
    } catch (_) {}
    updateRSVPListPage();
  }

  if (pageName === 'golf') {
    try {
      const server = await loadGolfFromGoogle();
      if (Array.isArray(server)) { golfList = server; saveGolfCache(); }
    } catch (_) {}
    updateGolfPage();
  }

  // Always scroll to top when switching pages
  window.scrollTo({ top: 0, behavior: 'smooth' });
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
    if (byId('company')?.value) return;

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
    catch (e) {
      console.warn('RSVP sync failed:', e);
      if (err){ err.style.display = 'block'; setTimeout(()=>{err.style.display='none';},7000); }
    }
  });
}

/************** FORM BEHAVIOR (GOLF) **************/
const golfForm = byId('golfForm');
if (golfForm) {
  golfForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (byId('golfCompany')?.value) return;

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
          ${r.attending === 'yes' ? `<br/><strong>Party Size:</strong> ${escapeHTML(r.guests || '1')}` : ''}
        </div>
        ${r.message ? `<div style="background: rgba(255,255,255,0.7); padding:10px; border-radius:5px; font-style:italic;">"${escapeHTML(r.message)}"</div>` : ''}
        <div style="margin-top:10px; font-size:.9rem; color:#666;">Submitted: ${time}</div>
      </div>`;
  }).join('');
}

function escapeHTML(str=''){
  return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
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
    const isHidden =
      mobileNav.getAttribute('aria-hidden') === 'true' ||
      mobileNav.hasAttribute('hidden');

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
