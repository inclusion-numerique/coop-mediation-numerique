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

const suivie = <T>(promesse: Promise<T>): Promise<T> => {
  promesse.catch(() => undefined)
  return promesse
}

export const statistiquesEnCours = (
  demande: DemandeDeStatistiques & {
    readonly parJour: FenetreDesGraphiques
    readonly parMois: FenetreDesGraphiques
  },
  {
    territoires,
    tags,
  }: { readonly territoires: boolean; readonly tags: boolean },
) => ({
  totalCounts: suivie(compterLesAccompagnements(demande).then(totauxPresentes)),
  periode: suivie(
    compterLesAccompagnementsParPeriode(demande).then(parPeriodePresentes),
  ),
  repartition: suivie(
    repartirLesAccompagnements(demande).then(repartitionPresentee),
  ),
  tags: suivie(
    (tags ? repartirLesAccompagnementsParTag(demande) : aucune<never>()).then(
      parTagPresentes,
    ),
  ),
  structures: suivie(
    (territoires
      ? compterLesAccompagnementsParLieu(demande)
      : aucune<never>()
    ).then(parLieuPresentes),
  ),
  communes: suivie(
    (territoires
      ? compterLesAccompagnementsParCommune(demande)
      : aucune<never>()
    ).then(parCommunePresentes),
  ),
  profil: suivie(decrireLesPersonnesAccompagnees(demande).then(profilPresente)),
  residences: suivie(
    (territoires
      ? compterLesPersonnesAccompagneesParCommune(demande)
      : aucune<never>()
    ).then(personnesParCommunePresentees),
  ),
  hasCrasV1: suivie(
    verifierLaPresenceDeCrasV1(demande.perimetre).then((crasV1) => ({
      hasCrasV1: crasV1 === 'Presents',
    })),
  ),
})

export type StatistiquesEnCours = ReturnType<typeof statistiquesEnCours>

export const rassembler = async (enCours: StatistiquesEnCours) => {
  const [
    totalCounts,
    periode,
    repartition,
    parTag,
    structures,
    communes,
    profil,
    residences,
    hasCrasV1,
  ] = await Promise.all([
    enCours.totalCounts,
    enCours.periode,
    enCours.repartition,
    enCours.tags,
    enCours.structures,
    enCours.communes,
    enCours.profil,
    enCours.residences,
    enCours.hasCrasV1,
  ])
  return {
    totalCounts,
    ...periode,
    beneficiaires: { ...profil, communes: residences },
    activites: { ...repartition, tags: parTag },
    structures,
    communes,
    hasCrasV1,
  }
}

export const statistiquesFournies = (
  demande: Parameters<typeof statistiquesEnCours>[0],
  options: Parameters<typeof statistiquesEnCours>[1],
) => rassembler(statistiquesEnCours(demande, options))

export type StatistiquesFournies = Awaited<ReturnType<typeof rassembler>>

export const toutesLesStatistiques = (enCours: StatistiquesEnCours) =>
  suivie(rassembler(enCours))

export const nombreDAccompagnements = (
  toutes: ReturnType<typeof toutesLesStatistiques>,
) => suivie(toutes.then(({ totalCounts }) => totalCounts.accompagnements.total))
