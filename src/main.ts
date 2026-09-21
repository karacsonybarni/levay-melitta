import './style.css';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-ext-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-ext-500.css';
import { messages } from './messages';
import { content } from './content';
import { APPS_SCRIPT_WEB_APP_URL, submitWebsiteForm, createBookingRequestId, WebsiteFormSubmissionError } from './formSubmission';
import { getCalendarAvailability } from './calendarAvailability';

type View = 'home' | 'contact' | 'appointment';
let lang: 'hu'|'en' = 'hu';
let view: View = 'home';
let busy = false;
let startedAt = Date.now();
let bookingId = createBookingRequestId();
let bookingFingerprint = '';
let draft: Record<string,string> = {};
const app = document.querySelector<HTMLDivElement>('#app')!;
const arrow = '<span aria-hidden="true">↗</span>';
function readLocation() {
  const params = new URLSearchParams(location.search);
  lang = params.get('lang') === 'en' ? 'en' : 'hu';
  view = params.get('view') === 'contact' ? 'contact' : params.get('view') === 'appointment' ? 'appointment' : 'home';
}
function href(next: View) { const url = new URL(location.href); url.searchParams.set('lang',lang); if(next === 'home')url.searchParams.delete('view');else url.searchParams.set('view',next);url.hash='';return url.pathname+url.search; }
function routeLink(next: View, label: string, cls='') { return `<a class="${cls}" href="${href(next)}" data-view="${next}">${label}</a>`; }
function saveDraft() { const form=document.querySelector<HTMLFormElement>('#enquiry');if(form)for(const [key,value] of new FormData(form))draft[key]=String(value); }
function homePage() {
  const t=messages[lang], c=content[lang];
  return `<section class="masthead"><div class="masthead-meta"><span>${c.strap}</span><span>HU / EN</span></div><h1 class="nameplate">Lévay<span>Melitta<span class="name-dot">.</span></span></h1><div class="masthead-bottom"><p>${c.headline}</p>${routeLink('contact',c.explore+arrow,'light-action')}</div></section>
  <section class="opening"><div class="architecture" aria-hidden="true"><svg viewBox="0 0 1000 330" preserveAspectRatio="xMidYMid slice"><defs><pattern id="facade" width="90" height="330" patternUnits="userSpaceOnUse"><path d="M0 330V75L45 0v330M45 0L90 75v255" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M6 330V78L39 23v307M51 23l33 55v252" fill="none" stroke="currentColor" stroke-width=".5"/></pattern></defs><rect width="1000" height="330" fill="url(#facade)"/><path d="M0 250h1000M0 265h1000M0 280h1000M0 295h1000M0 310h1000" stroke="currentColor" fill="none"/></svg><span>LM — ${t.role}</span></div><div class="opening-copy"><span class="section-tag">01 / ${t.role}</span><p>${c.introduction}</p>${routeLink('contact',c.start+arrow,'underlined-link')}</div></section>
  <section class="directory"><div class="section-heading"><span class="section-tag">02 / ${c.directoryLabel}</span><h2>${c.directory}</h2></div>${routeLink('contact',`<span class="directory-index">A</span><span><strong>${c.enquiry}</strong><small>${c.messageSummary}</small></span>${arrow}`,'directory-row')}${routeLink('appointment',`<span class="directory-index">B</span><span><strong>${c.booking}</strong><small>${c.bookingSummary}</small></span>${arrow}`,'directory-row')}</section>
  <section class="information"><div class="section-heading"><span class="section-tag">03 / ${c.info}</span><h2>${c.infoIntro}</h2></div><div class="questions">${c.questions.map(([q,a])=>`<details><summary>${q}<span aria-hidden="true">+</span></summary><p>${a}</p></details>`).join('')}</div></section>`;
}
function formPage() {
  const t=messages[lang],c=content[lang],booking=view==='appointment';
  return `<section class="intake-head">${routeLink('home','← '+c.back,'back-link')}<div class="section-tag">${booking?c.appointmentStep:c.formStep}</div><h1>${booking?c.bookingTitle:c.contactTitle}</h1><p>${booking?c.bookingIntro:c.contactIntro}</p></section>
  <section class="intake-layout"><form id="enquiry"><fieldset ${!APPS_SCRIPT_WEB_APP_URL?'disabled':''}>
  ${booking?`<div class="form-section"><h2><span>01</span>${c.booking}</h2><div class="input-pair"><label>${c.day}<select id="day" required><option value="">${c.chooseDay}</option></select></label><label>${c.time}<select name="slotStart" required disabled><option value="">${c.chooseTime}</option></select></label></div><p class="field-hint">${c.timezone}</p><p id="calendar-status" role="status"></p><button id="retry" class="underlined-link" type="button" hidden>${t.retry}</button></div>`:''}
  <div class="form-section"><h2><span>${booking?'02':'01'}</span>${c.details}</h2><div class="input-pair"><label>${t.fields[0]}<input name="name" autocomplete="name" required maxlength="120"></label><label>${t.fields[1]}<input name="email" type="email" autocomplete="email" required maxlength="254"></label></div></div>
  <div class="form-section"><h2><span>${booking?'03':'02'}</span>${c.matter}${booking?`<small>${c.optional}</small>`:''}</h2><label class="message-label"><span class="sr-only">${t.fields[2]}</span><textarea name="message" rows="5" maxlength="2000" placeholder="${t.fields[3]}" ${booking?'':'required'}></textarea></label></div>
  <div class="honey" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div><label class="consent"><input type="checkbox" required><span>${t.privacy}</span></label><button class="legal-link" type="button" data-legal>${t.legal}</button><button class="primary-action submit" type="submit">${booking?t.book:t.send}${arrow}</button></fieldset><p id="form-status" role="status">${APPS_SCRIPT_WEB_APP_URL?'':t.unavailable}</p></form>
  <aside class="intake-aside"><span class="section-tag">${c.reference}</span><p>${t.caution}</p><p class="preview-card">${c.previewNotice}</p>${booking?`<p>${t.duration}</p>`:''}<div class="alternative"><span>${booking?c.alternativeBook:c.alternative}</span>${routeLink(booking?'contact':'appointment',(booking?c.enquiry:c.booking)+arrow,'underlined-link')}</div></aside></section>`;
}
function render() {
  const t=messages[lang],c=content[lang];document.documentElement.lang=lang;document.title=`${t.name} | ${view==='home'?t.role:view==='contact'?c.enquiry:c.booking}`;
  app.innerHTML=`<a class="skip" href="#main">${t.skip}</a><div class="preview">${t.preview}</div><header class="site-header"><a class="brand" href="${href('home')}" data-view="home" aria-label="${t.name}"><img src="./mark.svg" alt="" width="42" height="42"><span>${t.name}</span></a><nav aria-label="${c.menu}">${(['home','contact','appointment'] as View[]).map((v,i)=>`<a href="${href(v)}" data-view="${v}" ${view===v?'aria-current="page"':''}>${[c.home,c.enquiry,c.booking][i]}</a>`).join('')}</nav><div class="languages"><button data-lang="hu" aria-label="Magyar" aria-pressed="${lang==='hu'}">HU</button><button data-lang="en" aria-label="English" aria-pressed="${lang==='en'}">EN</button></div></header>
  <main id="main" tabindex="-1" class="${view==='home'?'home-view':'form-view'}">${view==='home'?homePage():formPage()}</main>
  <footer><div class="footer-top"><span>${t.name}</span>${routeLink('contact',c.enquiry+arrow)}</div><div class="footer-bottom"><span>© ${new Date().getFullYear()} · ${c.rights}</span><button data-legal>${t.legal}</button><span>HU / EN</span></div></footer><dialog aria-labelledby="legal-title"><button class="dialog-close" type="button">${t.close} ×</button><h2 id="legal-title">${t.legalTitle}</h2><p>${t.legalText}</p></dialog>`;
  for(const key of ['name','email','message']) { const input=document.querySelector<HTMLInputElement|HTMLTextAreaElement>(`[name="${key}"]`);if(input)input.value=draft[key]||''; }
  document.querySelectorAll<HTMLAnchorElement>('[data-view]').forEach(a=>a.onclick=e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();if(busy)return;saveDraft();history.pushState(null,'',a.href);readLocation();render();window.scrollTo(0,0);document.querySelector<HTMLElement>('#main')!.focus({preventScroll:true});});
  document.querySelectorAll<HTMLButtonElement>('[data-lang]').forEach(b=>b.onclick=()=>{if(busy)return;saveDraft();lang=b.dataset.lang as typeof lang;const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url);render();document.querySelector<HTMLButtonElement>(`[data-lang="${lang}"]`)!.focus({preventScroll:true});});
  const dialog=document.querySelector('dialog')!;document.querySelectorAll<HTMLButtonElement>('[data-legal]').forEach(b=>b.onclick=()=>dialog.showModal());document.querySelector<HTMLButtonElement>('.dialog-close')!.onclick=()=>dialog.close();
  const form=document.querySelector<HTMLFormElement>('#enquiry');if(form)form.onsubmit=submit;
  if(view==='appointment'&&APPS_SCRIPT_WEB_APP_URL){document.querySelector<HTMLButtonElement>('#retry')!.onclick=loadSlots;void loadSlots();}
}
async function loadSlots() {
  const status=document.querySelector<HTMLElement>('#calendar-status')!,day=document.querySelector<HTMLSelectElement>('#day')!,select=document.querySelector<HTMLSelectElement>('[name=slotStart]')!,retry=document.querySelector<HTMLButtonElement>('#retry')!;
  const t=messages[lang],c=content[lang];status.textContent=t.loading;retry.hidden=true;day.disabled=true;select.disabled=true;
  try {
    const result=await getCalendarAvailability();if(!status.isConnected)return;
    const groups=new Map<string,string[]>();
    const locale=lang==='hu'?'hu-HU':'en-GB';
    const dateLabel=new Intl.DateTimeFormat(locale,{timeZone:'Europe/Budapest',month:'long',day:'numeric',weekday:'short'});
    for(const slot of result.slots){const d=new Date(slot);if(!Number.isFinite(d.getTime()))continue;const key=dateLabel.format(d);groups.set(key,[...(groups.get(key)||[]),slot]);}
    day.replaceChildren(new Option(c.chooseDay,''));for(const key of groups.keys())day.add(new Option(key,key));
    const showTimes=()=>{const slots=groups.get(day.value)||[];select.replaceChildren(new Option(slots.length?t.select:c.chooseTime,''));for(const slot of slots)select.add(new Option(new Intl.DateTimeFormat(locale,{timeZone:'Europe/Budapest',hour:'2-digit',minute:'2-digit'}).format(new Date(slot)),slot));select.disabled=!slots.length;};
    day.onchange=()=>{draft.slotStart='';showTimes();};select.onchange=()=>{draft.slotStart=select.value;};
    const saved=[...groups].find(([,slots])=>slots.includes(draft.slotStart));if(saved)day.value=saved[0];showTimes();if(saved)select.value=draft.slotStart;
    status.textContent=groups.size?'':t.empty;day.disabled=!groups.size;
  }catch{if(!status.isConnected)return;status.textContent=t.calendarError;retry.hidden=false;}
}
async function submit(event:SubmitEvent) {
  event.preventDefault();if(busy)return;const form=event.currentTarget as HTMLFormElement,data=new FormData(form),t=messages[lang];const status=document.querySelector<HTMLElement>('#form-status')!;
  const mode: 'contact'|'appointment'=view==='appointment'?'appointment':'contact';
  const payload={formType:mode,language:lang,name:String(data.get('name')||''),email:String(data.get('email')||''),message:String(data.get('message')||''),slotStart:String(data.get('slotStart')||''),website:String(data.get('website')||''),startedAt,meetingMode:'online',meetingModeLabel:'Online'};
  if(mode==='appointment'&&!payload.slotStart){status.textContent=t.select;return;}
  const fingerprint=JSON.stringify([payload.email,payload.slotStart]);if(fingerprint!==bookingFingerprint){bookingId=createBookingRequestId();bookingFingerprint=fingerprint;}
  saveDraft();busy=true;const fieldset=form.querySelector('fieldset')!;fieldset.disabled=true;status.textContent=t.sending;
  try{await submitWebsiteForm({...payload,bookingRequestId:bookingId});form.reset();draft={};startedAt=Date.now();status.textContent=mode==='contact'?t.sent:t.booked;if(mode==='appointment')void loadSlots();}
  catch(error){if(error instanceof WebsiteFormSubmissionError&&error.code==='SLOT_UNAVAILABLE'){status.textContent=content[lang].unavailableSlot;draft.slotStart='';void loadSlots();}else status.textContent=t.error;}
  finally{busy=false;fieldset.disabled=false;}
}
window.addEventListener('popstate',()=>{
  // Keep the submitting form mounted so its result remains visible.
  if(busy){history.pushState(null,'',href(view));return;}
  saveDraft();readLocation();render();
});
readLocation();render();

