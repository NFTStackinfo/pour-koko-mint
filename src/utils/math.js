export const normalizeMinMax = (count, min, max) =>
  count > max
    ? max
    : count < min
      ? min
      : count

export const fixImpreciseNumber = number => parseFloat(number.toPrecision(12))
