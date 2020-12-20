const hexToRgb = (hexColor) => {
  const r = parseInt(hexColor.substr(0, 2), 16);
  const g = parseInt(hexColor.substr(2, 2), 16);
  const b = parseInt(hexColor.substr(4, 2), 16);
  return [r, g, b];
};

const rgbToHsl = (rBase, gBase, bBase) => {
  const r = rBase / 255;
  const g = gBase / 255;
  const b = bBase / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max === min) {
    // achromatic
    h = 0;
    s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    // eslint-disable-next-line default-case
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return [Math.floor(h * 360), Math.floor(s * 100), Math.floor(l * 100)];
};

export default function getLabelStyle(hexColor) {
  // Convert hex color to rgb and hsl
  const [r, g, b] = hexToRgb(hexColor);
  const [h, s, l] = rgbToHsl(r, g, b);
  // Constants
  const lightnessThreshold = 0.6;
  const backgroundAlpha = 0.18;
  const borderAlpha = 0.3;

  const perceivedLightness = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 255;
  const lightnessSwitch = Math.max(
    0,
    Math.min((perceivedLightness - lightnessThreshold) * -1000, 1)
  );
  const lightenBy =
    (lightnessThreshold - perceivedLightness) * 100 * lightnessSwitch;

  return {
    backgroundColor: `rgba(${r}, ${g}, ${b}, ${backgroundAlpha})`,
    color: `hsl(${h}, ${s}%, ${l + lightenBy}%)`,
    borderColor: `hsla(${h}, ${s}%, ${l + lightenBy}%, ${borderAlpha})`,
  };
}
