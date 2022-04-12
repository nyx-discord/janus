const quotesRegexp = /[^\s"]+|"([^"]*)"/gi;

/** Split by spaces and "" */
export function split(str: string): string[] {
  const splitArray: string[] = [];
  let match;
  do {
    match = quotesRegexp.exec(str);
    if (match != null) {
      splitArray.push(match[1] ? match[1] : match[0]);
    }
  } while (match != null);
  return splitArray;
}

/** Capitalize the first letter of each string */
export function capitalize(string: string): string { return string.charAt(0).toUpperCase() + string.slice(1); }

/** Turn a string to tile case */
export function toTitleCase(s: string): string {
  return s.toLowerCase().replace(/^(\w)|\s(\w)/g, (c) => c.toUpperCase());
}
