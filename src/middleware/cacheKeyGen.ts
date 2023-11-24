// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateCacheKey(uniqueKey: string, params: any, query: any): string {
  const keyParts = Object.entries({ ...params, ...query }).map(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ([_, value]) => `${uniqueKey}/${value}`,
  );
  return keyParts[0];
}
