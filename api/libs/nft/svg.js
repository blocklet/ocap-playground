/* eslint-disable no-param-reassign */
/* eslint-disable no-bitwise */
/* eslint-disable camelcase */
const genSVG = (a, b, h = 200, w = h * 0.8) => {
  const comp = !b || b === 'undefined';
  a = validateHex(a);
  b = !comp ? b : (0xffffff - parseInt(`0x${a}`, 16)).toString(16);
  b = validateHex(b);
  const svg =
    `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">\n` +
    `<polygon points="0,0 0,${h} ${w},${h} ${w / 4.0},${h / 2.0}" fill="#${b}"/>\n` +
    `<polygon points="0,${h} ${w / 1.6},${(3.0 * h) / 4.0} ${w / 4.0},${
      h / 2.0
    }" fill="#FFFFFF" fill-opacity="0.2"/>\n` +
    `<polygon points="0,0 ${w},0 ${w / 4.0},${h / 2.0} 0,${h}" fill="#${a}"/>\n` +
    `<polygon points="0,0 ${w / 4.0},${h / 2.0} ${w / 1.6},${h / 4.0}" fill="#FFFFFF" fill-opacity="0.2"/>\n` +
    `<polygon points="0,0 0,${h} ${w / 4.0},${h / 2.0}" fill="${
      comp ? '#FFFFFF" fill-opacity="0.4' : additiveBlend(a, b)
    }" />` +
    `<polygon points="0,${h / 2.0} ${w / 4.0},${h / 2.0} 0,${h}" fill="#555555" fill-opacity="0.1" />` +
    `<polygon points="${w},${h} ${w / 4.0},${h / 2.0} 0,${h / 2.0}" fill="#555555" fill-opacity="0.2" />` +
    `<polygon points="${w},0 ${w / 4.0},${h / 2.0} 0,${h / 2.0}" fill="#555555" fill-opacity="0.2" />` +
    '</svg>';
  return svg;
};

const additiveBlend = (a, b) => {
  const a_rgb = hexToRgb(a);
  const b_rgb = hexToRgb(b);
  const scale_factor = 0.75;
  const c_rgb = {
    r: Math.min(Math.floor((a_rgb.r + b_rgb.r) * scale_factor), 255),
    g: Math.min(Math.floor((a_rgb.g + b_rgb.g) * scale_factor), 255),
    b: Math.min(Math.floor((a_rgb.b + b_rgb.b) * scale_factor), 255),
  };
  return `#${((1 << 24) + (c_rgb.r << 16) + (c_rgb.g << 8) + c_rgb.b).toString(16).slice(1)}`;
};

const validateHex = hex => {
  let color = hex.replace('#', '', -1);
  if (hex.length === 3) {
    color = hex
      .split('')
      .map(c => c + c)
      .join('');
  }
  while (color.length < 6) {
    color = `0${color}`;
  }
  return muteColor(color);
};

const hexToRgb = hex => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const muteColor = color => {
  let sum = 0;
  for (let i = 0; i < 6; i += 2) {
    sum += parseInt(color.substring(i, i + 1), 16);
  }
  let newColor = color;
  if (sum >= 30) newColor = (parseInt(`0x${newColor}`, 16) - (sum > 40 ? 0x202020 : 0x101010)).toString(16);
  return newColor;
};

const randomSVG = (size = 200) => {
  const hexa = validateHex(Math.floor(Math.random() * 0xffffff).toString(16));
  const hexb = validateHex(Math.floor(Math.random() * 0xffffff).toString(16));
  return genSVG(hexa, Math.random() < 0.5 ? hexb : null, size);
};

module.exports = {
  genSVG,
  randomSVG,
};
