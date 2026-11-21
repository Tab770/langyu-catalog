(() => {
  // Keys are 1688 IDs. For split cards, append ":" and their original
  // SKU names sorted and joined with "|". Records contain description,
  // priceRub (single offer) and optional variants keyed by original SKU name.
  const listings = {};

  function listingFor(row, sku) {
    const key = row.displayTitle
      ? row.id + ':' + row.skus.map(option => option.name).sort().join('|')
      : row.id;
    const listing = listings[key];
    const variant = sku && listing?.variants?.[sku.name];
    return {
      description: variant?.description ?? listing?.description ?? '',
      priceRub: row.skus?.length > 1 ? variant?.priceRub : variant?.priceRub ?? listing?.priceRub,
    };
  }

  window.catalogAvito = {listingFor};
})();
