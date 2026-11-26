import { type Result, success } from '@/libraries/result'
import type { EchecDeRelance } from '../errors'
import type {
  EnvoyerLAvertissement,
  EnvoyerLaRelance,
  NoterLaRelance,
} from '../ports'
import type {
  ActionDecidee,
  CompteARelancer,
  DestinataireDeRelance,
  RapportDeRelance,
} from './destinataire-de-relance'
import {
  actionDeRelance,
  relanceApres,
  suppressionAnnonceeApres,
} from './relance'

export type PortsDeRelance = {
  readonly relancer: EnvoyerLaRelance
  readonly avertir: EnvoyerLAvertissement
  readonly effacer: (
    destinataire: DestinataireDeRelance,
  ) => Promise<Result<unknown, EchecDeRelance>>
  readonly noter: NoterLaRelance
}

const envoyer = (
  compte: CompteARelancer,
  action: Exclude<ActionDecidee, { readonly _tag: 'Effacer' }>,
  { relancer, avertir }: PortsDeRelance,
): Promise<Result<unknown, EchecDeRelance>> => {
  if (action._tag === 'Relancer') return relancer(compte, action.palier)
  if (action._tag === 'Avertir') return avertir(compte, action)
  return Promise.resolve(success(undefined))
}

const executer = async (
  compte: CompteARelancer,
  action: ActionDecidee,
  ports: PortsDeRelance,
): Promise<Result<unknown, EchecDeRelance>> => {
  if (action._tag === 'Effacer') return ports.effacer(compte)

  const envoi = await envoyer(compte, action, ports)
  if (!envoi.success) return envoi

  return ports.noter(
    compte.utilisateurId,
    relanceApres(action),
    suppressionAnnonceeApres(action),
  )
}

const causeDe = (echec: EchecDeRelance): string =>
  echec._tag === 'EchecTechnique' ? echec.cause : echec.motif

const rapporter = async (
  compte: CompteARelancer,
  action: ActionDecidee,
  ports: PortsDeRelance,
): Promise<RapportDeRelance> => {
  const resultat = await executer(compte, action, ports)

  return resultat.success
    ? { utilisateurId: compte.utilisateurId, action, issue: 'fait' }
    : {
        utilisateurId: compte.utilisateurId,
        action,
        issue: 'echec',
        cause: causeDe(resultat.error),
      }
}

export const deroulerLesRelances =
  ({ relancer, avertir, effacer, noter }: PortsDeRelance) =>
  ({
    comptes,
    maintenant,
  }: {
    readonly comptes: readonly CompteARelancer[]
    readonly maintenant: Date
  }): Promise<readonly RapportDeRelance[]> =>
    comptes.reduce<Promise<readonly RapportDeRelance[]>>(
      async (precedents, compte) => {
        const rapports = await precedents
        const action = actionDeRelance(compte.situation, maintenant)
        return action._tag === 'Rien'
          ? rapports
          : [
              ...rapports,
              await rapporter(compte, action, {
                relancer,
                avertir,
                effacer,
                noter,
              }),
            ]
      },
      Promise.resolve([]),
    )
