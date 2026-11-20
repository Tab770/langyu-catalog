(() => {
  const fields = ['rate', 'flat', 'perKg', 'divisor'];
  const defaults = Object.fromEntries(fields.map(key => [key, 0]));
  const clean = settings => Object.fromEntries(fields.map(key => {
    const value = Number(settings?.[key]);
    return [key, Number.isFinite(value) && value >= 0 ? value : 0];
  }));
  const storageKey = 'langyu-catalog-pricing-v1';
  function load() {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return clean(JSON.parse(saved));
    } catch {}
    return clean(window.catalogSettings ?? defaults);
  }
  function save(settings) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(clean(settings)));
      return true;
    } catch {
      return false;
    }
  }
  function delivery(pack, settings) {
    if (!settings.perKg) return settings.flat;
    const weight = pack?.weight_g / 1000;
    if (!(weight >= 0.1)) return null;
    let billable = weight;
    if (settings.divisor) {
      const dims = [pack.length_cm, pack.width_cm, pack.height_cm];
      if (!dims.every(n => Number.isFinite(n) && n > 0 && n <= 240)) return null;
      billable = Math.max(weight, dims.reduce((volume, n) => volume * n, 1) / settings.divisor);
    }
    return settings.flat + billable * settings.perKg;
  }
  window.pricing = {clean, load, save, delivery};
})();
