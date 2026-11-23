const DAY_MS = 86_400_000;
const START = '2026-11-17';
const END = '2026-12-20';
const START_MS = Date.parse(START);
const wibFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit',
});

export const JOURNEY_EVENTS = [
  { id: 'video', title: 'Kompetisi Kreatif Video', startDate: START, endDate: END, timeLabel: 'Pendaftaran gratis', summary: 'Nyala Generasi, Abadi Menginspirasi', proposalHref: '/proposal.html#video' },
  { id: 'dialog', title: 'Dialog Interaktif', startDate: '2026-11-21', endDate: '2026-11-21', timeLabel: '19.00 WIB', summary: 'Ya Allah, ini arahnya ke mana, ya?', proposalHref: '/proposal.html#dialog' },
  { id: 'cup', title: 'El Muna Fun Cup', startDate: '2026-12-13', endDate: '2026-12-13', timeLabel: '08.00 WIB', summary: 'Badminton ganda campuran usia 15–30 tahun · Rp30 ribu per tim', proposalHref: '/proposal.html#badminton' },
  { id: 'finale', title: 'Puncak Harlah ke-43', startDate: END, endDate: END, timeLabel: '19.00 WIB–selesai', summary: 'Pengajian umum bersama Gus Salsaladin dan Hadrah El Muna Tulungagung', proposalHref: '/proposal.html#finale' },
];

const phases = [
  ['2026-11-28', 'Pendaftaran video dibuka'],
  ['2026-11-29', 'Hari terakhir pendaftaran · produksi video dimulai'],
  ['2026-12-12', 'Periode produksi video'],
  ['2026-12-13', 'Batas pengumpulan video'],
  ['2026-12-16', 'Menuju pengumuman pemenang'],
  ['2026-12-17', 'Pengumuman pemenang video'],
  ['2026-12-19', 'Menuju awarding'],
  [END, 'Awarding video · Puncak Harlah ke-43'],
];
const milestones = [
  [START, 'video', 'Pendaftaran video dibuka'],
  [JOURNEY_EVENTS[1].startDate, 'dialog', JOURNEY_EVENTS[1].title],
  ['2026-11-29', 'video', 'Produksi video dimulai'],
  [JOURNEY_EVENTS[2].startDate, 'video', 'Batas pengumpulan video'],
  [JOURNEY_EVENTS[2].startDate, 'cup', JOURNEY_EVENTS[2].title],
  ['2026-12-17', 'video', 'Pengumuman pemenang video'],
  [END, 'video', 'Awarding video'],
  [END, 'finale', JOURNEY_EVENTS[3].title],
].map(([dateKey, eventId, label]) => ({ dateKey, eventId, label }));
const nodeDays = JOURNEY_EVENTS.map(({ startDate }) => (Date.parse(startDate) - START_MS) / DAY_MS);
export const JOURNEY_DAYS = nodeDays.at(-1);

export function toWibDateKey(now) {
  const parts = Object.fromEntries(wibFormatter.formatToParts(now).map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function journeyDateAt(day) {
  return new Date(START_MS + day * DAY_MS).toISOString().slice(0, 10);
}

export function getJourneyState(dateKey) {
  const before = dateKey < START;
  const after = dateKey > END;
  const phaseLabel = before ? 'Rangkaian belum dimulai' : after
    ? 'Seluruh jadwal rangkaian telah lewat'
    : phases.find(([through]) => dateKey <= through)[1];
  const days = Math.max(0, Math.min(JOURNEY_DAYS, (Date.parse(dateKey) - START_MS) / DAY_MS));
  const upper = nodeDays.findIndex((day, index) => index > 0 && days <= day);
  const lower = upper - 1;
  // Equal visual spacing between islands' landmarks, not equal calendar intervals.
  const routeProgress = (lower + (days - nodeDays[lower]) / (nodeDays[upper] - nodeDays[lower])) / (nodeDays.length - 1);
  const eventStates = Object.fromEntries(JOURNEY_EVENTS.map(({ id, startDate, endDate }) => {
    if (dateKey < startDate) return [id, { kind: 'upcoming', label: id === 'video' ? 'Belum dibuka' : 'Mendatang' }];
    if (dateKey > endDate) return [id, { kind: 'past', label: 'Jadwal telah lewat' }];
    return [id, { kind: 'current', label: id === 'video' ? phaseLabel : 'Hari acara' }];
  }));
  const next = milestones.find((entry) => entry.dateKey > dateKey);
  return {
    dateKey, phaseLabel, progress: days / JOURNEY_DAYS, routeProgress, eventStates,
    today: milestones.filter((entry) => entry.dateKey === dateKey),
    upcoming: next ? milestones.filter((entry) => entry.dateKey === next.dateKey) : [],
  };
}
