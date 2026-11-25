import type { DefaultValues } from '@/libraries/formulaire'
import type { CraData } from '../../forms/cra.validation'
import type { LieuDuCra } from './lieu-du-cra.presenter'

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
