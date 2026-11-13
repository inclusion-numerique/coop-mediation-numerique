import type { DefaultValues } from '@app/web/libs/form/use-app-form'
import type { LieuDuCra } from './lieu/lieu-du-cra'
import type { CraData } from './validation/CraValidation'

const lieuDeDepart = (lieuxProposes: readonly LieuDuCra[]) => {
  const premier = lieuxProposes.at(0)
  return {
    id: premier?.id,
    nom: premier?.nom,
    adresse: premier?.adresse,
  }
}

export const valeursDeDepartDeMediation = (
  mediateurId: string,
  stateFromUrl: DefaultValues<CraData>,
  lieuxProposes: readonly LieuDuCra[],
) => ({
  ...stateFromUrl,
  ...(stateFromUrl.structure?.id == null
    ? { structure: lieuDeDepart(lieuxProposes) }
    : {}),
  date: stateFromUrl.date ?? new Date().toISOString().slice(0, 10),
  mediateurId: mediateurId,
  duree: stateFromUrl.duree ?? {},
  tags: stateFromUrl.tags ?? [],
})
