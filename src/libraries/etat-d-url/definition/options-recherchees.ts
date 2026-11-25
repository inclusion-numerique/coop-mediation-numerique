import { contientSansAccent } from '@/libraries/texte'

const OPTIONS_TROUVEES = 10

export const optionsRecherchees = <O extends { readonly label: string }>(
  options: readonly O[],
  recherche: string,
): readonly O[] =>
  options
    .filter(({ label }) => contientSansAccent(label, recherche))
    .slice(0, OPTIONS_TROUVEES)
