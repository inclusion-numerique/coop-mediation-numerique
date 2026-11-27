import { type EchecTechnique, type Result, success } from '@/libraries/result'
import type { AdresseCourriel } from '../identite/adresse-courriel'
import type { PortsDuRetraitDuContact } from '../ports'
import type { PresenceDuContact, RetraitDuContact } from './contact-des-listes'

const estOrphelin = (presence: PresenceDuContact): boolean =>
  presence._tag === 'Present' && presence.listes === 0

export const retirerLeContactDesListes =
  ({
    retirerLeContactDeLaListe,
    lireLaPresenceDuContact,
    supprimerLeContact,
  }: PortsDuRetraitDuContact) =>
  async ({
    courriel,
  }: {
    readonly courriel: AdresseCourriel
  }): Promise<Result<RetraitDuContact, EchecTechnique>> => {
    const retrait = await retirerLeContactDeLaListe(courriel)
    if (!retrait.success) return retrait

    const presence = await lireLaPresenceDuContact(courriel)
    if (!presence.success) return presence

    if (!estOrphelin(presence.data))
      return success({
        listeDesUtilisateurs: retrait.data,
        contact: { _tag: 'Conserve' },
      })

    const suppression = await supprimerLeContact(courriel)
    if (!suppression.success) return suppression

    return success({
      listeDesUtilisateurs: retrait.data,
      contact: { _tag: 'Supprime' },
    })
  }
