(() => {
  const rules = [
    ['dry-carbon', 'Сухой карбон', /干碳/],
    ['wet-carbon', 'Мокрый карбон', /湿碳/],
    ['carbon', 'Карбон без уточнения', /碳[纤钎纖]|单面碳|双面碳|\bCF\b/i],
    ['carbon-look', 'Рисунок под карбон', /碳[纤纖]纹|仿碳|水转印/],
    ['fiberglass', 'Стеклопластик (FRP)', /玻璃纤维|玻纤|玻璃钢|\bFRP\b/i],
    ['resin', 'Полимерная смола', /树脂/],
    ['steel', 'Сталь и железо', /碳钢|钢板|铁|鋼/],
    ['aluminium', 'Алюминий', /铝|鋁/],
    ['abs', 'ABS-пластик', /ABS/i],
    ['pp', 'PP-пластик', /(?:^|[^a-z])PP(?:[^a-z]|$)/i],
    ['plastic', 'Пластик без уточнения', /塑料/],
  ];
  const labels = new Map(rules.map(([key, label]) => [key, label]));

  function read(text = '') {
    const materials = rules.filter(([, , pattern]) => pattern.test(text)).map(([key]) => key);
    return materials.filter(key => {
      if (key === 'carbon') {
        return !materials.some(value => value === 'dry-carbon' || value === 'wet-carbon' || value === 'carbon-look');
      }
      if (key === 'plastic') return !materials.includes('abs') && !materials.includes('pp');
      return true;
    });
  }

  function options(row) {
    const variants = row.skus ?? [];
    const named = variants.map(sku => read(sku.name.split(/[+＋（(]/)[0]));
    const title = row.displayTitle ? [] : read(row.title);
    const specification = row.displayTitle ? [] : read((row.specs ?? [])
      .filter(spec => /材质|材料/.test(spec.name)).map(spec => spec.value).join(' '));
    const fallback = title.length ? title : specification;

    if (!variants.length) return [{index: 0, sku: undefined, materials: fallback}];

    const someNamed = named.some(materials => materials.length);
    return variants.map((sku, index) => ({
      index,
      sku,
      materials: named[index].length ? named[index] : someNamed ? [] : fallback,
    }));
  }

  window.catalogMaterials = {labels, options};
})();
