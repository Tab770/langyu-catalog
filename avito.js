(() => {
  // Keys are 1688 IDs. For split cards, append ":" and their original
  // SKU names sorted and joined with "|". A variant can override the
  // description using its original SKU name as the key.
  const listings = {};
  const rates = {rate: 15, usdRate: 100, usdPerM3: 300};
  const goodsMultiplier = 2;
  const priceIncrementRub = 100;

  function listingFor(row, sku) {
    const key = row.displayTitle
      ? row.id + ':' + row.skus.map(option => option.name).sort().join('|')
      : row.id;
    const listing = listings[key];
    const variant = sku && listing?.variants?.[sku.name];
    const goods = window.catalogOffers.unitPrice(row, sku);
    const pack = window.catalogOffers.packageFor(row, sku);
    const shipping = window.pricing.delivery(pack, rates);
    const quantity = window.catalogOffers.minimumOrder(row);
    const hasTier = row.price_tiers?.some(tier =>
      tier.min_quantity<=quantity && (tier.max_quantity==null || tier.max_quantity>=quantity));
    const needsPrice = !Number.isFinite(goods) || goods<=0 || (row.price_tiers?.length && !hasTier) ||
      (sku && sku.price==null && !hasTier && (row.price_min!==row.price_max || row.skus.some(option=>option.price!=null)));
    const goodsRub = needsPrice ? null : goods * rates.rate;
    const dimensions = window.pricing.dimensionsToCheck(pack);
    const missing = [
      ...(needsPrice ? ['Уточните цену одной детали в этом исполнении.'] : []),
      ...(dimensions.length ? ['Уточните '+new Intl.ListFormat('ru').format(dimensions)+' упаковки в сантиметрах.'] : []),
    ];
    const totalRub = goodsRub!==null && shipping!==null ? goodsRub + shipping : null;
    return {
      goodsRub,
      missing,
      shippingRub: shipping,
      description: variant?.description ?? listing?.description ?? '',
      priceRub: totalRub===null ? null : Math.round(totalRub),
      avitoPriceRub: totalRub===null ? null
        : Math.round((goodsRub * goodsMultiplier + shipping) / priceIncrementRub) * priceIncrementRub,
    };
  }

  window.catalogAvito = {listingFor};
})();
