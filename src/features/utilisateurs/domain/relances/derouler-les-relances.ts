import { type Result, success } from '@/libraries/result'
import type { EchecDeRelance } from '../errors'
import type { PortsDeRelance } from '../ports'
import {
  type ActionDecidee,
  type CompteARelancer,
  type DestinataireDeRelance,
  destinataireDe,
  type RapportDeRelance,
  type RelancesDeroulees,
} from './destinataire-de-relance'
import {
  actionDeRelance,
  relanceApres,
  suppressionAnnonceeApres,
} from './relance'

type ActionANoter = Exclude<ActionDecidee, { readonly _tag: 'Effacer' }>

const envoyer = (
  destinataire: DestinataireDeRelance,
  action: ActionANoter,
  { relancer, avertir }: PortsDeRelance,
): Promise<Result<void, EchecDeRelance>> => {
  if (action._tag === 'Reinitialiser')
    return Promise.resolve(success(undefined))
  if (action._tag === 'Relancer') return relancer(destinataire, action.palier)
  return avertir(destinataire, action)
}

const executer = async (
  destinataire: DestinataireDeRelance,
  action: ActionDecidee,
  ports: PortsDeRelance,
): Promise<Result<void, EchecDeRelance>> => {
  if (action._tag === 'Effacer') return ports.effacer(destinataire)

  const envoi = await envoyer(destinataire, action, ports)
  if (!envoi.success) return envoi

  return ports.noter(
    destinataire.utilisateurId,
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
  const destinataire = destinataireDe(compte)
  const resultat = await executer(destinataire, action, ports)
  const { utilisateurId, profil } = destinataire

  return resultat.success
    ? { utilisateurId, profil, action, issue: 'fait' }
    : {
        utilisateurId,
        profil,
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
  }): Promise<RelancesDeroulees> =>
    comptes.reduce<Promise<RelancesDeroulees>>(async (precedents, compte) => {
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
    }, Promise.resolve([]))
