// Convert part of a Canvas into a dataURL
export function getImageDataAsDataUrl(canvas, x, y, width, height) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(x, y, width, height);

  const canvas2 = document.createElement('canvas');
  canvas2.width = width;// * 2;
  canvas2.height = height;// * 2;
  // canvas2.scale = 1;
  const ctx2 = canvas2.getContext('2d');

  ctx2.putImageData(imageData, 0, 0);
  const dataUrl = ctx2.canvas.toDataURL();
  return dataUrl;
}

export function clone(thing) {
  return JSON.parse(JSON.stringify(thing));
}

export function doZoomFloatValueSteps(out, value, steps) {
  const candidates = steps.filter(s => value >= s.from && value <= s.to);
  const step = candidates.length == 2
      ? (out
          ? candidates[0]
          : candidates[1]
      ) : candidates[0];

  const { increment } = step;

  return out ? value - increment : value + increment;
}

export function persistSettings({ component, localStorage, settingsKey }) {
  if (localStorage) {
      localStorage.setItem(settingsKey, JSON.stringify(component.state.settings))
  }
}

export function recoverSettings({ component, localStorage, settingsKey }, then = () => { }) {
  const ls = localStorage.getItem(settingsKey);
  let recoveredSettings;
  try {
      recoveredSettings = JSON.parse(ls);
  }
  catch { }

  const { settings } = component.state;
  if (recoveredSettings && recoveredSettings.settingsVersion === settings.settingsVersion) {
      component.setState({ settings: recoveredSettings }, then)
  }
}

export function removeProps(ob, excludeProps = []) {
  return Object.entries(ob).filter(([k, _]) => !excludeProps.includes(k)).reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
}

// mirror the contents of the title attributes of the specified svg elements into a dynamically created 'svg:title' child element
export function svgMirrorTitles(svgElems) {
  if (svgElems) {
      [...svgElems].forEach(svgMirrorTitle);
  }
}

export const svgNs = 'http://www.w3.org/2000/svg';

export function px(value) {
  return `${value}${value !== 0 ? 'px' : ''}`;
}
