(() => {
  // Keys are 1688 IDs. For split cards, append ":" and their original
  // SKU names sorted and joined with "|". A variant can override the
  // description using its original SKU name as the key.
  const listings = {};
  const rates = {rate: 15, usdRate: 100, usdPerM3: 300};

  function listingFor(row, sku) {
    const key = row.displayTitle
      ? row.id + ':' + row.skus.map(option => option.name).sort().join('|')
      : row.id;
    const listing = listings[key];
    const variant = sku && listing?.variants?.[sku.name];
    const goods = window.catalogOffers.unitPrice(row, sku);
    const pack = window.catalogOffers.packageFor(row, sku);
    const shipping = window.pricing.delivery(pack, rates);
    return {
      description: variant?.description ?? listing?.description ?? '',
      priceRub: Number.isFinite(goods) && goods>0 && shipping!==null
        ? Math.round(goods * rates.rate + shipping)
        : null,
    };
  }

  window.catalogAvito = {listingFor};
})();
