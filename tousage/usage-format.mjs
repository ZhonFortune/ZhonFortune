const filePattern = /^(?:magpie_usage_)?[a-f0-9]{8,64}-(\d{4}-\d{2}-\d{2})\.magpie-usage$/;

export const envelopeFormat = "magpie-data";
export const usageObjectPrefix = "magpie/usage/";

export function usageFileDate(fileName) {
  return filePattern.exec(fileName)?.[1];
}
