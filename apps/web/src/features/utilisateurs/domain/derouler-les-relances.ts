import { type Result, success } from '@app/web/libraries/result'
import type {
  DestinataireDeRelance,
  RapportDeRelance,
} from './destinataire-de-relance'
import {
  type ActionDeRelance,
  actionDeRelance,
  type PalierDeRelance,
  type Relance,
  relanceApres,
  type SituationDeRelance,
} from './relance'
import type { UtilisateurId } from './utilisateur-id'

export type CompteARelancer = DestinataireDeRelance & {
  readonly situation: SituationDeRelance
}

export type PortsDeRelance = {
  readonly relancer: (
    destinataire: DestinataireDeRelance,
    palier: PalierDeRelance,
  ) => Promise<void>
  readonly avertir: (
    destinataire: DestinataireDeRelance,
    echeance: { readonly suppressionLe: Date; readonly joursRestants: number },
  ) => Promise<void>
  readonly effacer: (
    destinataire: DestinataireDeRelance,
  ) => Promise<Result<void, EffacementImpossible>>
  readonly noter: (
    utilisateurId: UtilisateurId,
    relance: Relance,
  ) => Promise<void>
}

export type EffacementImpossible = { readonly _tag: string }

type ActionAgissante = Exclude<ActionDeRelance, { _tag: 'Rien' }>

const executer = async (
  compte: CompteARelancer,
  action: ActionAgissante,
  ports: PortsDeRelance,
): Promise<Result<void, EffacementImpossible>> => {
  if (action._tag === 'Effacer') return ports.effacer(compte)
  if (action._tag === 'Relancer') await ports.relancer(compte, action.palier)
  if (action._tag === 'Avertir') await ports.avertir(compte, action)

  const relance = relanceApres(action)
  if (relance !== null) await ports.noter(compte.utilisateurId, relance)
  return success(undefined)
}

const rapporter = async (
  compte: CompteARelancer,
  action: ActionAgissante,
  ports: PortsDeRelance,
): Promise<RapportDeRelance> =>
  executer(compte, action, ports).then(
    (resultat): RapportDeRelance =>
      resultat.success
        ? {
            utilisateurId: compte.utilisateurId,
            action: action._tag,
            issue: 'fait',
          }
        : {
            utilisateurId: compte.utilisateurId,
            action: action._tag,
            issue: 'echec',
            cause: resultat.error._tag,
          },
    (erreur: unknown): RapportDeRelance => ({
      utilisateurId: compte.utilisateurId,
      action: action._tag,
      issue: 'echec',
      cause: erreur instanceof Error ? erreur.message : String(erreur),
    }),
  )

export const deroulerLesRelances = (
  comptes: readonly CompteARelancer[],
  ports: PortsDeRelance,
  maintenant: Date,
): Promise<readonly RapportDeRelance[]> =>
  comptes.reduce<Promise<readonly RapportDeRelance[]>>(
    async (precedents, compte) => {
      const rapports = await precedents
      const action = actionDeRelance(compte.situation, maintenant)
      return action._tag === 'Rien'
        ? rapports
        : [...rapports, await rapporter(compte, action, ports)]
    },
    Promise.resolve([]),
  )
