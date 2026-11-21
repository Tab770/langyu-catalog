(() => {
  // Keys are 1688 IDs. For an offer split into several cards, append ":"
  // and the original SKU names for the card, sorted and joined with "|".
  const descriptions = {};

  window.avitoDescription = row => {
    const key = row.displayTitle
      ? row.id + ':' + row.skus.map(sku => sku.name).sort().join('|')
      : row.id;
    return descriptions[key] ?? '';
  };
})();
