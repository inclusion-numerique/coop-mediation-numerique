export const nomAffiche = (
  nom: string,
  nomUsage: string | null | undefined,
): string => (nomUsage?.trim() ? nomUsage : nom)
