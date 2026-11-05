import type { ReactNode } from 'react'
import type { TypeDePortee } from '../domain'

export const APPARENCE_DE_VISIBILITE: Record<
  Exclude<TypeDePortee, 'National'>,
  { libelle: string; aide: string; illustration: ReactNode }
> = {
  Personnel: {
    libelle: 'Tag personnel',
    aide: 'Visible uniquement par vous.',
    illustration: (
      <span
        className="ri-account-circle-line ri-xl fr-line-height-1 fr-text-mention--grey fr-background-contrast--grey fr-p-2w fr-my-2w fr-border-radius--8"
        aria-hidden="true"
      />
    ),
  },
  Equipe: {
    libelle: "Tag d'équipe",
    aide: 'Visible et éditable par les membres de cette équipe.',
    illustration: (
      <span
        className="ri-group-2-line ri-xl fr-line-height-1 fr-text-title--brown-caramel-sun-425 fr-background-alt--brown-caramel-950 fr-p-2w fr-my-2w fr-border-radius--8"
        aria-hidden="true"
      />
    ),
  },
  Departemental: {
    libelle: 'Tag départemental',
    aide: "Visible par l'ensemble des médiateurs numériques du département.",
    illustration: (
      <span
        className="ri-map-pin-range-line ri-xl fr-line-height-1 fr-text-default--info fr-background-contrast--info fr-p-2w fr-my-2w fr-border-radius--8"
        aria-hidden="true"
      />
    ),
  },
}
