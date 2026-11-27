import type {
  CoordinateurId,
  LienDePartageId,
  MediateurId,
  UtilisateurId,
} from '@/features/mediateurs/domain'

export type PartageLu = {
  readonly mediateur: {
    readonly mediateurId: MediateurId
    readonly utilisateurId: UtilisateurId
  } | null
  readonly coordinateur: {
    readonly coordinateurId: CoordinateurId
    readonly utilisateurId: UtilisateurId
  } | null
}

export type LireLePartage = (id: LienDePartageId) => Promise<PartageLu | null>

export type ResoudreUnLienDePartagePorts = {
  readonly lirePartage: LireLePartage
}
