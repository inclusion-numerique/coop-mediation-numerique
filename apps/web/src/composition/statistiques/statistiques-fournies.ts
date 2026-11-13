import { compterLesAccompagnements } from '@app/web/features/activites/abilities/compter-les-accompagnements'
import { totauxPresentes } from '@app/web/features/activites/abilities/compter-les-accompagnements/ui'
import { compterLesAccompagnementsParCommune } from '@app/web/features/activites/abilities/compter-les-accompagnements-par-commune'
import { parCommunePresentes } from '@app/web/features/activites/abilities/compter-les-accompagnements-par-commune/ui'
import { compterLesAccompagnementsParLieu } from '@app/web/features/activites/abilities/compter-les-accompagnements-par-lieu'
import { parLieuPresentes } from '@app/web/features/activites/abilities/compter-les-accompagnements-par-lieu/ui'
import {
  compterLesAccompagnementsParPeriode,
  type FenetreDesGraphiques,
} from '@app/web/features/activites/abilities/compter-les-accompagnements-par-periode'
import { parPeriodePresentes } from '@app/web/features/activites/abilities/compter-les-accompagnements-par-periode/ui'
import { compterLesPersonnesAccompagneesParCommune } from '@app/web/features/activites/abilities/compter-les-personnes-accompagnees-par-commune'
import { personnesParCommunePresentees } from '@app/web/features/activites/abilities/compter-les-personnes-accompagnees-par-commune/ui'
import { decrireLesPersonnesAccompagnees } from '@app/web/features/activites/abilities/decrire-les-personnes-accompagnees'
import { profilPresente } from '@app/web/features/activites/abilities/decrire-les-personnes-accompagnees/ui'
import { repartirLesAccompagnements } from '@app/web/features/activites/abilities/repartir-les-accompagnements'
import { repartitionPresentee } from '@app/web/features/activites/abilities/repartir-les-accompagnements/ui'
import { repartirLesAccompagnementsParTag } from '@app/web/features/activites/abilities/repartir-les-accompagnements-par-tag'
import { parTagPresentes } from '@app/web/features/activites/abilities/repartir-les-accompagnements-par-tag/ui'
import { verifierLaPresenceDeCrasV1 } from '@app/web/features/activites/abilities/verifier-la-presence-de-cras-v1'
import type { DemandeDeStatistiques } from '@app/web/features/activites/db/statistiques.sql'

const aucune = <T>(): Promise<T[]> => Promise.resolve([])

export const statistiquesFournies = async (
  demande: DemandeDeStatistiques & {
    readonly parJour: FenetreDesGraphiques
    readonly parMois: FenetreDesGraphiques
  },
  {
    territoires,
    tags,
  }: { readonly territoires: boolean; readonly tags: boolean },
) => {
  const [
    totaux,
    parPeriode,
    repartition,
    parTag,
    parLieu,
    parCommune,
    profil,
    residences,
    crasV1,
  ] = await Promise.all([
    compterLesAccompagnements(demande),
    compterLesAccompagnementsParPeriode(demande),
    repartirLesAccompagnements(demande),
    tags ? repartirLesAccompagnementsParTag(demande) : aucune<never>(),
    territoires ? compterLesAccompagnementsParLieu(demande) : aucune<never>(),
    territoires
      ? compterLesAccompagnementsParCommune(demande)
      : aucune<never>(),
    decrireLesPersonnesAccompagnees(demande),
    territoires
      ? compterLesPersonnesAccompagneesParCommune(demande)
      : aucune<never>(),
    verifierLaPresenceDeCrasV1(demande.perimetre),
  ])
  return {
    totalCounts: totauxPresentes(totaux),
    ...parPeriodePresentes(parPeriode),
    beneficiaires: {
      ...profilPresente(profil),
      communes: personnesParCommunePresentees(residences),
    },
    activites: {
      ...repartitionPresentee(repartition),
      tags: parTagPresentes(parTag),
    },
    structures: parLieuPresentes(parLieu),
    communes: parCommunePresentes(parCommune),
    hasCrasV1: { hasCrasV1: crasV1 === 'Presents' },
  }
}

export type StatistiquesFournies = Awaited<
  ReturnType<typeof statistiquesFournies>
>
