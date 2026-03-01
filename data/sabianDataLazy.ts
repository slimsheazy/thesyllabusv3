// Lazy-loaded Sabian symbols data to reduce initial bundle size
export const loadSabianSymbols = async() => {
  const { SABIAN_SYMBOLS } = await import('./sabianData');
  return SABIAN_SYMBOLS;
};

export const loadSabianInterpretations = async() => {
  const { HARDCODED_INTERPRETATIONS } = await import('./sabianInterpretations');
  return HARDCODED_INTERPRETATIONS;
};
