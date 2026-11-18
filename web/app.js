const byId = (id) => document.getElementById(id);
const start = byId('start');
const end = byId('end');
const series = byId('series');
const status = byId('status');
const result = byId('result');
const chart = byId('chart');
const metrics = {
  monthly: { label: 'Monthly mean', color: '#12675b', dash: [] },
  adjusted: { label: 'Seasonally adjusted', color: '#a2431e', dash: [5, 4] },
};
let rows = [];
let visible = [];
let keys = [];
const monthLabel = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' });

function parse(text) {
  const observations = text.split(/\r?\n/).flatMap((line) => {
    const fields = line.trim().split(/\s+/);
    if (fields.length !== 8 || !/^\d{4}$/.test(fields[0])) return [];
    const [year, month, , monthly, adjusted] = fields.map(Number);
    if (!Number.isInteger(month) || month < 1 || month > 12) return [];
    return [{
      id: `${year}-${String(month).padStart(2, '0')}`,
      time: Date.UTC(year, month - 1, 1),
      monthly: monthly > 0 ? monthly : null,
      adjusted: adjusted > 0 ? adjusted : null,
    }];
  });
  return observations.sort((a, b) => a.time - b.time);
}

function rowElement(parent, tag, values) {
  const row = parent.insertRow();
  for (const value of values) {
    const cell = document.createElement(tag);
    cell.textContent = value;
    if (tag === 'th') cell.scope = 'col';
    row.append(cell);
  }
}

function draw() {
  if (result.hidden) return;
  const { width, height } = chart.getBoundingClientRect();
  if (!width || !height) return;
  const ratio = window.devicePixelRatio || 1;
  chart.width = Math.round(width * ratio);
  chart.height = Math.round(height * ratio);
  const ctx = chart.getContext('2d');
  ctx.scale(ratio, ratio);
  const left = 46;
  const right = width - 16;
  const top = 30;
  const bottom = height - 48;
  const concentrations = visible.flatMap((row) => keys.map((key) => row[key]).filter((value) => value !== null));
  const spread = Math.max(...concentrations) - Math.min(...concentrations);
  const step = spread > 75 ? 25 : spread > 20 ? 10 : spread > 6 ? 5 : 2;
  const low = Math.floor((Math.min(...concentrations) - 0.1) / step) * step;
  const high = Math.ceil((Math.max(...concentrations) + 0.1) / step) * step;
  const first = visible[0].time;
  const last = visible.at(-1).time;
  const x = (time) => first === last ? (left + right) / 2 : left + (time - first) / (last - first) * (right - left);
  const y = (value) => bottom - (value - low) / (high - low) * (bottom - top);
  ctx.font = '12px system-ui';
  ctx.fillStyle = '#314e48';
  ctx.fillText('CO₂ (ppm)', 0, 15);
  for (let value = low; value <= high; value += step) {
    ctx.strokeStyle = '#dce5de';
    ctx.beginPath();
    ctx.moveTo(left, y(value));
    ctx.lineTo(right, y(value));
    ctx.stroke();
    ctx.fillText(String(value), 6, y(value) + 4);
  }
  ctx.textAlign = 'center';
  const ticks = Math.min(visible.length, Math.max(2, Math.floor((right - left) / 95)));
  for (let i = 0; i < ticks; i += 1) {
    const row = visible[ticks === 1 ? 0 : Math.round(i * (visible.length - 1) / (ticks - 1))];
    const label = last - first > 6 * 365.25 * 86400000 ? String(new Date(row.time).getUTCFullYear()) : monthLabel.format(row.time);
    const half = ctx.measureText(label).width / 2;
    ctx.fillText(label, Math.min(width - half, Math.max(half, x(row.time))), bottom + 18);
  }
  ctx.fillText('Date', (left + right) / 2, height - 6);

  for (const key of keys) {
    ctx.strokeStyle = ctx.fillStyle = metrics[key].color;
    ctx.lineWidth = 2;
    ctx.setLineDash(metrics[key].dash);
    ctx.beginPath();
    let previous = null;
    for (const row of visible) {
      const value = row[key];
      if (value !== null) {
        const adjacent = previous && row.time - previous.time <= 32 * 86400000;
        if (adjacent) ctx.lineTo(x(row.time), y(value));
        else ctx.moveTo(x(row.time), y(value));
        previous = row;
      } else {
        previous = null;
      }
    }
    ctx.stroke();
    ctx.setLineDash([]);
    if (visible.length <= 36) {
      for (const row of visible) {
        if (row[key] === null) continue;
        ctx.beginPath();
        ctx.arc(x(row.time), y(row[key]), 2.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function render() {
  result.hidden = true;
  const valid = (input) => input.validity.valid && /^\d{4}-(0[1-9]|1[0-2])$/.test(input.value)
    && input.value >= input.getAttribute("min") && input.value <= input.getAttribute("max");
  if (!valid(start) || !valid(end) || start.value > end.value) {
    status.textContent = 'Choose a valid date range. The end month must be on or after the start month.';
    return;
  }
  keys = series.value === 'both' ? Object.keys(metrics) : [series.value];
  visible = rows.filter(({ id }) => id >= start.value && id <= end.value);
  const count = visible.filter((row) => keys.some((key) => row[key] !== null)).length;
  if (!count) {
    status.textContent = 'No CO₂ values are available for this selection.';
    return;
  }
  const range = `${monthLabel.format(visible[0].time)} to ${monthLabel.format(visible.at(-1).time)}`;
  const descriptions = keys.map((key) => {
    const values = visible.map((row) => row[key]).filter((value) => value !== null);
    return values.length ? `${metrics[key].label}: ${Math.min(...values).toFixed(2)}–${Math.max(...values).toFixed(2)} ppm` : `${metrics[key].label}: unavailable`;
  });
  status.textContent = `${range} · ${count} ${count === 1 ? 'month' : 'months'} with data. ${descriptions.join(' · ')}`;
  byId('legend').replaceChildren(...keys.map((key) => {
    const item = document.createElement('li');
    item.className = key;
    item.textContent = metrics[key].label;
    return item;
  }));
  byId('head').replaceChildren();
  rowElement(byId('head'), 'th', ['Month', ...keys.map((key) => metrics[key].label)]);
  byId('values').replaceChildren();
  for (const row of visible) {
    rowElement(byId('values'), 'td', [monthLabel.format(row.time), ...keys.map((key) => row[key]?.toFixed(2) ?? 'Unavailable')]);
  }
  result.hidden = false;
  draw();
}

function resetDates() {
  start.value = rows[0].id;
  end.value = rows.at(-1).id;
  render();
}

byId('controls').addEventListener('change', render);
byId('reset').addEventListener('click', resetDates);
new ResizeObserver(draw).observe(chart);

try {
  const response = await fetch('./noaa-co2.txt', { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  rows = parse(await response.text());
  if (!rows.some((row) => row.monthly !== null || row.adjusted !== null)) throw new Error('No usable observations');
  for (const input of [start, end]) {
    input.setAttribute("min", rows[0].id);
    input.setAttribute("max", rows.at(-1).id);
  }
  byId('controls').disabled = false;
  resetDates();
} catch {
  status.textContent = 'The NOAA snapshot could not be loaded. Reload the page to try again.';
}
