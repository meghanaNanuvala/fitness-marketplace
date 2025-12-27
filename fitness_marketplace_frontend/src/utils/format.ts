export const formatUSD = (centsVal: number) =>
  (centsVal / 100).toLocaleString(undefined, { style: "currency", currency: "USD" });

export const toCents = (dollars: number) => Math.round(dollars * 100);

export const uid = () => Math.random().toString(36).slice(2, 10);
