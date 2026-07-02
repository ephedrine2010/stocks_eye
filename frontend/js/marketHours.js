// Client-side open/closed + local time, so the tile clocks tick live and the
// status updates without a server round-trip. Mirrors backend/core/marketHours.js.

const WD = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export function localParts(tz) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, weekday: 'short', hour: '2-digit', minute: '2-digit',
    second: '2-digit', hour12: false,
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  let h = +get('hour');
  if (h === 24) h = 0;
  const m = +get('minute');
  return {
    weekday: WD[get('weekday')],
    minutes: h * 60 + m,
    time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${get('second')}`,
  };
}

export function isOpen(schedule) {
  const { weekday, minutes } = localParts(schedule.tz);
  if (schedule.always) return true;
  if (!schedule.days.includes(weekday)) return false;
  return schedule.sessions.some(([a, b]) => minutes >= a && minutes < b);
}

export function utcTime() {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC', hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).format(new Date());
}
