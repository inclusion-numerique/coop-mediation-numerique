export const valeurDe =
  <K extends string, V>(table: Readonly<Record<K, V>>) =>
  (cle: K): V =>
    table[cle]
