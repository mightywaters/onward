/* Onward — app logic. No accounts, no tracking: everything is saved only on this device. */
(() => {
'use strict';

/* ---------------- storage ---------------- */
const KEY = 'onward.v1';
const blank = () => ({
  onboarded: false,
  profile: { setting: '', dis: [], cause: '', age: 'adult', vet: false, zip: '' },
  done: {}, prio: {}, hidden: {}, custom: [],
  equip: [], team: [], meds: [], questions: [],
  prefs: { size: 'm', theme: 'auto', contrast: 'normal', motion: 'auto' },
  showAll: false
});
let S;
try { S = Object.assign(blank(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = blank(); }
S.profile = Object.assign(blank().profile, S.profile);
S.prefs = Object.assign(blank().prefs, S.prefs);
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const uid = () => Math.random().toString(36).slice(2, 9);

/* ---------------- helpers ---------------- */
const $ = s => document.querySelector(s);
const main = $('#main');
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const say = msg => { const l = $('#live'); l.textContent = ''; setTimeout(() => l.textContent = msg, 50); };
function toast(msg) {
  const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
  document.body.appendChild(t); setTimeout(() => t.remove(), 2600);
}
const telHref = p => 'tel:' + String(p).replace(/[^\d+]/g, '');
const mapsHref = q => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
const searchHref = q => 'https://www.google.com/search?q=' + encodeURIComponent(q);
function titleCase(s) {
  return String(s || '').toLowerCase().replace(/\b([a-z])([a-z']*)/g, (m, a, b) => a.toUpperCase() + b)
    .replace(/\b(Llc|Pllc|Pc|Pa|Md|Do|Lp|Inc|Ii|Iii|Iv|Upmc|Ssm|Va|Nyu|Uab|Pt|Ot|Cpo|Dme)\b/g, m => m.toUpperCase())
    .replace(/, ([A-Za-z]{2}) (\d{5})/, (m, st, z) => ', ' + st.toUpperCase() + ' ' + z);
}
function personName(full) {
  const s = String(full || '');
  if (s.includes(',')) { const [last, rest] = s.split(/,(.+)/); return titleCase((rest || '').trim() + ' ' + last.trim()); }
  return titleCase(s);
}
const fmtPhone = p => { const d = String(p || '').replace(/\D/g, '').replace(/^1(?=\d{10}$)/, ''); return d.length === 10 ? `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}` : (p || ''); };
const miles = (a, b, c, d) => { const r = x => x * Math.PI / 180; const h = Math.sin(r(c - a) / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(r(d - b) / 2) ** 2; return 7917.6 * Math.asin(Math.sqrt(h)); };
const fmtMi = m => m < 10 ? m.toFixed(1) + ' mi' : Math.round(m) + ' mi';
const disLabel = id => (DISABILITIES.find(d => d.id === id) || {}).label || id;
const setLabel = id => (SETTINGS.find(s => s.id === id) || {}).label || 'Not set';

/* ---------------- preferences ---------------- */
function applyPrefs() {
  const r = document.documentElement;
  r.dataset.size = S.prefs.size;
  if (S.prefs.theme === 'auto') delete r.dataset.theme; else r.dataset.theme = S.prefs.theme;
  r.dataset.contrast = S.prefs.contrast;
  if (S.prefs.motion === 'reduce') r.dataset.motion = 'reduce'; else delete r.dataset.motion;
}
applyPrefs();
$('#sizeBtn').addEventListener('click', () => {
  S.prefs.size = { m: 'l', l: 'xl', xl: 'm' }[S.prefs.size] || 'm'; save(); applyPrefs();
  toast({ m: 'Text size: normal', l: 'Text size: large', xl: 'Text size: extra large' }[S.prefs.size]);
});

/* ---------------- relevance ---------------- */
function disMatch(list) {
  const mine = S.profile.dis;
  if (S.showAll || !list || !mine.length || mine.includes('unsure')) return true;
  return list.some(d => mine.includes(d));
}
function relItem(it) {
  if (S.showAll) return true;
  if (it.vet && !S.profile.vet) return false;
  if (it.age && it.age !== S.profile.age) return false;
  return disMatch(it.d);
}
function relStep(st) {
  if (st.vet && !S.profile.vet) return false;
  if (st.age && st.age !== S.profile.age) return false;
  if (st.s && S.profile.setting && !st.s.includes(S.profile.setting)) return false;
  if (st.acc && S.profile.cause === 'illness') return false;
  if (st.d && S.profile.dis.length && !S.profile.dis.includes('unsure') && !st.d.some(d => S.profile.dis.includes(d))) return false;
  return true;
}
function mySteps() {
  const base = STEPS.filter(relStep).map(s => Object.assign({}, s));
  const all = base.concat(S.custom.map(c => Object.assign({ custom: true }, c)));
  const order = { now: 0, soon: 1, later: 2 };
  return all.filter(s => !S.hidden[s.id]).map(s => { s.p = S.prio[s.id] || s.p; s.done = !!S.done[s.id]; return s; })
    .sort((a, b) => (a.done - b.done) || (order[a.p] - order[b.p]));
}

/* ---------------- zip codes & distance ---------------- */
const zipFiles = {};
let zip3idx = null;
const loadDigit = d => zipFiles[d] || (zipFiles[d] = fetch('zips' + d + '.json').then(r => { if (!r.ok) throw 0; return r.json(); }));
const loadIdx = () => zip3idx ? Promise.resolve(zip3idx) : fetch('zip3index.json').then(r => r.json()).then(j => zip3idx = j);
async function lookupZip(z) {
  if (!/^\d{5}$/.test(z)) return null;
  const f = await loadDigit(z[0]);
  return f[z] || null;
}
async function zipPatterns(lat, lng, R) {
  const idx = await loadIdx();
  const cands = Object.keys(idx).filter(p => miles(lat, lng, idx[p][0], idx[p][1]) - idx[p][2] <= R);
  if (R >= 50) return cands.map(p => p + '*');
  const digits = [...new Set(cands.map(p => p[0]))];
  const files = await Promise.all(digits.map(loadDigit));
  const all = Object.assign({}, ...files);
  const out = [];
  for (const p of cands) {
    const zs = Object.keys(all).filter(z => z.startsWith(p));
    const inside = zs.filter(z => miles(lat, lng, all[z][0], all[z][1]) <= R);
    if (!inside.length) continue;
    if (inside.length === zs.length) { out.push(p + '*'); continue; }
    const by4 = {};
    zs.forEach(z => { (by4[z.slice(0, 4)] = by4[z.slice(0, 4)] || []).push(z); });
    for (const p4 in by4) {
      const ins = by4[p4].filter(z => inside.includes(z));
      if (!ins.length) continue;
      if (ins.length === by4[p4].length) out.push(p4 + '*'); else ins.forEach(z => out.push(z + '*'));
    }
  }
  return out;
}
async function zipCoordsFor(zips) {
  const need = [...new Set(zips.map(z => z[0]))];
  const files = await Promise.all(need.map(d => loadDigit(d).catch(() => ({}))));
  return Object.assign({}, ...files);
}

/* ---------------- provider registry search (NLM Clinical Tables / NPPES) ---------------- */
const API = 'https://clinicaltables.nlm.nih.gov/api/';
async function registryQuery(kind, codes, patterns) {
  const chunks = [];
  for (let i = 0; i < patterns.length; i += 90) chunks.push(patterns.slice(i, i + 90));
  const tax = codes.map(c => 'licenses.taxonomy.code:' + c).join(' OR ');
  const reqs = chunks.map(ch => {
    const q = '(' + ch.map(p => 'addr_practice.zip:' + p).join(' OR ') + ') AND (' + tax + ')';
    const url = API + 'npi_' + kind + '/v3/search?terms=US&sf=addr_practice.country&count=500&df=NPI,name.full,provider_type,addr_practice.full,addr_practice.phone,addr_practice.zip&q=' + encodeURIComponent(q);
    return fetch(url).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  });
  const res = await Promise.all(reqs);
  const rows = [];
  res.forEach(j => (j[3] || []).forEach(r => rows.push({ npi: r[0], name: r[1], type: r[2], addr: r[3], phone: r[4], zip: String(r[5] || '').slice(0, 5) })));
  return rows;
}
async function searchCare(cat, zip, onProgress) {
  const me = await lookupZip(zip);
  if (!me) throw new Error('zip');
  const radii = [5, 10, 25, 50, 100, 200].filter(r => r >= (cat.startR || 10));
  let found = [], usedR = radii[0];
  for (const R of radii) {
    usedR = R;
    onProgress && onProgress(`Searching within ${R} miles…`);
    const pats = await zipPatterns(me[0], me[1], R);
    if (!pats.length) continue;
    const rows = await registryQuery(cat.kind, cat.codes, pats);
    const coords = await zipCoordsFor(rows.map(r => r.zip).filter(Boolean));
    const seen = new Set();
    found = [];
    rows.forEach(r => {
      const c = coords[r.zip]; if (!c) return;
      const key = cat.kind === 'org' ? (r.name + '|' + r.addr).toLowerCase() : r.npi;
      if (seen.has(key)) return; seen.add(key);
      const dmi = miles(me[0], me[1], c[0], c[1]);
      if (dmi <= R) found.push(Object.assign(r, { mi: dmi, kind: cat.kind }));
    });
    if (found.length >= 12) break;
  }
  found.sort((a, b) => a.mi - b.mi);
  return { me, R: usedR, results: found.slice(0, 40) };
}

/* ---------------- voice input (where supported) ---------------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const NUMW = { zero: 0, oh: 0, o: 0, one: 1, two: 2, to: 2, too: 2, three: 3, four: 4, for: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9 };
function micButton(targetId, digits) {
  if (!SR) return '';
  return `<button type="button" class="iconbtn" data-mic="${targetId}" data-digits="${digits ? 1 : 0}" aria-label="Speak instead of typing">🎤</button>`;
}
function wireMics(root) {
  root.querySelectorAll('[data-mic]').forEach(b => b.addEventListener('click', () => {
    const inp = document.getElementById(b.dataset.mic); if (!inp || !SR) return;
    const rec = new SR(); rec.lang = 'en-US'; rec.interimResults = false;
    b.textContent = '⏺'; say('Listening');
    rec.onresult = e => {
      let t = e.results[0][0].transcript;
      if (b.dataset.digits === '1') t = t.toLowerCase().split(/[\s-]+/).map(w => (w in NUMW ? NUMW[w] : w)).join('').replace(/\D/g, '').slice(0, 5);
      inp.value = t; inp.dispatchEvent(new Event('input')); inp.focus();
    };
    rec.onend = () => { b.textContent = '🎤'; };
    rec.onerror = () => { b.textContent = '🎤'; toast('Could not hear that. Please try again.'); };
    rec.start();
  }));
}

/* ---------------- shared bits ---------------- */
const back = (href, label) => `<p class="back no-print"><a class="btn secondary small" href="${href}">← ${esc(label || 'Back')}</a></p>`;
function emergencyBanner() {
  const sci = S.profile.dis.includes('sci');
  return `<div class="banner" role="note"><span class="ico" aria-hidden="true">🆘</span><div>
    <b>In danger? Call <a href="tel:911">911</a>.</b> In crisis? Call or text <a href="tel:988">988</a>.
    ${sci ? '<br><a href="#/urgent">Spinal cord injury warning signs (autonomic dysreflexia) →</a>' : '<br><a href="#/urgent">Urgent help & warning signs →</a>'}
  </div></div>`;
}
function resultCard(r, catId) {
  const nm = catId === 'idv' ? personName(r.name) : titleCase(r.name);
  const addr = titleCase(r.addr);
  const id = 'r' + r.npi;
  return `<article class="card result">
    <h3>${esc(nm)}</h3>
    <div class="meta"><span class="dist">${fmtMi(r.mi)}</span> · Listed as: ${esc(r.type)}</div>
    <p>${esc(addr)}${r.phone ? '<br>' + esc(fmtPhone(r.phone)) : ''}</p>
    <div class="acts">
      ${r.phone ? `<a class="btn small" href="${telHref(r.phone)}">📞 Call</a>` : ''}
      <a class="btn small secondary" href="${mapsHref(nm + ', ' + addr)}" target="_blank" rel="noopener">🗺️ Directions</a>
      <button class="btn small secondary" data-save="${esc(id)}">＋ Save to care team</button>
    </div></article>`;
}

/* ---------------- views ---------------- */
const V = {};

/* ----- Setup / onboarding ----- */
V.setup = (step) => {
  step = +step || 1;
  const total = 5, p = S.profile;
  const nav = (canNext = true) => `<div class="inputrow" style="margin-top:18px">
      ${step > 1 ? `<a class="btn secondary" href="#/setup/${step - 1}">← Back</a>` : ''}
      <a class="btn" style="flex:1" href="${step < total ? '#/setup/' + (step + 1) : '#/done'}">${step < total ? 'Next →' : 'Finish'}</a>
    </div>
    <p style="text-align:center;margin-top:12px"><a href="${step < total ? '#/setup/' + (step + 1) : '#/done'}">Skip this question</a></p>`;
  let body = '';
  if (step === 1) {
    body = `<h1 class="serif">Where are you right now?</h1><p class="muted">Your next steps are different in each place. You can change this any time.</p>
      <div class="list" role="group" aria-label="Where are you">${SETTINGS.map(s => `<button class="choice" data-setting="${s.id}" aria-pressed="${p.setting === s.id}"><span class="ico" aria-hidden="true">${s.icon}</span>${esc(s.label)}</button>`).join('')}</div>`;
  } else if (step === 2) {
    body = `<h1 class="serif">What is your disability?</h1><p class="muted">Pick all that apply. We'll show only what fits. Choose "Not sure yet" to see everything.</p>
      <div class="chips" role="group" aria-label="Disability">${DISABILITIES.map(d => `<button class="chip" data-dis="${d.id}" aria-pressed="${p.dis.includes(d.id)}">${esc(d.label)}</button>`).join('')}</div>`;
  } else if (step === 3) {
    body = `<h1 class="serif">How did it happen?</h1><p class="muted">This helps with things like legal deadlines. It is optional.</p>
      <div class="list" role="group">${[['accident', '🚗', 'An accident or injury'], ['illness', '🩺', 'An illness or diagnosis'], ['none', '🤐', "I'd rather not say"]].map(c => `<button class="choice" data-cause="${c[0]}" aria-pressed="${p.cause === c[0]}"><span class="ico" aria-hidden="true">${c[1]}</span>${c[2]}</button>`).join('')}</div>`;
  } else if (step === 4) {
    body = `<h1 class="serif">A little about you</h1>
      <h2>Age</h2><div class="list" role="group" aria-label="Age">${[['adult', '18 to 64'], ['kid', 'Under 18 (I am a parent or guardian)'], ['senior', '65 or older']].map(a => `<button class="choice" data-age="${a[0]}" aria-pressed="${p.age === a[0]}">${a[1]}</button>`).join('')}</div>
      <h2 style="margin-top:18px">Are you a military veteran?</h2><div class="list" role="group" aria-label="Veteran">
      <button class="choice" data-vet="1" aria-pressed="${p.vet}">Yes</button><button class="choice" data-vet="0" aria-pressed="${!p.vet}">No</button></div>`;
  } else {
    body = `<h1 class="serif">What is your zip code?</h1><p class="muted">Used only on this phone to find care near you. Use the zip where you'll live after discharge, or where you are now.</p>
      <label class="field" for="zipIn">Zip code</label>
      <div class="inputrow"><input id="zipIn" type="text" inputmode="numeric" autocomplete="postal-code" maxlength="5" pattern="[0-9]*" value="${esc(p.zip)}">${micButton('zipIn', true)}</div>
      <p id="zipMsg" class="muted" aria-live="polite"></p>`;
  }
  main.innerHTML = `<p class="muted">Question ${step} of ${total}</p><div class="progress" aria-hidden="true"><i style="width:${step / total * 100}%"></i></div><div style="height:16px"></div>${body}${nav()}`;
  main.querySelectorAll('[data-setting]').forEach(b => b.onclick = () => { p.setting = b.dataset.setting; save(); location.hash = '#/setup/2'; });
  main.querySelectorAll('[data-dis]').forEach(b => b.onclick = () => {
    const id = b.dataset.dis, i = p.dis.indexOf(id);
    if (i >= 0) p.dis.splice(i, 1); else p.dis.push(id);
    b.setAttribute('aria-pressed', i < 0); save();
  });
  main.querySelectorAll('[data-cause]').forEach(b => b.onclick = () => { p.cause = b.dataset.cause; save(); location.hash = '#/setup/4'; });
  main.querySelectorAll('[data-age]').forEach(b => b.onclick = () => { p.age = b.dataset.age; save(); main.querySelectorAll('[data-age]').forEach(x => x.setAttribute('aria-pressed', x === b)); });
  main.querySelectorAll('[data-vet]').forEach(b => b.onclick = () => { p.vet = b.dataset.vet === '1'; save(); main.querySelectorAll('[data-vet]').forEach(x => x.setAttribute('aria-pressed', x === b)); });
  const zi = $('#zipIn');
  if (zi) {
    const check = async () => {
      const v = zi.value.replace(/\D/g, '').slice(0, 5); zi.value = v;
      if (v.length === 5) { const z = await lookupZip(v).catch(() => null); $('#zipMsg').textContent = z ? `✓ ${z[2]}, ${z[3]}` : 'We could not find that zip code.'; if (z) { p.zip = v; save(); } }
      else $('#zipMsg').textContent = '';
    };
    zi.addEventListener('input', check); check(); wireMics(main);
  }
};
V.done = () => { S.onboarded = true; save(); location.hash = '#/home'; };

/* ----- Welcome ----- */
V.welcome = () => {
  main.innerHTML = `<section class="hero">
    <h1 class="serif">Onward <small>(beta)</small></h1>
    <p class="tagline serif">A new road.<br>You don't have to map it alone.</p>
    <p>For adults who are newly disabled — and the people helping them. Find care near you, see only the resources that fit your situation, and keep track of what to do next.</p>
    <p class="muted">No account. Nothing leaves your phone except the searches you run.</p>
    <a class="btn block" href="#/setup/1">Get started (5 quick questions)</a>
    <div style="height:12px"></div>
    <button class="btn secondary block" id="skipAll">Just let me look around</button>
  </section>${emergencyBanner()}`;
  $('#skipAll').onclick = () => { S.onboarded = true; save(); location.hash = '#/home'; };
};

/* ----- Home ----- */
V.home = () => {
  const steps = mySteps(), open = steps.filter(s => !s.done), doneN = steps.length - open.length;
  const next = open.slice(0, 3);
  const p = S.profile;
  const tiles = [
    ['#/care', '📍', 'Find care near me'], ['#/resources', '📚', 'Resources for me'], ['#/plan/steps', '✅', 'My next steps'],
    ['#/plan/equip', '🦽', 'My equipment'], ['#/plan/team', '👥', 'My care team'], ['#/meds', '💊', 'Look up a medicine'],
    ['#/resources/community', '🤝', 'Wheelchair community'], ['#/resources/national', '🧾', 'Benefits & money'], ['#/resources/work', '💼', 'Work & recovery'],
    ['#/resources/activity', '🏋️', 'Exercise'], ['#/resources/nervepain', '⚡', 'Nerve pain'], ['#/resources/uti', '💧', 'Bladder & UTIs'],
    ['#/resources/weight', '🥗', 'Weight & nutrition'], ['#/resources/sexual', '❤️', 'Sexual health'], ['#/urgent', '🆘', 'Urgent help']
  ];
  main.innerHTML = `
    <h1 class="serif">Hello. One thing at a time.</h1>
    <p class="muted">${esc(setLabel(p.setting))}${p.dis.length ? ' · ' + esc(p.dis.map(disLabel).join(', ')) : ''}${p.zip ? ' · ' + esc(p.zip) : ''} <a href="#/settings">Change</a></p>
    ${emergencyBanner()}
    <section class="card" aria-labelledby="nextH">
      <h2 id="nextH">Your next steps</h2>
      <div class="progress" role="progressbar" aria-label="Steps done" aria-valuemin="0" aria-valuemax="${steps.length}" aria-valuenow="${doneN}"><i style="width:${steps.length ? doneN / steps.length * 100 : 0}%"></i></div>
      <p class="muted">${doneN} of ${steps.length} done</p>
      <div class="list">${next.map(s => stepRow(s).replace('class="card step', 'class="card step compact')).join('') || '<p>All caught up. 🎉</p>'}</div>
      <p><a class="btn secondary block" href="#/plan/steps">See my whole plan</a></p>
    </section>
    <div class="grid wide">${tiles.map(t => `<a class="tile" href="${t[0]}"><span class="ico" aria-hidden="true">${t[1]}</span>${t[2]}</a>`).join('')}</div>
    <p class="foot">Onward shares information, not medical or legal advice. Always check with your care team. Provider listings come from the national NPI registry and are not endorsements — call to confirm.</p>`;
  wireSteps(main);
};

/* ----- Urgent ----- */
V.urgent = () => {
  const sci = S.profile.dis.includes('sci') || S.showAll || !S.profile.dis.length;
  main.innerHTML = back('#/home', 'Home') + `<h1 class="serif">Urgent help</h1>
    <div class="list">
      <a class="row-btn" href="tel:911"><span class="ico">🚑</span><span class="txt"><b>Call 911</b><span>Emergency: trouble breathing, chest pain, a fall with injury, signs of stroke.</span></span></a>
      <a class="row-btn" href="tel:988"><span class="ico">💚</span><span class="txt"><b>Call or text 988</b><span>Suicide & Crisis Lifeline — any time, for you or someone you love.</span></span></a>
      <a class="row-btn" href="tel:18002221222"><span class="ico">☎️</span><span class="txt"><b>Poison Control: 1-800-222-1222</b><span>Took too much medicine or the wrong one.</span></span></a>
      <a class="row-btn" href="tel:18006624357"><span class="ico">🤝</span><span class="txt"><b>SAMHSA Helpline: 1-800-662-4357</b><span>Free, confidential help for alcohol or drug use, 24/7.</span></span></a>
    </div>
    ${sci ? `<section class="card" style="margin-top:16px"><h2>Spinal cord injury at T6 or above: autonomic dysreflexia</h2>
      <p>A sudden pounding headache, flushed or sweaty skin above the injury, stuffy nose, or a sudden rise in blood pressure can be <b>autonomic dysreflexia</b> — a medical emergency.</p>
      <p>Common first steps your care team may teach you: sit up and lower the legs, loosen anything tight, and check for a full bladder or blocked catheter, bowel problems, or skin pressure. <b>If it does not go away quickly, call 911</b> and tell them you have a spinal cord injury.</p>
      <p><a href="https://msktc.org/sci/factsheets/autonomic-dysreflexia" target="_blank" rel="noopener">Read the full fact sheet (MSKTC) ↗</a></p>
      <p class="muted">Ask your doctor for a wallet card to show emergency staff.</p></section>` : ''}
    <section class="card"><h2>Call your doctor soon if you notice</h2>
      <p>A red or dark spot on the skin that doesn't fade, fever or cloudy/bad-smelling urine, new weakness or numbness, a swollen, warm or painful leg, or feeling very hopeless.</p></section>`;
};

/* ----- Find care ----- */
V.care = (id) => {
  if (id) return V.careCat(id);
  const order = c => (c.d && !disMatch(c.d)) ? 1 : 0;
  const cats = CARE.slice().sort((a, b) => order(a) - order(b));
  main.innerHTML = `<h1 class="serif">Find care near you</h1>
    ${zipBox()}
    <div class="list">${cats.map(c => `<a class="row-btn" href="#/care/${c.id}"><span class="ico" aria-hidden="true">${c.icon}</span><span class="txt"><b>${esc(c.title)}</b><span>${esc(c.desc)}</span></span><span class="chev" aria-hidden="true">›</span></a>`).join('')}</div>
    <p class="foot">Listings come from the national NPI provider registry (CMS, via the National Library of Medicine). Registry details can be out of date, so call before you go. For quality ratings, use <a href="https://www.medicare.gov/care-compare/" target="_blank" rel="noopener">Medicare Care Compare</a>.</p>`;
  wireZipBox();
};
function zipBox() {
  return `<div class="card"><label class="field" for="careZip">Search near zip code</label>
    <div class="inputrow"><input id="careZip" type="text" inputmode="numeric" maxlength="5" pattern="[0-9]*" autocomplete="postal-code" value="${esc(S.profile.zip)}">${micButton('careZip', true)}</div>
    <p id="careZipMsg" class="muted" aria-live="polite"></p></div>`;
}
function wireZipBox() {
  const zi = $('#careZip'); if (!zi) return;
  const check = async () => {
    const v = zi.value.replace(/\D/g, '').slice(0, 5); zi.value = v;
    if (v.length === 5) { const z = await lookupZip(v).catch(() => null); $('#careZipMsg').textContent = z ? `Near ${z[2]}, ${z[3]}` : 'We could not find that zip code.'; if (z && v !== S.profile.zip) { S.profile.zip = v; save(); } }
    else $('#careZipMsg').textContent = 'Enter a 5-digit zip code.';
  };
  zi.addEventListener('input', check); check(); wireMics(main);
}
V.careCat = async (id) => {
  const cat = CARE.find(c => c.id === id); if (!cat) return V.care();
  const zip = S.profile.zip;
  main.innerHTML = back('#/care', 'All care types') + `<h1 class="serif">${cat.icon} ${esc(cat.title)}</h1><p class="muted">${esc(cat.desc)}</p>${zipBox()}<div id="careOut"></div>`;
  wireZipBox();
  $('#careZip').addEventListener('change', () => V.careCat(id));
  $('#careZip').addEventListener('input', e => { if (e.target.value.length === 5) setTimeout(() => { if (location.hash === '#/care/' + id) V.careCat(id); }, 400); });
  const out = $('#careOut');
  if (!/^\d{5}$/.test(zip)) { out.innerHTML = '<p>Enter your zip code above to search.</p>'; return; }
  let curatedHTML = '';
  const me = await lookupZip(zip).catch(() => null);
  if (cat.curated && me) {
    const list = SCIMS.map(s => Object.assign({ mi: miles(me[0], me[1], s.ll[0], s.ll[1]) }, s)).sort((a, b) => a.mi - b.mi);
    curatedHTML = `<section aria-labelledby="scimsH"><h2 id="scimsH">SCI Model System centers (closest first)</h2>
      <p class="muted">14 centers chosen by the federal government for expert spinal cord injury care and research (2026 list). Many people travel to one for rehab or yearly check-ups.</p>
      ${list.slice(0, 5).map(s => `<article class="card result"><h3>${esc(s.n)}</h3><div class="meta"><span class="dist">${fmtMi(s.mi)}</span> · ${esc(s.c)}</div>
        <div class="acts">${s.ph ? `<a class="btn small" href="${telHref(s.ph)}">📞 ${esc(s.ph)}</a>` : ''}<a class="btn small secondary" href="${esc(s.w)}" target="_blank" rel="noopener">Website ↗</a>
        <button class="btn small secondary" data-savec="${esc(s.n)}|${esc(s.ph)}">＋ Save</button></div></article>`).join('')}
      <details class="card"><summary>Show all 14 centers</summary>${list.slice(5).map(s => `<p><b>${esc(s.n)}</b><br>${fmtMi(s.mi)} · ${esc(s.c)} ${s.ph ? '· <a href="' + telHref(s.ph) + '">' + esc(s.ph) + '</a>' : ''} · <a href="${esc(s.w)}" target="_blank" rel="noopener">Website</a></p>`).join('')}</details>
      ${S.profile.vet ? '<p><a class="btn secondary block" href="https://www.sci.va.gov" target="_blank" rel="noopener">Veterans: VA Spinal Cord Injury centers ↗</a></p>' : ''}
      <h2 style="margin-top:20px">Spinal cord injury doctors near you</h2></section>`;
  }
  out.innerHTML = curatedHTML + `<p id="careStatus" role="status"><span class="spinner" aria-hidden="true"></span> Searching…</p><div id="careList"></div>`;
  wireSave(out, []);
  try {
    const res = await searchCare(cat, zip, m => { const s = $('#careStatus'); if (s) s.innerHTML = '<span class="spinner" aria-hidden="true"></span> ' + esc(m); });
    if (location.hash !== '#/care/' + id) return;
    const st = $('#careStatus');
    if (!res.results.length) { st.textContent = `No listings found within ${res.R} miles.`; }
    else { st.textContent = `${res.results.length} closest within ${res.R} miles of ${res.me[2]}, ${res.me[3]}.`; say(st.textContent); }
    $('#careList').innerHTML = res.results.map(r => resultCard(r, cat.kind === 'org' ? 'org' : 'idv')).join('') + moreLinks(cat, res.me);
    wireSave($('#careList'), res.results);
  } catch (e) {
    const st = $('#careStatus');
    if (st) st.innerHTML = e.message === 'zip' ? 'We could not find that zip code.' : 'The search service did not answer. Check your connection, or try the links below.';
    const z = await lookupZip(zip).catch(() => null);
    $('#careList').innerHTML = moreLinks(cat, z);
  }
};
function moreLinks(cat, me) {
  const where = me ? `${me[2]}, ${me[3]} ${S.profile.zip}` : S.profile.zip;
  const q = (cat.maps || cat.title) + ' near ' + where;
  return `<section class="card"><h2>Also try</h2><div class="list">
    <a class="row-btn" href="${mapsHref(q)}" target="_blank" rel="noopener"><span class="ico">🗺️</span><span class="txt"><b>Search Google Maps</b><span>${esc(q)}</span></span><span class="chev">↗</span></a>
    <a class="row-btn" href="https://www.medicare.gov/care-compare/" target="_blank" rel="noopener"><span class="ico">⭐</span><span class="txt"><b>Medicare Care Compare</b><span>Quality ratings for doctors, rehab hospitals, nursing homes and home health.</span></span><span class="chev">↗</span></a>
  </div></section>`;
}
function wireSave(root, results) {
  root.querySelectorAll('[data-save]').forEach(b => b.onclick = () => {
    const r = results.find(x => 'r' + x.npi === b.dataset.save); if (!r) return;
    const nm = r.kind === 'idv' ? personName(r.name) : titleCase(r.name);
    S.team.push({ id: uid(), name: nm, role: r.type, phone: fmtPhone(r.phone), notes: titleCase(r.addr) }); save();
    b.textContent = '✓ Saved'; b.disabled = true; toast('Saved to My care team');
  });
  root.querySelectorAll('[data-savec]').forEach(b => b.onclick = () => {
    const [n, ph] = b.dataset.savec.split('|'); S.team.push({ id: uid(), name: n, role: 'SCI Model System center', phone: ph, notes: '' }); save();
    b.textContent = '✓ Saved'; b.disabled = true; toast('Saved to My care team');
  });
}

/* ----- Resources ----- */
function visibleCats() {
  return RESOURCES.filter(c => {
    if (S.showAll) return true;
    if (c.vetOnly && !S.profile.vet) return false;
    if (c.ageOnly && c.ageOnly !== S.profile.age) return false;
    return c.items.some(relItem);
  });
}
function showAllToggle() {
  return `<div class="card toggle"><div><b>Show everything</b><br><span class="muted">${S.showAll ? 'Showing all resources.' : S.profile.dis.length ? 'Showing what fits: ' + esc(S.profile.dis.map(disLabel).join(', ')) : 'Pick your disability under "Me" to narrow this list.'}</span></div>
    <button class="chip" id="allTog" aria-pressed="${S.showAll}">${S.showAll ? 'On' : 'Off'}</button></div>`;
}
function wireAllToggle(rerender) { const b = $('#allTog'); if (b) b.onclick = () => { S.showAll = !S.showAll; save(); rerender(); }; }
V.resources = (cat) => {
  if (cat) return V.resCat(cat);
  const cats = visibleCats();
  main.innerHTML = `<h1 class="serif">Resources for you</h1>${showAllToggle()}
    <div class="list">${cats.map(c => { const n = c.items.filter(relItem).length; return `<a class="row-btn" href="#/resources/${c.cat}"><span class="ico" aria-hidden="true">${c.icon}</span><span class="txt"><b>${esc(c.title)}</b><span>${n} resource${n === 1 ? '' : 's'}</span></span><span class="chev" aria-hidden="true">›</span></a>`; }).join('')}
    <a class="row-btn" href="#/meds"><span class="ico" aria-hidden="true">🔎</span><span class="txt"><b>Look up a medicine</b><span>Plain-language guides to your prescriptions</span></span><span class="chev">›</span></a></div>`;
  wireAllToggle(() => V.resources());
};
V.resCat = async (catId) => {
  const c = RESOURCES.find(r => r.cat === catId); if (!c) return V.resources();
  const z = S.profile.zip ? await lookupZip(S.profile.zip).catch(() => null) : null;
  const place = z ? `${z[2]} ${z[3]}` : '';
  const items = c.items.filter(relItem);
  main.innerHTML = back('#/resources', 'All resources') + `<h1 class="serif">${c.icon} ${esc(c.title)}</h1>
    ${c.local && !place ? '<p class="banner" style="border-color:var(--brand)">Add your zip code under "Me" to search near you.</p>' : ''}
    ${showAllToggle()}
    <div class="list">${items.map(it => {
      const href = it.u || searchHref(it.q + (place ? ' ' + place : ''));
      const sub = it.u ? '' : (place ? `<em>Searches near ${esc(place)}</em><br>` : '');
      return `<article class="card"><h3>${esc(it.t)}</h3><p>${sub}${esc(it.x)}</p><div class="acts">
        <a class="btn small" href="${esc(href)}" target="_blank" rel="noopener">${it.u ? 'Open website ↗' : 'Search ↗'}</a>
        ${it.ph ? `<a class="btn small secondary" href="${telHref(it.ph)}">📞 ${esc(it.ph)}</a>` : ''}</div></article>`;
    }).join('') || '<p>Nothing here fits your profile. Turn on "Show everything" to see all.</p>'}</div>`;
  wireAllToggle(() => V.resCat(catId));
};

/* ----- Medicines ----- */
V.meds = () => {
  main.innerHTML = back('#/resources', 'Resources') + `<h1 class="serif">Look up a medicine</h1>
    <p class="muted">Type the name on your bottle. You'll get a plain-language guide from MedlinePlus (National Library of Medicine).</p>
    <label class="field" for="medIn">Medicine name</label>
    <div class="inputrow"><input id="medIn" type="search" autocomplete="off" autocapitalize="off" spellcheck="false">${micButton('medIn', false)}</div>
    <p class="muted" style="margin-top:12px">Common after a new diagnosis:</p>
    <div class="chips">${COMMON_MEDS.map(m => `<button class="chip" data-med="${m}">${m}</button>`).join('')}</div>
    <div id="medList" class="list" style="margin-top:16px" aria-live="polite"></div>
    <div id="medInfo"></div>
    <p class="foot">This is general information. Ask your pharmacist or doctor about your own doses, side effects and interactions.</p>`;
  const inp = $('#medIn'); let t;
  inp.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => medSuggest(inp.value), 300); });
  main.querySelectorAll('[data-med]').forEach(b => b.onclick = () => { inp.value = b.dataset.med; medSuggest(b.dataset.med); });
  wireMics(main);
};
async function medSuggest(q) {
  q = q.trim(); const box = $('#medList'); $('#medInfo').innerHTML = '';
  if (q.length < 3) { box.innerHTML = ''; return; }
  box.innerHTML = '<p><span class="spinner"></span> Looking…</p>';
  try {
    const r = await fetch(API + 'rxterms/v3/search?maxList=8&ef=STRENGTHS_AND_FORMS,RXCUIS&terms=' + encodeURIComponent(q)).then(x => x.json());
    const names = r[1] || [], ex = r[2] || {};
    if (!names.length) { box.innerHTML = `<p>No match. Check the spelling, or <a href="${medlineSearch(q)}" target="_blank" rel="noopener">search MedlinePlus ↗</a></p>`; return; }
    box.innerHTML = names.map((n, i) => `<button class="row-btn" data-mi="${i}"><span class="ico">💊</span><span class="txt"><b>${esc(n)}</b><span>${esc((ex.STRENGTHS_AND_FORMS && ex.STRENGTHS_AND_FORMS[i] || []).slice(0, 4).join(', '))}</span></span><span class="chev">›</span></button>`).join('');
    box.querySelectorAll('[data-mi]').forEach(b => b.onclick = () => { const i = +b.dataset.mi; medInfo(names[i], (ex.RXCUIS && ex.RXCUIS[i] || [])[0]); });
  } catch (e) {
    box.innerHTML = `<p>The lookup service didn't answer. <a href="${medlineSearch(q)}" target="_blank" rel="noopener">Search MedlinePlus instead ↗</a></p>`;
  }
}
const medlineSearch = q => 'https://vsearch.nlm.nih.gov/vivisimo/cgi-bin/query-meta?v%3Aproject=medlineplus&v%3Asources=medlineplus-bundle&query=' + encodeURIComponent(q);
async function medInfo(name, rxcui) {
  const box = $('#medInfo'); const base = name.replace(/\s*\(.*\)\s*/, ' ').trim();
  box.innerHTML = `<div class="card"><p><span class="spinner"></span> Getting the guide for ${esc(base)}…</p></div>`;
  let links = [];
  try {
    if (rxcui) {
      const d = await fetch('https://connect.medlineplus.gov/service?mainSearchCriteria.v.cs=2.16.840.1.113883.6.88&mainSearchCriteria.v.c=' + encodeURIComponent(rxcui) + '&knowledgeResponseType=application/json').then(r => r.json());
      links = ((d.feed && d.feed.entry) || []).map(e => ({ t: e.title && e.title._value, u: e.link && e.link[0] && e.link[0].href, s: e.summary && e.summary._value }));
    }
  } catch (e) {}
  const sum = links[0] && links[0].s ? links[0].s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500) : '';
  box.innerHTML = `<article class="card"><h2>${esc(base)}</h2>
    ${sum ? `<p>${esc(sum)}${sum.length >= 500 ? '…' : ''}</p>` : ''}
    <div class="list">
      ${links.filter(l => l.u).slice(0, 3).map(l => `<a class="row-btn" href="${esc(l.u)}" target="_blank" rel="noopener"><span class="ico">📖</span><span class="txt"><b>${esc(l.t || 'MedlinePlus guide')}</b><span>Plain-language guide: uses, how to take it, side effects</span></span><span class="chev">↗</span></a>`).join('') ||
        `<a class="row-btn" href="${medlineSearch(base)}" target="_blank" rel="noopener"><span class="ico">📖</span><span class="txt"><b>Find it on MedlinePlus</b><span>Plain-language guides</span></span><span class="chev">↗</span></a>`}
      <a class="row-btn" href="https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=${encodeURIComponent(base)}" target="_blank" rel="noopener"><span class="ico">📄</span><span class="txt"><b>Official label (DailyMed)</b><span>Full prescribing details and patient leaflet</span></span><span class="chev">↗</span></a>
      <a class="row-btn" href="https://www.needymeds.org" target="_blank" rel="noopener"><span class="ico">💲</span><span class="txt"><b>Help paying for it (NeedyMeds)</b><span>Coupons and assistance programs</span></span><span class="chev">↗</span></a>
    </div>
    <p style="margin-top:12px"><button class="btn block" id="saveMed">＋ Add to My medicines</button></p></article>`;
  $('#saveMed').onclick = () => { S.meds.push({ id: uid(), name: base, notes: '' }); save(); $('#saveMed').textContent = '✓ Added'; $('#saveMed').disabled = true; toast('Added to My medicines'); };
  box.scrollIntoView({ block: 'start' });
}

/* ----- My plan ----- */
const PRI = { now: 'Now', soon: 'Soon', later: 'Later' };
function stepRow(s) {
  return `<div class="card step ${s.done ? 'done' : ''}" data-step="${esc(s.id)}">
    <button class="check" role="checkbox" aria-checked="${s.done}" aria-label="Done: ${esc(s.t)}">${s.done ? '✓' : ''}</button>
    <div class="body"><span class="pill p-${s.p}">${PRI[s.p]}</span><br><b>${esc(s.t)}</b>${s.x ? `<p class="muted">${esc(s.x)}</p>` : ''}
      <div class="actions">
        <button class="btn small secondary" data-cycle aria-label="Change priority, now ${PRI[s.p]}">Priority: ${PRI[s.p]} ⟳</button>
        <button class="btn small secondary" data-hide>${s.custom ? 'Delete' : 'Not for me'}</button>
      </div></div></div>`;
}
function wireSteps(root, rerender) {
  rerender = rerender || (() => route());
  root.querySelectorAll('[data-step]').forEach(el => {
    const id = el.dataset.step;
    el.querySelector('.check').onclick = () => { S.done[id] = !S.done[id]; if (!S.done[id]) delete S.done[id]; save(); say(S.done[id] ? 'Marked done' : 'Marked not done'); rerender(); };
    el.querySelector('[data-cycle]').onclick = () => {
      const cur = (myStepsById()[id] || {}).p || 'soon'; S.prio[id] = { now: 'soon', soon: 'later', later: 'now' }[cur];
      const c = S.custom.find(x => x.id === id); if (c) c.p = S.prio[id];
      save(); say('Priority ' + PRI[S.prio[id]]); rerender();
    };
    el.querySelector('[data-hide]').onclick = () => {
      const ci = S.custom.findIndex(x => x.id === id);
      if (ci >= 0) S.custom.splice(ci, 1); else S.hidden[id] = true;
      save(); toast('Removed from your plan'); rerender();
    };
  });
}
const myStepsById = () => Object.fromEntries(mySteps().map(s => [s.id, s]));
let planFilter = 'open';
V.plan = (tab) => {
  tab = tab || 'steps';
  const tabs = [['steps', '✅ Steps'], ['equip', '🦽 Equipment'], ['team', '👥 Care team'], ['meds', '💊 Medicines'], ['qs', '❓ Questions']];
  main.innerHTML = `<h1 class="serif">My plan</h1>
    <div class="tabs" role="tablist">${tabs.map(t => `<a class="chip" role="tab" aria-selected="${t[0] === tab}" href="#/plan/${t[0]}">${t[1]}</a>`).join('')}</div>
    <div id="planBody"></div>
    <div class="inputrow no-print" style="margin-top:12px"><a class="btn secondary" style="flex:1" href="#/print">🖨️ Print or save as PDF</a><button class="btn secondary" style="flex:1" id="sharePlan">📤 Share</button></div>`;
  $('#sharePlan').onclick = sharePlan;
  ({ steps: planSteps, equip: planEquip, team: planTeam, meds: planMeds, qs: planQs })[tab] ? ({ steps: planSteps, equip: planEquip, team: planTeam, meds: planMeds, qs: planQs })[tab]() : planSteps();
};
function planSteps() {
  const body = $('#planBody'); const all = mySteps();
  const f = { open: s => !s.done, now: s => !s.done && s.p === 'now', soon: s => !s.done && s.p === 'soon', later: s => !s.done && s.p === 'later', done: s => s.done }[planFilter];
  const list = all.filter(f);
  const hiddenN = Object.keys(S.hidden).length;
  body.innerHTML = `<p class="muted">Steps for: ${esc(setLabel(S.profile.setting))}. Tap the box when done. Tap "Priority" to move a step between Now, Soon and Later.</p>
    <div class="chips" role="group" aria-label="Filter">${[['open', 'To do'], ['now', 'Now'], ['soon', 'Soon'], ['later', 'Later'], ['done', 'Done']].map(x => `<button class="chip" data-f="${x[0]}" aria-pressed="${planFilter === x[0]}">${x[1]} (${all.filter({ open: s => !s.done, now: s => !s.done && s.p === 'now', soon: s => !s.done && s.p === 'soon', later: s => !s.done && s.p === 'later', done: s => s.done }[x[0]]).length})</button>`).join('')}</div>
    <div class="list" style="margin-top:14px">${list.map(stepRow).join('') || '<p>Nothing here.</p>'}</div>
    <details class="card no-print"><summary>＋ Add my own step</summary>
      <label class="field" for="newStep">What do you need to do?</label><input id="newStep" type="text">
      <p class="muted" style="margin-top:10px">Priority</p><div class="seg">${['now', 'soon', 'later'].map(p => `<button class="chip" data-np="${p}" aria-pressed="${p === 'soon'}">${PRI[p]}</button>`).join('')}</div>
      <p style="margin-top:12px"><button class="btn block" id="addStep">Add step</button></p></details>
    ${hiddenN ? `<p><button class="btn secondary small" id="unhide">Bring back ${hiddenN} hidden step${hiddenN > 1 ? 's' : ''}</button></p>` : ''}`;
  body.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { planFilter = b.dataset.f; planSteps(); });
  let np = 'soon';
  body.querySelectorAll('[data-np]').forEach(b => b.onclick = () => { np = b.dataset.np; body.querySelectorAll('[data-np]').forEach(x => x.setAttribute('aria-pressed', x === b)); });
  $('#addStep').onclick = () => { const v = $('#newStep').value.trim(); if (!v) return; S.custom.push({ id: 'c' + uid(), t: v, p: np }); save(); toast('Step added'); planSteps(); };
  const u = $('#unhide'); if (u) u.onclick = () => { S.hidden = {}; save(); planSteps(); };
  wireSteps(body, planSteps);
}
const EQS = [['need', 'Need'], ['ordered', 'Ordered'], ['have', 'Have it'], ['denied', 'Denied – appeal']];
function planEquip() {
  const body = $('#planBody');
  const have = new Set(S.equip.map(e => e.n.toLowerCase()));
  const sugg = EQUIP.filter(e => disMatch(e.d) && !have.has(e.n.toLowerCase()));
  const counts = Object.fromEntries(EQS.map(s => [s[0], S.equip.filter(e => e.status === s[0]).length]));
  body.innerHTML = `<p class="muted">Track what you have, what you need, and what's been ordered or denied. Denials can be appealed — ask your doctor for a letter of medical necessity.</p>
    ${S.equip.length ? `<p><b>${counts.need}</b> needed · <b>${counts.ordered}</b> ordered · <b>${counts.have}</b> have · <b>${counts.denied}</b> denied</p>` : ''}
    <div class="list">${S.equip.map(e => `<article class="card" data-eq="${e.id}"><h3>${esc(e.n)}</h3>
      <div class="seg" role="group" aria-label="Status">${EQS.map(s => `<button class="chip" data-st="${s[0]}" aria-pressed="${e.status === s[0]}">${s[1]}</button>`).join('')}</div>
      <details><summary>Supplier, dates & notes${e.vendor || e.notes ? ' ✎' : ''}</summary>
        <label class="field" for="v${e.id}">Supplier & phone</label><input id="v${e.id}" type="text" data-k="vendor" value="${esc(e.vendor || '')}">
        <label class="field" for="d${e.id}" style="margin-top:10px">Date ordered or next reorder</label><input id="d${e.id}" type="date" data-k="date" value="${esc(e.date || '')}">
        <label class="field" for="n${e.id}" style="margin-top:10px">Notes</label><textarea id="n${e.id}" data-k="notes">${esc(e.notes || '')}</textarea>
      </details>
      <p class="no-print"><button class="btn small secondary" data-del>Remove</button></p></article>`).join('')}</div>
    <section class="card no-print"><h2>Add equipment</h2>
      ${sugg.length ? `<p class="muted">Often needed for your situation — tap to add:</p><div class="chips">${sugg.map(e => `<button class="chip" data-add="${esc(e.n)}">＋ ${esc(e.n)}</button>`).join('')}</div>` : ''}
      <label class="field" for="eqNew" style="margin-top:14px">Something else</label>
      <div class="inputrow"><input id="eqNew" type="text"><button class="btn" id="eqAdd">Add</button></div></section>`;
  const add = n => { S.equip.push({ id: uid(), n, status: 'need' }); save(); toast('Added: ' + n); planEquip(); };
  body.querySelectorAll('[data-add]').forEach(b => b.onclick = () => add(b.dataset.add));
  $('#eqAdd').onclick = () => { const v = $('#eqNew').value.trim(); if (v) add(v); };
  body.querySelectorAll('[data-eq]').forEach(el => {
    const e = S.equip.find(x => x.id === el.dataset.eq);
    el.querySelectorAll('[data-st]').forEach(b => b.onclick = () => { e.status = b.dataset.st; save(); el.querySelectorAll('[data-st]').forEach(x => x.setAttribute('aria-pressed', x === b)); say('Status ' + b.textContent); });
    el.querySelectorAll('[data-k]').forEach(i => i.onchange = () => { e[i.dataset.k] = i.value; save(); });
    el.querySelector('[data-del]').onclick = () => { S.equip = S.equip.filter(x => x !== e); save(); planEquip(); };
  });
}
function planTeam() {
  const body = $('#planBody');
  body.innerHTML = `<p class="muted">Everyone helping with your care, in one place. Tip: save people straight from "Find care".</p>
    <div class="list">${S.team.map(t => `<article class="card" data-tm="${t.id}"><h3>${esc(t.name)}</h3><p class="muted">${esc(t.role || '')}</p>
      ${t.notes ? `<p>${esc(t.notes)}</p>` : ''}
      <div class="acts">${t.phone ? `<a class="btn small" href="${telHref(t.phone)}">📞 ${esc(t.phone)}</a>` : ''}<button class="btn small secondary" data-del>Remove</button></div></article>`).join('') || '<p>No one saved yet.</p>'}</div>
    <section class="card no-print"><h2>Add a person</h2>
      <label class="field" for="tmN">Name</label><input id="tmN" type="text">
      <label class="field" for="tmR" style="margin-top:10px">Role (doctor, case manager, therapist, supplier…)</label><input id="tmR" type="text">
      <label class="field" for="tmP" style="margin-top:10px">Phone</label><input id="tmP" type="tel" inputmode="tel">
      <label class="field" for="tmX" style="margin-top:10px">Notes</label><input id="tmX" type="text">
      <p style="margin-top:12px"><button class="btn block" id="tmAdd">Add person</button></p></section>`;
  $('#tmAdd').onclick = () => { const n = $('#tmN').value.trim(); if (!n) return; S.team.push({ id: uid(), name: n, role: $('#tmR').value.trim(), phone: $('#tmP').value.trim(), notes: $('#tmX').value.trim() }); save(); toast('Added'); planTeam(); };
  body.querySelectorAll('[data-tm]').forEach(el => el.querySelector('[data-del]').onclick = () => { S.team = S.team.filter(x => x.id !== el.dataset.tm); save(); planTeam(); });
}
function planMeds() {
  const body = $('#planBody');
  body.innerHTML = `<p class="muted">Your medicine list — useful at every appointment and in an emergency.</p>
    <div class="list">${S.meds.map(m => `<article class="card" data-md="${m.id}"><h3>${esc(m.name)}</h3>
      <label class="field" for="mn${m.id}">Dose, time, and what it's for</label><input id="mn${m.id}" type="text" value="${esc(m.notes || '')}">
      <div class="acts" style="margin-top:10px"><a class="btn small secondary" href="${medlineSearch(m.name)}" target="_blank" rel="noopener">Read about it ↗</a><button class="btn small secondary" data-del>Remove</button></div></article>`).join('') || '<p>No medicines yet.</p>'}</div>
    <p class="no-print"><a class="btn block" href="#/meds">＋ Look up and add a medicine</a></p>
    <details class="card no-print"><summary>Add by name only</summary><div class="inputrow"><input id="mdN" type="text" aria-label="Medicine name"><button class="btn" id="mdAdd">Add</button></div></details>`;
  body.querySelectorAll('[data-md]').forEach(el => {
    const m = S.meds.find(x => x.id === el.dataset.md);
    el.querySelector('input').onchange = e => { m.notes = e.target.value; save(); };
    el.querySelector('[data-del]').onclick = () => { S.meds = S.meds.filter(x => x !== m); save(); planMeds(); };
  });
  $('#mdAdd').onclick = () => { const v = $('#mdN').value.trim(); if (v) { S.meds.push({ id: uid(), name: v, notes: '' }); save(); planMeds(); } };
}
function planQs() {
  const body = $('#planBody');
  const pre = (QUESTIONS[S.profile.setting] || QUESTIONS.home).filter(q => !S.questions.some(x => x.q === q));
  body.innerHTML = `<p class="muted">Write questions down as you think of them, then bring this list to your next appointment.</p>
    <div class="list">${S.questions.map(q => `<article class="card step ${q.done ? 'done' : ''}" data-q="${q.id}">
      <button class="check" role="checkbox" aria-checked="${!!q.done}" aria-label="Answered">${q.done ? '✓' : ''}</button>
      <div class="body"><b>${esc(q.q)}</b><label class="sr" for="qa${q.id}">Answer</label><textarea id="qa${q.id}" placeholder="Answer / notes" style="margin-top:8px;min-height:70px">${esc(q.a || '')}</textarea>
      <div class="actions"><button class="btn small secondary" data-del>Remove</button></div></div></article>`).join('')}</div>
    <section class="card no-print"><h2>Add a question</h2>
      ${pre.length ? `<p class="muted">Suggested:</p><div class="chips">${pre.map(q => `<button class="chip" data-pq="${esc(q)}">＋ ${esc(q)}</button>`).join('')}</div>` : ''}
      <label class="field" for="qNew" style="margin-top:12px">My question</label><div class="inputrow"><input id="qNew" type="text">${micButton('qNew', false)}<button class="btn" id="qAdd">Add</button></div></section>`;
  const add = q => { S.questions.push({ id: uid(), q, a: '', done: false }); save(); planQs(); };
  body.querySelectorAll('[data-pq]').forEach(b => b.onclick = () => add(b.dataset.pq));
  $('#qAdd').onclick = () => { const v = $('#qNew').value.trim(); if (v) add(v); };
  body.querySelectorAll('[data-q]').forEach(el => {
    const q = S.questions.find(x => x.id === el.dataset.q);
    el.querySelector('.check').onclick = () => { q.done = !q.done; save(); planQs(); };
    el.querySelector('textarea').onchange = e => { q.a = e.target.value; save(); };
    el.querySelector('[data-del]').onclick = () => { S.questions = S.questions.filter(x => x !== q); save(); planQs(); };
  });
  wireMics(body);
}
function planText() {
  const p = S.profile, st = mySteps().filter(s => !s.done);
  return [
    'MY ONWARD PLAN', `Where: ${setLabel(p.setting)}`, p.dis.length ? 'Disability: ' + p.dis.map(disLabel).join(', ') : '', '',
    'NEXT STEPS', ...st.map(s => `[${PRI[s.p]}] ${s.t}`), '',
    S.equip.length ? 'EQUIPMENT' : '', ...S.equip.map(e => `${e.n} — ${(EQS.find(x => x[0] === e.status) || [, ''])[1]}${e.vendor ? ' (' + e.vendor + ')' : ''}`), '',
    S.team.length ? 'CARE TEAM' : '', ...S.team.map(t => `${t.name}${t.role ? ', ' + t.role : ''}${t.phone ? ' — ' + t.phone : ''}`), '',
    S.meds.length ? 'MEDICINES' : '', ...S.meds.map(m => `${m.name}${m.notes ? ' — ' + m.notes : ''}`), '',
    S.questions.filter(q => !q.done).length ? 'QUESTIONS' : '', ...S.questions.filter(q => !q.done).map(q => '• ' + q.q)
  ].filter((l, i, a) => l !== '' || a[i - 1] !== '').join('\n');
}
async function sharePlan() {
  const text = planText();
  if (navigator.share) { try { await navigator.share({ title: 'My Onward plan', text }); return; } catch (e) { return; } }
  try { await navigator.clipboard.writeText(text); toast('Plan copied — paste it into a message or email'); } catch (e) { toast('Sharing is not available here'); }
}
V.print = () => {
  main.innerHTML = back('#/plan', 'My plan') + `<p class="no-print"><button class="btn block" onclick="window.print()">🖨️ Print or save as PDF</button></p>
    <pre style="white-space:pre-wrap;font:inherit" class="card">${esc(planText())}</pre>`;
};

/* ----- Me / settings ----- */
V.settings = () => {
  const p = S.profile, pr = S.prefs;
  const seg = (k, opts) => `<div class="seg" role="group">${opts.map(o => `<button class="chip" data-pref="${k}" data-val="${o[0]}" aria-pressed="${pr[k] === o[0]}">${o[1]}</button>`).join('')}</div>`;
  main.innerHTML = `<h1 class="serif">Me</h1>
    <section class="card"><h2>My situation</h2>
      <p><b>Where I am:</b> ${esc(setLabel(p.setting))}<br><b>Disability:</b> ${esc(p.dis.map(disLabel).join(', ') || 'Not set')}<br><b>Age:</b> ${({ adult: '18–64', kid: 'Under 18', senior: '65+' })[p.age]}${p.vet ? ' · Veteran' : ''}<br><b>Zip:</b> ${esc(p.zip || 'Not set')}</p>
      <div class="list"><a class="btn secondary block" href="#/setup/1">Change where I am</a><a class="btn secondary block" href="#/setup/2">Change disability</a><a class="btn secondary block" href="#/setup/4">Change age or veteran status</a><a class="btn secondary block" href="#/setup/5">Change zip code</a></div></section>
    <section class="card"><h2>Easier to use</h2>
      <p><b>Text size</b></p>${seg('size', [['m', 'Normal'], ['l', 'Large'], ['xl', 'Extra large']])}
      <p style="margin-top:14px"><b>Colors</b></p>${seg('theme', [['auto', 'Match my phone'], ['light', 'Light'], ['dark', 'Dark']])}
      <p style="margin-top:14px"><b>Contrast</b></p>${seg('contrast', [['normal', 'Normal'], ['high', 'High contrast']])}
      <p style="margin-top:14px"><b>Motion</b></p>${seg('motion', [['auto', 'Match my phone'], ['reduce', 'Reduce motion']])}
      <p class="muted" style="margin-top:14px">Tip: your phone's Voice Control, Switch Control (iPhone) or Voice Access (Android) work throughout this app. The 🎤 buttons let you speak instead of type where your browser allows it.</p></section>
    <section class="card"><h2>Your information</h2>
      <p class="muted">Everything is saved only on this device. Make a backup to move it to a new phone.</p>
      <div class="list"><button class="btn secondary block" id="exp">⬇️ Save a backup file</button>
        <label class="btn secondary block" for="imp">⬆️ Restore from backup<input id="imp" type="file" accept="application/json,.json" class="sr"></label>
        <a class="btn secondary block" href="#/print">🖨️ Print my plan</a>
        <button class="btn secondary block" id="reset" style="border-color:var(--now);color:var(--now)">Erase everything</button></div></section>
    <section class="card"><h2>About Onward</h2>
      <p>Onward shares information, not medical, legal or financial advice. Provider listings come from the national NPI registry (CMS, via the National Library of Medicine) and are not endorsements. Medicine guides come from MedlinePlus. Always confirm with your care team.</p>
      <div class="list"><a class="btn secondary block" href="install.html">📲 Add Onward to your home screen</a><button class="btn secondary block" id="shareApp">📤 Share Onward with someone</button></div></section>`;
  main.querySelectorAll('[data-pref]').forEach(b => b.onclick = () => { S.prefs[b.dataset.pref] = b.dataset.val; save(); applyPrefs(); V.settings(); });
  $('#exp').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' })); a.download = 'onward-backup.json'; a.click(); };
  $('#imp').onchange = e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => { const d = JSON.parse(t); if (!d.profile) throw 0; localStorage.setItem(KEY, JSON.stringify(d)); location.reload(); }).catch(() => toast('That file is not an Onward backup')); };
  $('#reset').onclick = () => { if (confirm('Erase everything in Onward on this device? This cannot be undone.')) { localStorage.removeItem(KEY); location.hash = ''; location.reload(); } };
  $('#shareApp').onclick = async () => { const url = 'https://mightywaters.github.io/onward/'; if (navigator.share) { try { await navigator.share({ title: 'Onward', text: 'Help for life after a new disability', url }); } catch (e) {} } else { try { await navigator.clipboard.writeText(url); toast('Link copied'); } catch (e) { toast(url); } } };
};

/* ---------------- router ---------------- */
function route() {
  const h = location.hash.replace(/^#\/?/, '');
  const [view, arg] = h.split('/');
  if (!S.onboarded && !['setup', 'done', 'welcome', 'urgent'].includes(view)) { V.welcome(); markNav(''); return; }
  const fn = V[view] || V.home;
  fn(arg);
  markNav(view || 'home');
  window.scrollTo(0, 0);
}
function markNav(view) {
  const map = { home: 'home', care: 'care', careCat: 'care', resources: 'resources', meds: 'resources', plan: 'plan', print: 'plan', settings: 'settings', setup: 'settings' };
  document.querySelectorAll('[data-nav]').forEach(a => { if (a.dataset.nav === map[view]) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  const titles = { care: 'Find care', resources: 'Resources', plan: 'My plan', settings: 'Me', meds: 'Medicine lookup', urgent: 'Urgent help' };
  document.title = (titles[view] ? titles[view] + ' — ' : '') + 'Onward';
}
window.addEventListener('hashchange', () => { route(); main.focus({ preventScroll: true }); });
route();

if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
