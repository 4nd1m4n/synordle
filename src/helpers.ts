import { config } from "./config";

export function lp(...args) {
  if (config.logProgress) console.log(...args);
}

export function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function subArray(array, start, count) {
  return array.filter((_, index) => {
    return index >= start && index < count + start;
  });
}

export function uniqueFlattenedArrayOfObjectsByKey(
  nestedItems: Object[][],
  key: string
) {
  return nestedItems.reduce((accumulated, items) => {
    items.forEach((item) => {
      const value = item[key];
      if (!accumulated.includes(value)) accumulated.push(value);
    });
    return accumulated;
  }, []);
}
