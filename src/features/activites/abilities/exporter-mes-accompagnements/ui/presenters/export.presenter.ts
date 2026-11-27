import {
  filtresDeToutesLesActivites,
  type ValeursDeToutesLesActivites,
} from '../../../../ui/filtres/toutes-les-activites.filtre'
import type { ExportDesAccompagnements } from '../../domain'
import { contenuDuClasseur } from './lignes-du-classeur.presenter'

type NomsDesFiltres = {
  readonly beneficiaires: readonly {
    readonly label: string
    readonly value: { readonly id?: string | null } | null
  }[]
  readonly mediateurs: readonly {
    readonly mediateurId: string
    readonly nom: string
    readonly ancien: boolean
  }[]
  readonly employeuses: readonly {
    readonly id: number
    readonly nom: string | null
  }[]
  readonly communes: readonly {
    readonly label: string
    readonly value: string
  }[]
  readonly departements: readonly {
    readonly label: string
    readonly value: string
  }[]
  readonly lieux: readonly { readonly label: string; readonly value: string }[]
  readonly tags: readonly { readonly id: string; readonly nom: string }[]
}

export const libelleDuMediateur = ({
  nom,
  ancien,
}: {
  readonly nom: string
  readonly ancien: boolean
}): string => (ancien ? `Ancien membre - ${nom}` : nom)

const libelles = (noms: readonly { label: string; value: string }[]) =>
  new Map(noms.map(({ value, label }) => [value, label]))

const etiquettesDuClasseur = (
  valeurs: ValeursDeToutesLesActivites,
  noms: NomsDesFiltres,
) =>
  filtresDeToutesLesActivites.etiquettes(
    { chemin: '', parametres: {} },
    valeurs,
    {
      lieux: libelles(noms.lieux),
      communes: libelles(noms.communes),
      departements: libelles(noms.departements),
      tags: libelles(
        noms.tags.map(({ id, nom }) => ({ value: id, label: nom })),
      ),
      structuresEmployeuses: libelles(
        noms.employeuses.map(({ id, nom }) => ({
          value: String(id),
          label: nom ?? '',
        })),
      ),
      mediateurs: libelles(
        noms.mediateurs.map(({ mediateurId, nom, ancien }) => ({
          value: mediateurId,
          label: libelleDuMediateur({ nom, ancien }),
        })),
      ),
      beneficiaires: libelles(
        noms.beneficiaires.flatMap(({ label, value }) =>
          value?.id ? [{ value: value.id, label }] : [],
        ),
      ),
    },
  )

export const classeurPresenteAvec =
  (valeurs: ValeursDeToutesLesActivites) =>
  ({
    noms,
    exportDes,
    fuseau,
  }: {
    readonly noms: NomsDesFiltres
    readonly exportDes: ExportDesAccompagnements
    readonly fuseau: string
  }) => ({
    filtres: etiquettesDuClasseur(valeurs, noms).map(({ titre, libelle }) => ({
      type: titre,
      label: libelle,
    })),
    ...contenuDuClasseur(exportDes, fuseau),
  })

export const cheminDImpressionDesStatistiques = (requete: string) =>
  `/coop/mes-statistiques?print=true${requete === '' ? '' : (`&${requete}` as const)}` as const
