import type { DefaultValues } from 'react-hook-form'
import type { CraData } from './validation/CraValidation'

export const valeursDeDepartDeMediation = (
  mediateurId: string,
  stateFromUrl: DefaultValues<CraData>,
  lieuxActiviteOptions: {
    value: string
    extra?: { nom: string; adresse: string }
  }[],
) => ({
  ...stateFromUrl,
  ...(stateFromUrl.structure?.id == null
    ? {
        structure: {
          id: lieuxActiviteOptions.at(0)?.value,
          ...lieuxActiviteOptions.at(0)?.extra,
        },
      }
    : {}),
  date: stateFromUrl.date ?? new Date().toISOString().slice(0, 10),
  mediateurId: mediateurId,
  duree: stateFromUrl.duree ?? {},
  tags: stateFromUrl.tags ?? [],
})
