import { compterLesAccompagnements } from '@/features/activites/abilities/compter-les-accompagnements/implementations/prisma/totaux-des-accompagnements.query'
import { totauxPresentes } from '@/features/activites/abilities/compter-les-accompagnements/ui/presenters/totaux.presenter'
import { compterLesAccompagnementsParCommune } from '@/features/activites/abilities/compter-les-accompagnements-par-commune/implementations/prisma/accompagnements-par-commune.query'
import { parCommunePresentes } from '@/features/activites/abilities/compter-les-accompagnements-par-commune/ui/presenters/par-commune.presenter'
import { compterLesAccompagnementsParLieu } from '@/features/activites/abilities/compter-les-accompagnements-par-lieu/implementations/prisma/accompagnements-par-lieu.query'
import { parLieuPresentes } from '@/features/activites/abilities/compter-les-accompagnements-par-lieu/ui/presenters/par-lieu.presenter'
import { type FenetreDesGraphiques } from '@/features/activites/abilities/compter-les-accompagnements-par-periode/domain/index'
import { compterLesAccompagnementsParPeriode } from '@/features/activites/abilities/compter-les-accompagnements-par-periode/implementations/prisma/accompagnements-par-periode.query'
import { parPeriodePresentes } from '@/features/activites/abilities/compter-les-accompagnements-par-periode/ui/presenters/par-periode.presenter'
import { compterLesPersonnesAccompagneesParCommune } from '@/features/activites/abilities/compter-les-personnes-accompagnees-par-commune/implementations/prisma/personnes-par-commune.query'
import { personnesParCommunePresentees } from '@/features/activites/abilities/compter-les-personnes-accompagnees-par-commune/ui/presenters/personnes-par-commune.presenter'
import { decrireLesPersonnesAccompagnees } from '@/features/activites/abilities/decrire-les-personnes-accompagnees/implementations/prisma/profil-des-personnes-accompagnees.query'
import { profilPresente } from '@/features/activites/abilities/decrire-les-personnes-accompagnees/ui/presenters/profil.presenter'
import { repartirLesAccompagnements } from '@/features/activites/abilities/repartir-les-accompagnements/implementations/prisma/repartition-des-accompagnements.query'
import { repartitionPresentee } from '@/features/activites/abilities/repartir-les-accompagnements/ui/presenters/repartition.presenter'
import { repartirLesAccompagnementsParTag } from '@/features/activites/abilities/repartir-les-accompagnements-par-tag/implementations/prisma/accompagnements-par-tag.query'
import { parTagPresentes } from '@/features/activites/abilities/repartir-les-accompagnements-par-tag/ui/presenters/par-tag.presenter'
import { verifierLaPresenceDeCrasV1 } from '@/features/activites/abilities/verifier-la-presence-de-cras-v1/implementations/prisma/presence-de-cras-v1.query'
import type { DemandeDeStatistiques } from '@/features/activites/implementations/prisma/statistiques.sql'

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

export type StatistiquesFournies = Awaited<ReturnType<typeof rassembler>>

export const toutesLesStatistiques = (enCours: StatistiquesEnCours) =>
  suivie(rassembler(enCours))

export const nombreDAccompagnements = (
  toutes: ReturnType<typeof toutesLesStatistiques>,
) => suivie(toutes.then(({ totalCounts }) => totalCounts.accompagnements.total))
