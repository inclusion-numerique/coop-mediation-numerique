/**
 * Sous quel nom un lieu se montre.
 *
 * Un lieu immatriculé porte deux noms : sa raison sociale, qui vient de SIRENE
 * et ne se corrige pas, et son nom d'usage, que le médiateur choisit justement
 * pour paraître autrement. Partout où le lieu se montre, c'est le second qui
 * prime — sans quoi le même lieu s'appelle autrement selon l'écran, ce qui
 * était le cas entre la liste des lieux et sa fiche.
 */
export const nomAffiche = (
  nom: string,
  nomUsage: string | null | undefined,
): string => (nomUsage?.trim() ? nomUsage : nom)
