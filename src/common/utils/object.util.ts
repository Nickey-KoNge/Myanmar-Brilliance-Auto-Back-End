export function getChanges(
  oldObj: Record<string, unknown>,
  newObj: Record<string, unknown>,
): { oldVals: Record<string, unknown>; newVals: Record<string, unknown> } {
  const oldVals: Record<string, unknown> = {};
  const newVals: Record<string, unknown> = {};

  if (!oldObj || !newObj) return { oldVals, newVals };
  Object.keys(newObj).forEach((key) => {
    if (oldObj[key] !== newObj[key] && newObj[key] !== undefined) {
      oldVals[key] = oldObj[key];
      newVals[key] = newObj[key];
    }
  });

  return { oldVals, newVals };
}
