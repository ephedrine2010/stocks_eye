// Per-market open/closed + local time, computed from a schedule + IANA timezone.
// A "schedule" is { days:[0-6], sessions:[[startMin,endMin]], always?, commodity? }
// days: 0=Sun … 6=Sat. Minutes are minutes-since-local-midnight.
// This mirrors the client-side logic so server snapshots and the UI agree.

const WD = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export function localParts(tz) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, weekday: 'short', hour: '2-digit', minute: '2-digit',
    second: '2-digit', hour12: false,
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  let h = +get('hour');
  if (h === 24) h = 0; // some engines emit 24 at midnight
  const m = +get('minute');
  const s = get('second');
  return {
    weekday: WD[get('weekday')],
    minutes: h * 60 + m,
    time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${s}`,
  };
}

export function isOpen(schedule) {
  const { weekday, minutes } = localParts(schedule.tz);
  if (schedule.always) return true;
  if (!schedule.days.includes(weekday)) return false;
  return schedule.sessions.some(([a, b]) => minutes >= a && minutes < b);
}

export default { localParts, isOpen };
