import './live-journey.css';
import { JOURNEY_DAYS, JOURNEY_EVENTS, getJourneyState, journeyDateAt, toWibDateKey } from './journey-state.js';

// A WIB date key already represents a calendar day; UTC here only formats that key.
const dateFormatter = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeZone: 'UTC' });
const formatDate = (key) => dateFormatter.format(new Date(key));
const defaultEvent = (state) => state.today[0]?.eventId
  ?? (state.eventStates.video.kind === 'past' ? 'finale' : 'video');

export function initLiveJourney(root) {
  if (!root) return;
  const find = (name) => root.querySelector(`[data-journey-${name}]`);
  const status = find('status');
  const modeText = find('mode');
  const date = find('date');
  const phase = find('phase');
  const today = find('today');
  const next = find('next');
  const announcement = root.querySelector('[role="status"]');
  const slider = root.querySelector('#journey-date');
  const output = root.querySelector('output');
  const reset = find('reset');
  const map = find('map');
  const canvas = map.querySelector('canvas');
  const pin = find('pin');
  const fallback = find('fallback');
  const legend = find('legend');
  const items = JOURNEY_EVENTS.map(({ id, proposalHref }) => {
    const select = find(`select="${id}"`);
    const detail = find(`detail="${id}"`);
    detail.querySelector('a').href = proposalHref;
    return { id, select, detail, badge: select.querySelector('.journey-badge'), node: find(`node="${id}"`) };
  });

  const listeners = new AbortController();
  const { signal } = listeners;
  let mode = 'live';
  let previewDateKey;
  let state = getJourneyState(toWibDateKey(new Date()));
  let selectedEventId = defaultEvent(state);
  let timer;
  let scene;
  let sceneObserver;

  function renderSelection() {
    for (const { id, select, node, detail } of items) {
      const selected = id === selectedEventId;
      select.setAttribute('aria-pressed', selected);
      node.setAttribute('aria-pressed', selected);
      detail.hidden = !selected;
    }
  }

  function selectEvent(id) {
    if (id === selectedEventId) return;
    selectedEventId = id;
    renderSelection();
    scene?.update(state, selectedEventId);
  }

  function renderDate() {
    const live = mode === 'live';
    const label = formatDate(state.dateKey);
    modeText.textContent = live ? 'Hari ini' : 'Pratinjau';
    date.dateTime = state.dateKey;
    date.textContent = `${label} WIB`;
    phase.textContent = state.phaseLabel;
    today.hidden = !state.today.length;
    today.textContent = today.hidden ? ''
      : `${live ? 'Hari ini' : 'Pada tanggal pilihan'}: ${state.today.map(({ label }) => label).join(' · ')}`;
    next.hidden = !state.upcoming.length;
    next.textContent = next.hidden ? ''
      : `Berikutnya · ${formatDate(state.upcoming[0].dateKey)}: ${state.upcoming.map(({ label }) => label).join(' · ')}`;
    for (const { id, badge, node } of items) {
      const { kind, label: eventLabel } = state.eventStates[id];
      badge.dataset.kind = kind;
      badge.textContent = eventLabel;
      badge.hidden = false;
      node.dataset.kind = kind;
      node.title = eventLabel;
    }
    slider.value = Math.round(state.progress * JOURNEY_DAYS);
    const sliderLabel = formatDate(journeyDateAt(slider.valueAsNumber));
    slider.setAttribute('aria-valuetext', sliderLabel);
    output.value = sliderLabel;
    reset.disabled = live;
    pin.textContent = live ? 'Hari ini' : 'Tanggal pilihan';
    scene?.update(state, selectedEventId);
  }

  function announceDate() {
    announcement.textContent = `${modeText.textContent}, ${date.textContent}. ${state.phaseLabel}.`;
  }

  function refreshLiveDate() {
    if (mode !== 'live') return;
    const key = toWibDateKey(new Date());
    if (key === state.dateKey) return;
    state = getJourneyState(key);
    renderDate();
    announceDate();
  }

  function watchDate() {
    clearInterval(timer);
    if (document.hidden) return;
    refreshLiveDate();
    if (mode === 'live') timer = setInterval(refreshLiveDate, 60_000);
  }

  for (const { id, select } of items) {
    select.addEventListener('click', () => selectEvent(id), { signal });
    select.disabled = false;
  }
  slider.addEventListener('input', () => {
    mode = 'preview';
    clearInterval(timer);
    previewDateKey = journeyDateAt(slider.valueAsNumber);
    state = getJourneyState(previewDateKey);
    renderDate();
  }, { signal });
  slider.addEventListener('change', announceDate, { signal });
  reset.addEventListener('click', () => {
    mode = 'live';
    previewDateKey = undefined;
    state = getJourneyState(toWibDateKey(new Date()));
    selectedEventId = defaultEvent(state);
    renderSelection();
    renderDate();
    announceDate();
    watchDate();
  }, { signal });
  document.addEventListener('visibilitychange', watchDate, { signal });
  window.addEventListener('pageshow', watchDate, { signal });
  window.addEventListener('pagehide', (event) => {
    clearInterval(timer);
    if (event.persisted) return;
    listeners.abort();
    sceneObserver?.disconnect();
    scene?.dispose();
  }, { signal });

  renderSelection();
  renderDate();
  status.hidden = false;
  find('js-note').hidden = true;
  output.hidden = false;
  slider.disabled = false;
  watchDate();

  function reflectSceneAvailability(available) {
    fallback.hidden = available;
    legend.hidden = !available;
  }

  async function loadScene() {
    map.hidden = false;
    try {
      const { createJourneyScene } = await import('./journey-scene.js');
      if (signal.aborted) return;
      const loaded = await createJourneyScene({
        canvas, nodeButtons: items.map(({ node }) => node), onSelect: selectEvent,
        onAvailability: reflectSceneAvailability,
      });
      if (signal.aborted) {
        loaded.dispose();
        return;
      }
      scene = loaded;
      scene.update(state, selectedEventId);
    } catch {
      if (!signal.aborted) reflectSceneAvailability(false);
    }
  }

  if ('IntersectionObserver' in window) {
    sceneObserver = new IntersectionObserver((entries) => {
      if (!entries.some(({ isIntersecting }) => isIntersecting)) return;
      sceneObserver.disconnect();
      loadScene();
    }, { rootMargin: '200px' });
    sceneObserver.observe(root);
  } else {
    loadScene();
  }
}
