import { prismaClient } from '@/configuration/prisma'
import { attraperEnEchecTechnique } from '@/libraries/result'
import {
  type BilanSynchronisation,
  deriveDuModele,
  type ModeleSynchronise,
} from '../../../../domain/compte/bilan-synchronisation'
import type {
  CloturerJournal,
  EchouerJournal,
  OuvrirJournal,
} from '../../domain/ports'

const colonnesDuModele = (
  modele: ModeleSynchronise,
  bilan: BilanSynchronisation,
) => ({
  [`${modele}Drift`]: deriveDuModele(modele, bilan),
  [`${modele}Noop`]: bilan[modele].noop,
  [`${modele}Created`]: bilan[modele].created,
  [`${modele}Updated`]: bilan[modele].updated,
  [`${modele}Deleted`]: bilan[modele].deleted,
})

export const ouvrirJournal: OuvrirJournal = attraperEnEchecTechnique(
  async ({ compte, organisationIds }) => {
    const { id } = await prismaClient.rdvSyncLog.create({
      data: {
        rdvAccountId: compte.agentId,
        started: new Date(),
        organisationIds:
          organisationIds === undefined ? [] : [...organisationIds],
      },
      select: { id: true },
    })

    return { journalId: id }
  },
)

export const cloturerJournal: CloturerJournal = attraperEnEchecTechnique(
  async ({ journalId, resultat, journal }) => {
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
  },
)

export const echouerJournal: EchouerJournal = attraperEnEchecTechnique(
  async ({ journalId, message, journal }) => {
    await prismaClient.rdvSyncLog.update({
      where: { id: journalId },
      data: { ended: new Date(), error: message, log: journal },
    })
  },
)
