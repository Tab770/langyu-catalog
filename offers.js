(() => {
  // Groups of different parts sold under the same 1688 offer ID.
  const splits = {
    '1038121540839': [
      ['Комплект обвеса Cadillac CT6', 'Комплекты обвеса', /^前唇\+/],
      ['Задняя накладка Cadillac CT6', 'Бамперы и накладки', /亮黑后唇/],
      ['Передняя накладка Cadillac CT6', 'Бамперы и накладки', /亮黑前唇/],
      ['Накладки порогов Cadillac CT6', 'Накладки порогов', /亮黑侧裙/],
    ],
    '924073310003': [
      ['Насадки выхлопа Cadillac CT5', 'Насадки выхлопа', /^尾喉$/],
      ['Задняя накладка с насадками Cadillac CT5', 'Бамперы и накладки', /后唇/],
    ],
    '924693732154': [
      ['Крылья Cadillac CT5 Blackwing', 'Крылья', /叶子板/],
      ['Передняя накладка Cadillac CT5 Blackwing', 'Бамперы и накладки', /前唇/],
      ['Накладки порогов Cadillac CT5 Blackwing', 'Накладки порогов', /侧裙/],
      ['Передний бампер Cadillac CT5 Blackwing', 'Бамперы и накладки', /前杠总成/],
    ],
    '860690122967': [
      ['Капот M3 для BMW E46', 'Капоты', /机盖/],
      ['Карбоновая решётка радиатора BMW E46', 'Решётки радиатора', /中网/],
    ],
    '853162384035': [
      ['Передний бампер Porsche 992 GT3', 'Бамперы и накладки', /前杠/],
      ['Задний бампер Porsche 992 GT3', 'Бамперы и накладки', /后杠/],
      ['Комплект обвеса Porsche 992 GT3', 'Комплекты обвеса', /全套包围/],
      ['Накладки порогов Porsche 992 GT3', 'Накладки порогов', /侧裙/],
    ],
    '848703458916': [
      ['Решётка радиатора Mercedes-Benz W222', 'Решётки радиатора', /中网/],
      ['Комплект обвеса Mercedes-Benz W222', 'Комплекты обвеса', /包围/],
      ['Передний бампер Mercedes-Benz W222', 'Бамперы и накладки', /前杠/],
    ],
    '848512748350': [
      ['Решётка радиатора BMW X6 E71', 'Решётки радиатора', /中网/],
      ['Антикрыло P для BMW X6 E71', 'Спойлеры и антикрылья', /尾翼/],
    ],
    '657211672061': [
      ['Передняя накладка BMW 3 Series GT F34', 'Бамперы и накладки', /前唇/],
      ['Комплект обвеса с капотом BMW 3 Series GT F34', 'Комплекты обвеса', /包围/],
      ['Накладки порогов BMW 3 Series GT F34', 'Накладки порогов', /侧裙/],
      ['Капот GTS BMW 3 Series GT F34', 'Капоты', /^GTS.*机盖/],
      ['Передний бампер BMW 3 Series GT F34', 'Бамперы и накладки', /前杠$/],
      ['Задний бампер BMW 3 Series GT F34', 'Бамперы и накладки', /后杠/],
    ],
  };

  function expand(row) {
    const groups = splits[row.id];
    if (!groups) return [row];
    const variants = groups.map(([, , pattern]) => row.skus.filter(sku => pattern.test(sku.name)));
    if (variants.some(group => !group.length) ||
        row.skus.some(sku => variants.filter(group => group.includes(sku)).length !== 1)) return [row];

    return groups.map(([displayTitle, category], index) => ({
      ...row,
      displayTitle,
      category,
      photos: row.photosByCategory?.[category] ?? row.photos,
      skus: variants[index],
      package_sizes: row.package_sizes?.filter(pack => variants[index].some(sku => sku.name === pack.sku)),
    }));
  }

  const minimumOrder = row => Math.max(1, row.moq ?? 1);
  const hasVariants = row => (row.skus?.length ?? 0) > 1;
  function unitPrice(row, sku) {
    if (sku?.price != null) return sku.price;
    const quantity = minimumOrder(row);
    const tier = row.price_tiers?.find(tier =>
      tier.min_quantity <= quantity && (tier.max_quantity == null || quantity <= tier.max_quantity));
    if (tier) return tier.price;
    const prices = row.skus?.map(sku => sku.price).filter(Number.isFinite);
    if (prices?.length) return Math.min(...prices);
    return row.price_max ?? row.price_min ?? row.price;
  }

  function packageFor(row, sku) {
    const packages = row.package_sizes ?? [];
    const named = packages.find(pack => sku && pack.sku === sku.name);
    if (named || row.displayTitle) return named;
    return packages.find(pack => !pack.sku) ?? (packages.length ? undefined : {weight_g: row.unit_weight_kg * 1000});
  }

  window.catalogOffers = {expand, minimumOrder, hasVariants, unitPrice, packageFor};
})();
