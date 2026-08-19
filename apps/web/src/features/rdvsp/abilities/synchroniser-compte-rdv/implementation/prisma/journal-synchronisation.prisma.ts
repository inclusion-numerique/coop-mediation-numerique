import { prismaClient } from '@app/web/prismaClient'
import {
  type BilanSynchronisation,
  derive,
  type ModeleSynchronise,
} from '../../../../domain/bilan-synchronisation'
import type {
  CloturerJournal,
  EchouerJournal,
  OuvrirJournal,
} from '../../domain/synchroniser-compte-rdv'

/**
 * `rdv_sync_logs` porte six jeux de cinq colonnes, un par modèle. Les noms s'en
 * déduisent mécaniquement : les écrire un à un — trente lignes — invitait à en
 * oublier une au premier modèle ajouté.
 */
const colonnesDuModele = (
  modele: ModeleSynchronise,
  bilan: BilanSynchronisation,
) => ({
  [`${modele}Drift`]: derive(bilan[modele]),
  [`${modele}Noop`]: bilan[modele].noop,
  [`${modele}Created`]: bilan[modele].created,
  [`${modele}Updated`]: bilan[modele].updated,
  [`${modele}Deleted`]: bilan[modele].deleted,
})

export const ouvrirJournal: OuvrirJournal = async ({
  compte,
  organisationIds,
}) => {
  const { id } = await prismaClient.rdvSyncLog.create({
    data: {
      rdvAccountId: compte.agentId,
      started: new Date(),
      // Liste vide = passe complète : la colonne ne distingue pas l'absence de
      // portée d'une portée vide, mais `passePour` a déjà écarté ce second cas.
      organisationIds:
        organisationIds === undefined ? [] : [...organisationIds],
    },
    select: { id: true },
  })

  return { journalId: id }
}

export const cloturerJournal: CloturerJournal = async ({
  journalId,
  resultat,
  journal,
}) => {
  const { bilan } = resultat

  await prismaClient.rdvSyncLog.update({
    where: { id: journalId },
    data: {
      ended: new Date(),
      drift: resultat.derive,
      log: journal,
      ...colonnesDuModele('rdvs', bilan),
      ...colonnesDuModele('organisations', bilan),
      ...colonnesDuModele('webhooks', bilan),
      ...colonnesDuModele('users', bilan),
      ...colonnesDuModele('motifs', bilan),
      ...colonnesDuModele('lieux', bilan),
    },
  })
}

export const echouerJournal: EchouerJournal = async ({
  journalId,
  message,
  journal,
}) => {
  await prismaClient.rdvSyncLog.update({
    where: { id: journalId },
    data: { ended: new Date(), error: message, log: journal },
  })
}
