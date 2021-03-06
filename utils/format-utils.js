import {rgb} from 'd3-color';

export const normalizeParam = p => {
  if (p.type === 'function') {
    let displayValue = p.value.toString();
    // pretty print function code:
    // convert `function funcName(d) {...}` to `d => {...}`
    displayValue = displayValue.replace(/^function (\w+)?\((\w*?)\)/, '$2 =>');
    // convert `function funcName(d, i) {...}` to `(d, i) => {...}`
    displayValue = displayValue.replace(/^function (\w+)?(\(.*?\))/, '$2 =>');
    // convert `d => {return 1}` to `d => 1`
    displayValue = displayValue.replace(/\{\s*return\s*(.*?);?\s*\}$/, '$1');
    return {...p, displayValue};
  }
  if (p.type === 'json') {
    return {...p, displayValue: JSON.stringify(p.value)};
  }
  if (p.type === 'color') {
    return {...p, displayValue: colorToHex(p.value)};
  }
  return {...p, displayValue: String(p.value)};
};

export const readableInteger = x => {
  if (!x) {
    return 0;
  }
  if (x < 1000) {
    return x.toString();
  }
  x /= 1000;
  if (x < 1000) {
    return `${x.toFixed(3)}`;
  }
  x /= 1000;
  return `${x.toFixed(3)}`;
};

export function colorToHex(color) {
  return colorToRGBArray(color).reduce(
    (acc, v) => `${acc}${v < 16 ? '0' : ''}${v.toString(16)}`,
    '#'
  );
}

export function colorToRGBArray(color) {
  if (Array.isArray(color)) {
    return color.slice(0, 3);
  }
  const c = rgb(color);
  return [c.r, c.g, c.b];
}