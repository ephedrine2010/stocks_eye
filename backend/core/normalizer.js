// The one internal model. Every source adapter returns data in these shapes so the
// rest of the app never knows or cares which source answered.

// Quote — a price reading for a market's headline instrument.
export function makeQuote({ price, changePct, spark = [], source, currency = 'USD' }) {
  return {
    price: Number(price),
    changePct: Number(changePct),
    currency,
    spark: spark.map(Number),
    source,
    as_of: new Date().toISOString(),
  };
}

// News item.
export function makeNews({ headline, url = '#', source, sentiment = 'neut', published }) {
  return { headline, url, source, sentiment, published };
}

// AI advice for one market.
export function makeTake({ sentiment = 'neut', text, citations = [], source = 'mock' }) {
  return { sentiment, text, citations, source, as_of: new Date().toISOString() };
}

export default { makeQuote, makeNews, makeTake };
