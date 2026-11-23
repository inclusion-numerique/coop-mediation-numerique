import {
  type FournisseursDesOptions,
  optionsDesStatistiques,
} from '../ui/filtres/options-de-la-barre.presenter'
import type { ActivitesFilters } from '../ui/filtres/parametres-de-la-barre'
import type { VocabulaireDeLaBarre } from '../ui/filtres/vocabulaire-de-la-barre'

type Fournisseur<
  OptionDeBeneficiaire,
  K extends keyof FournisseursDesOptions<OptionDeBeneficiaire>,
> = ReturnType<FournisseursDesOptions<OptionDeBeneficiaire>[K]>

export type SourcesDeMesStatistiques<
  Utilisateur,
  Profil,
  Perimetre,
  EnCours,
  Fournies,
  OptionDeBeneficiaire,
> = {
  readonly perimetreDe: (utilisateur: Utilisateur) => Perimetre | null
  readonly lancer: (input: {
    readonly perimetre: Perimetre
    readonly filtres: ActivitesFilters
    readonly fin: Date
  }) => EnCours
  readonly rassembler: (enCours: EnCours) => Promise<Fournies>
  readonly lieuxChoisis: (
    filtres: ActivitesFilters,
    perimetre: Perimetre,
  ) => Fournisseur<OptionDeBeneficiaire, 'lieuxChoisis'>
  readonly tagsVisibles: (
    profil: Profil,
  ) => Fournisseur<OptionDeBeneficiaire, 'tags'>
  readonly beneficiaires: (input: {
    mediateurId?: string
    includeBeneficiaireIds?: string[]
  }) => Fournisseur<OptionDeBeneficiaire, 'beneficiaires'>
  readonly membres: (
    utilisateur: Utilisateur,
  ) => Fournisseur<OptionDeBeneficiaire, 'membres'>
  readonly activitesDuPerimetre: (
    perimetre: Perimetre,
  ) => Fournisseur<OptionDeBeneficiaire, 'activitesDuPerimetre'>
  readonly vocabulaire: VocabulaireDeLaBarre
}

type MesStatistiquesGraphOptions = {
  fin?: Date
  debut?: Date
}

type ParametresDeMesStatistiques<Utilisateur, Profil> = {
  user: Utilisateur
  profil: Profil
  activitesFilters: ActivitesFilters
  graphOptions?: MesStatistiquesGraphOptions
}

const finDesGraphiques = (
  activitesFilters: ActivitesFilters,
  graphOptions: MesStatistiquesGraphOptions,
): Date =>
  graphOptions.fin ??
  (activitesFilters.au ? new Date(activitesFilters.au) : new Date())

export const mesStatistiques = async <
  Utilisateur extends { readonly mediateur: { readonly id: string } | null },
  Profil,
  Perimetre,
  EnCours,
  Fournies,
  OptionDeBeneficiaire,
>(
  {
    user,
    profil,
    activitesFilters,
    graphOptions = {},
  }: ParametresDeMesStatistiques<Utilisateur, Profil>,
  sources: SourcesDeMesStatistiques<
    Utilisateur,
    Profil,
    Perimetre,
    EnCours,
    Fournies,
    OptionDeBeneficiaire
  >,
) => {
  const perimetre = sources.perimetreDe(user)
  if (perimetre === null) {
    throw new Error('Statistiques sans profil médiateur ni coordinateur')
  }

  const statistiques = sources.lancer({
    perimetre,
    filtres: activitesFilters,
    fin: finDesGraphiques(activitesFilters, graphOptions),
  })

  const options = await optionsDesStatistiques({
    lieuxChoisis: () => sources.lieuxChoisis(activitesFilters, perimetre),
    tags: () => sources.tagsVisibles(profil),
    beneficiaires: () =>
      sources.beneficiaires({
        mediateurId: user.mediateur?.id,
        includeBeneficiaireIds: activitesFilters.beneficiaires,
      }),
    membres: () => sources.membres(user),
    activitesDuPerimetre: () => sources.activitesDuPerimetre(perimetre),
  })

  return {
    ...options,
    activitesFilters,
    vocabulaire: sources.vocabulaire,
    statistiques,
  }
}

export const donneesDeMesStatistiques = async <
  Utilisateur extends { readonly mediateur: { readonly id: string } | null },
  Profil,
  Perimetre,
  EnCours,
  Fournies,
  OptionDeBeneficiaire,
>(
  parametres: ParametresDeMesStatistiques<Utilisateur, Profil>,
  sources: SourcesDeMesStatistiques<
    Utilisateur,
    Profil,
    Perimetre,
    EnCours,
    Fournies,
    OptionDeBeneficiaire
  >,
) => {
  const { statistiques, ...options } = await mesStatistiques(
    parametres,
    sources,
  )
  return { ...(await sources.rassembler(statistiques)), ...options }
}
