import type { PerimetreDesStatistiques } from '@/features/activites/domain'
import type { FenetreDesGraphiques } from '@/features/activites/domain/fenetre-des-graphiques'
import type { DemandeDeStatistiques } from './statistiques.sql'

export type DemandeDeStatistiquesFenetree = DemandeDeStatistiques & {
  readonly parJour: FenetreDesGraphiques
  readonly parMois: FenetreDesGraphiques
}

type Source<T> = (demande: DemandeDeStatistiquesFenetree) => Promise<T>

type SourceOptionnelle<T> = (
  demande: DemandeDeStatistiquesFenetree | null,
) => Promise<T>

type Totaux = { readonly accompagnements: { readonly total: number } }

export type SourcesDesStatistiques<
  T extends Totaux,
  Periode extends object,
  Repartition extends object,
  ParTag,
  ParLieu,
  ParCommune,
  Profil extends object,
  Residences,
> = {
  readonly totalCounts: Source<T>
  readonly periode: Source<Periode>
  readonly repartition: Source<Repartition>
  readonly tags: SourceOptionnelle<ParTag>
  readonly structures: SourceOptionnelle<ParLieu>
  readonly communes: SourceOptionnelle<ParCommune>
  readonly profil: Source<Profil>
  readonly residences: SourceOptionnelle<Residences>
  readonly hasCrasV1: (
    perimetre: PerimetreDesStatistiques,
  ) => Promise<{ readonly hasCrasV1: boolean }>
}

export const source =
  <Lu, Presente>(
    lire: (demande: DemandeDeStatistiquesFenetree) => Promise<Lu>,
    presenter: (lu: Lu) => Presente,
  ): Source<Presente> =>
  (demande) =>
    lire(demande).then(presenter)

export const sourceOptionnelle =
  <Ligne, Presente>(
    lire: (demande: DemandeDeStatistiquesFenetree) => Promise<readonly Ligne[]>,
    presenter: (lignes: readonly Ligne[]) => Presente,
  ): SourceOptionnelle<Presente> =>
  (demande) =>
    (demande === null ? Promise.resolve([]) : lire(demande)).then(presenter)

export type LancerLesStatistiques<EnCours> = (
  demande: DemandeDeStatistiquesFenetree,
  options: { readonly territoires: boolean; readonly tags: boolean },
) => EnCours

const suivie = <T>(promesse: Promise<T>): Promise<T> => {
  promesse.catch(() => undefined)
  return promesse
}

export type EnCours<
  T extends Totaux = Totaux,
  Periode extends object = object,
  Repartition extends object = object,
  ParTag = unknown,
  ParLieu = unknown,
  ParCommune = unknown,
  Profil extends object = object,
  Residences = unknown,
> = {
  readonly totalCounts: Promise<T>
  readonly periode: Promise<Periode>
  readonly repartition: Promise<Repartition>
  readonly tags: Promise<ParTag>
  readonly structures: Promise<ParLieu>
  readonly communes: Promise<ParCommune>
  readonly profil: Promise<Profil>
  readonly residences: Promise<Residences>
  readonly hasCrasV1: Promise<{ readonly hasCrasV1: boolean }>
}

const rassembler = async <
  T extends Totaux,
  Periode extends object,
  Repartition extends object,
  ParTag,
  ParLieu,
  ParCommune,
  Profil extends object,
  Residences,
>(
  enCours: EnCours<
    T,
    Periode,
    Repartition,
    ParTag,
    ParLieu,
    ParCommune,
    Profil,
    Residences
  >,
) => {
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

export const nombreDAccompagnements = (
  toutes: Promise<{ readonly totalCounts: Totaux }>,
) => suivie(toutes.then(({ totalCounts }) => totalCounts.accompagnements.total))

export const statistiquesAvec = <
  T extends Totaux,
  Periode extends object,
  Repartition extends object,
  ParTag,
  ParLieu,
  ParCommune,
  Profil extends object,
  Residences,
>(
  sources: SourcesDesStatistiques<
    T,
    Periode,
    Repartition,
    ParTag,
    ParLieu,
    ParCommune,
    Profil,
    Residences
  >,
) => {
  type EnCoursDesSources = EnCours<
    T,
    Periode,
    Repartition,
    ParTag,
    ParLieu,
    ParCommune,
    Profil,
    Residences
  >
  const lancer: LancerLesStatistiques<EnCoursDesSources> = (
    demande,
    { territoires, tags },
  ) => ({
    totalCounts: suivie(sources.totalCounts(demande)),
    periode: suivie(sources.periode(demande)),
    repartition: suivie(sources.repartition(demande)),
    tags: suivie(sources.tags(tags ? demande : null)),
    structures: suivie(sources.structures(territoires ? demande : null)),
    communes: suivie(sources.communes(territoires ? demande : null)),
    profil: suivie(sources.profil(demande)),
    residences: suivie(sources.residences(territoires ? demande : null)),
    hasCrasV1: suivie(sources.hasCrasV1(demande.perimetre)),
  })
  return {
    lancer,
    rassembler: (enCours: EnCoursDesSources) => rassembler(enCours),
    toutes: (enCours: EnCoursDesSources) => suivie(rassembler(enCours)),
  }
}
