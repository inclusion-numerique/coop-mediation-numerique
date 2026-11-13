import {
  type ChangeObjectKeysCaseRecursive,
  changeObjectKeysCaseRecursive,
} from '@app/web/utils/changeObjectKeysCaseRecursive'

type NombreDuJour = { label: string; count: number }

type Part = { value: string; label: string; count: number; proportion: number }

type PartDuTotal = { total: number; proportion: number }

export type StatistiquesFourniesAExposer = {
  accompagnementsParJour: NombreDuJour[]
  accompagnementsParMois: NombreDuJour[]
  beneficiaires: {
    total: number
    genres: Part[]
    trancheAges: Part[]
    statutsSocial: Part[]
  }
  activites: {
    total: number
    typeActivites: Part[]
    durees: Part[]
    typeLieu: Part[]
    thematiques: Part[]
    thematiquesDemarches: Part[]
    materiels: Part[]
  }
  totalCounts: {
    activites: {
      total: number
      individuels: PartDuTotal
      collectifs: PartDuTotal & { participants: number }
    }
    accompagnements: {
      total: number
      individuels: PartDuTotal
      collectifs: PartDuTotal
    }
    beneficiaires: {
      total: number
      nouveaux: number
      suivis: number
      anonymes: number
    }
  }
}

export const statistiquesExposees = ({
  accompagnementsParJour,
  accompagnementsParMois,
  beneficiaires,
  activites,
  totalCounts,
}: StatistiquesFourniesAExposer) => ({
  accompagnementsParJour,
  accompagnementsParMois,
  beneficiaires: {
    total: beneficiaires.total,
    genres: beneficiaires.genres,
    trancheAges: beneficiaires.trancheAges,
    statutsSocial: beneficiaires.statutsSocial,
  },
  activites: {
    total: activites.total,
    typeActivites: activites.typeActivites,
    durees: activites.durees,
    typeLieu: activites.typeLieu,
    thematiques: activites.thematiques,
    thematiquesDemarches: activites.thematiquesDemarches,
    materiels: activites.materiels,
    tags: [],
  },
  totaux: totalCounts,
})

export type StatistiquesExposees = ReturnType<typeof statistiquesExposees>

export type StatistiquesAttributes = ChangeObjectKeysCaseRecursive<
  StatistiquesExposees,
  'snake'
>

export const statistiquesAttributes = (
  statistiques: StatistiquesExposees,
): StatistiquesAttributes =>
  changeObjectKeysCaseRecursive(statistiques, 'snake')
