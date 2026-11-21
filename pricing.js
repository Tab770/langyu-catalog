(() => {
  const defaults = {rate: 0, usdRate: 0, usdPerM3: 300};
  const fields = Object.keys(defaults);
  const clean = settings => Object.fromEntries(fields.map(key => {
    const value = Number(settings?.[key] ?? defaults[key]);
    return [key, Number.isFinite(value) && value >= 0 ? value : defaults[key]];
  }));
  const storageKey = 'langyu-catalog-pricing-v1';
  function load() {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return clean({...window.catalogSettings, ...JSON.parse(saved)});
    } catch {}
    return clean(window.catalogSettings);
  }
  function save(settings) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(clean(settings)));
      return true;
    } catch {
      return false;
    }
  }
  function volume(pack) {
    const dims = [pack?.length_cm, pack?.width_cm, pack?.height_cm];
    if (!dims.every(n => Number.isFinite(n) && n > 0 && n <= 240)) return null;
    return dims.reduce((product, n) => product * n, 1) / 1000000;
  }
  function delivery(pack, settings) {
    if (settings.usdPerM3 === 0) return 0;
    if (!settings.usdRate) return null;
    const cubicMetres = volume(pack);
    return cubicMetres === null ? null : cubicMetres * settings.usdPerM3 * settings.usdRate;
  }
  window.pricing = {clean, load, save, volume, delivery};
})();
