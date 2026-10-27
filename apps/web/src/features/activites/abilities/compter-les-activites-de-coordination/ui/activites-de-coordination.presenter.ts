import type {
  ActivitesDeCoordination,
  DecompteParType,
  Trimestre,
  TypeDActiviteDeCoordination,
} from '../domain'

export type CompteurPresente = {
  readonly libelle: string
  readonly nombre: number
}

export type PeriodePresentee = {
  readonly cle: string
  readonly libelle: string
  readonly compteurs: readonly CompteurPresente[]
}

export type ActivitesDeCoordinationPresentees = {
  readonly aucuneActivite: boolean
  readonly periodes: readonly PeriodePresentee[]
  readonly periodeParDefaut: string
}

const CUMUL = 'cumul'

const libelleDuType = (type: TypeDActiviteDeCoordination): string =>
  type === 'Evenement' ? 'Évènement' : type

const libelleDuTrimestre = ({ annee, rang }: Trimestre): string =>
  `${rang === 1 ? '1er' : `${rang}e`} trimestre ${annee}`

const compteurs = (decompte: DecompteParType): readonly CompteurPresente[] =>
  decompte.map(({ type, nombre }) => ({ libelle: libelleDuType(type), nombre }))

export const activitesDeCoordinationPresentees = ({
  cumul,
  trimestres,
}: ActivitesDeCoordination): ActivitesDeCoordinationPresentees => ({
  aucuneActivite: trimestres.length === 0,
  periodes: [
    ...trimestres.map(({ trimestre, decompte }) => ({
      cle: `${trimestre.annee}-${trimestre.rang}`,
      libelle: libelleDuTrimestre(trimestre),
      compteurs: compteurs(decompte),
    })),
    { cle: CUMUL, libelle: 'En cumulé', compteurs: compteurs(cumul) },
  ],
  periodeParDefaut: CUMUL,
})
