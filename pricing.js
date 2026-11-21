(() => {
  const dimensions = [
    ['length_cm', 'длину'],
    ['width_cm', 'ширину'],
    ['height_cm', 'высоту'],
  ];
  const validDimension = value => Number.isFinite(value) && value>0 && value<=240;
  function dimensionsToCheck(pack) {
    return dimensions.filter(([key]) => !validDimension(pack?.[key])).map(([, label]) => label);
  }
  function volume(pack) {
    if (dimensionsToCheck(pack).length) return null;
    return dimensions.reduce((product, [key]) => product * pack[key], 1) / 1000000;
  }
  function delivery(pack, settings) {
    if (settings.usdPerM3 === 0) return 0;
    if (!settings.usdRate) return null;
    const cubicMetres = volume(pack);
    return cubicMetres === null ? null : cubicMetres * settings.usdPerM3 * settings.usdRate;
  }
  window.pricing = {volume, delivery, dimensionsToCheck};
})();
