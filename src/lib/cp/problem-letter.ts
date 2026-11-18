// Problems are shown as letters in level order: the first published problem is A, then B, C ...
export function problemLetter(index: number): string {
  return index < 26 ? String.fromCharCode(65 + index) : `${problemLetter(Math.floor(index / 26) - 1)}${problemLetter(index % 26)}`;
}
