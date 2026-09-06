export type ExportSlot = {
  short: string;
  ap: number;
  iconUrl?: string;
};

export type ExportAbilityTotal = {
  short: string;
  ap: number;
  iconUrl?: string;
};

export type LoadoutCardData = {
  title: string;
  author: string;
  tags: string[];
  note: string;
  version: string;
  weapon: {
    name: string;
    badge: string;
    family: string;
    sub: string;
    special: string;
  };
  slots: ExportSlot[];
  totals: ExportAbilityTotal[];
};

export function normalizeTags(value: string) {
  return [...new Set(value.split(/[\s,，、]+/).map((tag) => tag.trim()).filter(Boolean))].slice(0, 5);
}

export function sanitizePngFilename(value: string) {
  const printable = value.trim().replace(/\p{Cc}/gu, '');
  const safe = printable.replace(/[<>:"/\\|?*]/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 64);
  return `${safe || 'inklab-loadout'}.png`;
}

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function fillRoundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, color: string) {
  roundedRect(context, x, y, width, height, radius);
  context.fillStyle = color;
  context.fill();
}

/** Matches the site's two-value CSS border-radius: large corners at top-left/bottom-right. */
function fillBrandShape(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  largeRadius: number,
  smallRadius: number,
  color: string,
) {
  context.beginPath();
  context.moveTo(x + largeRadius, y);
  context.lineTo(x + width - smallRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + smallRadius);
  context.lineTo(x + width, y + height - largeRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - largeRadius, y + height);
  context.lineTo(x + smallRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - smallRadius);
  context.lineTo(x, y + largeRadius);
  context.quadraticCurveTo(x, y, x + largeRadius, y);
  context.closePath();
  context.fillStyle = color;
  context.fill();
}

function truncate(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  if (context.measureText(text).width <= maxWidth) return text;
  let output = text;
  while (output.length && context.measureText(`${output}…`).width > maxWidth) output = output.slice(0, -1);
  return `${output}…`;
}

async function loadImages(urls: string[]) {
  const entries = await Promise.all(urls.map(async (url) => {
    const image = new Image();
    image.src = url;
    try {
      await image.decode();
      return [url, image] as const;
    } catch {
      return [url, undefined] as const;
    }
  }));
  return new Map(entries);
}

function drawAbility(context: CanvasRenderingContext2D, image: HTMLImageElement | undefined, short: string, x: number, y: number, size: number) {
  context.save();
  context.beginPath();
  context.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  context.clip();
  context.fillStyle = '#090a0f';
  context.fillRect(x, y, size, size);
  if (image) context.drawImage(image, x, y, size, size);
  else {
    context.fillStyle = '#ffffff';
    context.font = `800 ${Math.round(size * 0.28)}px Arial, "Microsoft YaHei", sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(short.slice(0, 2), x + size / 2, y + size / 2);
  }
  context.restore();
}

export async function exportLoadoutPng(data: LoadoutCardData) {
  await document.fonts?.ready;
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is unavailable');

  const urls = [...new Set([...data.slots, ...data.totals].flatMap((item) => item.iconUrl ? [item.iconUrl] : []))];
  const images = await loadImages(urls);
  const font = 'Arial, "Microsoft YaHei", sans-serif';
  const colors = {
    ink: '#202027',
    paper: '#f5f3ee',
    purple: '#6d4aff',
    line: '#dedbd2',
    acid: '#d9ff35',
    muted: '#92929d',
  } as const;

  context.fillStyle = colors.paper;
  context.fillRect(0, 0, 1200, 630);
  context.fillStyle = colors.ink;
  context.fillRect(0, 0, 1200, 68);
  context.fillStyle = colors.acid;
  context.fillRect(0, 64, 1200, 4);

  context.save();
  context.translate(58, 34);
  context.rotate(-4 * Math.PI / 180);
  fillBrandShape(context, -16, -16, 32, 32, 10, 4, colors.purple);
  context.fillStyle = colors.acid;
  context.font = `900 16px ${font}`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('S3', 0, 1);
  context.restore();
  context.textAlign = 'left';
  context.fillStyle = '#ffffff';
  context.font = `900 20px ${font}`;
  context.fillText('INKLAB', 84, 36);
  context.fillStyle = colors.muted;
  context.font = `700 13px ${font}`;
  context.fillText('配装实验室', 190, 36);
  context.textAlign = 'right';
  context.fillText(`非官方玩家工具 · Ver. ${data.version}`, 1152, 36);
  context.textAlign = 'left';

  context.fillStyle = colors.purple;
  context.font = `800 12px monospace`;
  context.fillText('WEAPON LAB / LOADOUT CARD', 52, 111);
  context.fillStyle = colors.ink;
  context.font = `900 34px ${font}`;
  context.fillText(truncate(context, data.title, 720), 52, 151);
  let tagX = 52;
  context.font = `800 14px ${font}`;
  for (const tag of data.tags) {
    const width = context.measureText(tag).width + 26;
    fillRoundedRect(context, tagX, 166, width, 30, 15, tagX === 52 ? colors.purple : colors.ink);
    context.fillStyle = '#ffffff';
    context.fillText(tag, tagX + 13, 186);
    tagX += width + 8;
  }

  context.fillStyle = colors.ink;
  context.fillRect(52, 216, 728, 76);
  context.save();
  context.translate(95, 254);
  context.rotate(-3 * Math.PI / 180);
  fillBrandShape(context, -28.5, -28.5, 57, 57, 18, 6, colors.purple);
  context.fillStyle = colors.acid;
  context.font = `900 20px ${font}`;
  context.textAlign = 'center';
  context.fillText(data.weapon.badge, 0, 7);
  context.restore();
  context.textAlign = 'left';
  context.fillStyle = '#ffffff';
  context.font = `900 22px ${font}`;
  context.fillText(data.weapon.name, 140, 249);
  context.fillStyle = '#b8b8c2';
  context.font = `600 14px ${font}`;
  context.fillText(`${data.weapon.family} · ${data.weapon.sub} · ${data.weapon.special}`, 140, 275);

  const gearNames = ['头部', '服装', '鞋子'];
  for (let row = 0; row < 3; row += 1) {
    const y = 304 + row * 70;
    context.fillStyle = row % 2 === 0 ? '#ffffff' : '#efede7';
    context.fillRect(52, y, 728, 62);
    context.strokeStyle = colors.line;
    context.strokeRect(52.5, y + .5, 727, 61);
    context.fillStyle = colors.purple;
    context.font = `900 15px ${font}`;
    context.fillText(gearNames[row], 70, y + 38);
    data.slots.slice(row * 4, row * 4 + 4).forEach((slot, index) => {
      const x = 158 + index * 146;
      drawAbility(context, slot.iconUrl ? images.get(slot.iconUrl) : undefined, slot.short, x, y + 7, 48);
      context.fillStyle = colors.ink;
      context.font = `800 14px ${font}`;
      context.fillText(slot.short, x + 58, y + 28);
      context.fillStyle = colors.purple;
      context.font = `800 12px ${font}`;
      context.fillText(`${slot.ap}AP`, x + 58, y + 47);
    });
  }

  context.fillStyle = colors.ink;
  context.fillRect(806, 104, 346, 404);
  context.fillStyle = colors.acid;
  context.font = `800 13px ${font}`;
  context.fillText('ABILITY POINTS / 57AP', 832, 137);
  data.totals.slice(0, 7).forEach((total, index) => {
    const y = 158 + index * 47;
    drawAbility(context, total.iconUrl ? images.get(total.iconUrl) : undefined, total.short, 832, y, 36);
    context.fillStyle = '#ffffff';
    context.font = `700 15px ${font}`;
    context.fillText(total.short, 880, y + 23);
    context.textAlign = 'right';
    context.fillStyle = '#d9ff35';
    context.font = `900 15px ${font}`;
    context.fillText(`${total.ap}AP`, 1124, y + 23);
    context.textAlign = 'left';
  });

  context.fillStyle = '#e9e4ff';
  context.fillRect(52, 544, 1100, 54);
  context.fillStyle = colors.purple;
  context.font = `900 13px ${font}`;
  context.fillText('一句话', 72, 576);
  context.fillStyle = '#454152';
  context.font = `600 15px ${font}`;
  context.fillText(truncate(context, data.note, 960), 142, 576);
  context.textAlign = 'right';
  context.fillStyle = '#77727f';
  context.font = `700 12px ${font}`;
  context.fillText(`作者：${truncate(context, data.author || '匿名玩家', 230)}`, 1132, 527);
  context.textAlign = 'left';

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => result ? resolve(result) : reject(new Error('PNG export failed')), 'image/png');
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.download = sanitizePngFilename(data.title);
  anchor.href = url;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
