import { labelsToOptions } from '@app/ui/components/Form/utils/options'
import { NIVEAUX_D_ATELIER } from '../../domain'

export const niveauAtelierValues = NIVEAUX_D_ATELIER

export type NiveauAtelier = (typeof niveauAtelierValues)[number]

export const niveauAtelierLabels: {
  [key in NiveauAtelier]: string
} = {
  Debutant: 'Débutant',
  Intermediaire: 'Intermédiaire',
  Avance: 'Avancé',
}

export const niveauAtelierStars: {
  [key in NiveauAtelier]: number
} = {
  Debutant: 1,
  Intermediaire: 2,
  Avance: 3,
}

export const niveauAtelierOptions = labelsToOptions(niveauAtelierLabels)

export const niveauAtelierOptionsWithExtras = niveauAtelierOptions.map(
  ({ label, value }) => ({
    label,
    value,
    extra: {
      stars: niveauAtelierStars[value],
      maxStars: 3,
    },
  }),
)
