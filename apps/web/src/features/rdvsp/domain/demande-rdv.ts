import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'
import type {
  EmailExterne,
  NomExterne,
  PrenomExterne,
  TelephoneExterne,
} from './identite'
import type { RdvId } from './rdv-id'
import type { UsagerId } from './usager-id'

export const DemandeRdvId = defineModel(
  z.number().int().positive().brand('DemandeRdvId'),
)
export type DemandeRdvId = Model.TypeOf<typeof DemandeRdvId>

export const UrlPriseRdv = defineModel(z.string().url().brand('UrlPriseRdv'))
export type UrlPriseRdv = Model.TypeOf<typeof UrlPriseRdv>

export const UrlRetour = defineModel(z.string().url().brand('UrlRetour'))
export type UrlRetour = Model.TypeOf<typeof UrlRetour>

/**
 * Désigner un usager existant et en décrire un nouveau sont deux intentions
 * exclusives. L'API les expose pourtant dans un même objet où tous les champs
 * sont facultatifs, `id` compris — une forme qui laisse écrire un identifiant
 * *et* une identité sans que rien ne tranche. L'union force le choix côté
 * appelant, et cantonne à l'adaptateur la question de savoir ce que RDV Service
 * Public fait réellement de `user.id`.
 */
export type UsagerDeLaDemande =
  | { readonly _tag: 'existant'; readonly id: UsagerId }
  | {
      readonly _tag: 'aCreer'
      readonly prenom: PrenomExterne
      readonly nom: NomExterne
      readonly email: EmailExterne | null
      readonly telephone: TelephoneExterne | null
      readonly adresse: string | null
      readonly dateNaissance: Date | null
    }

export type DemandeRdv = {
  readonly usager: UsagerDeLaDemande
  /** Page vers laquelle RDV Service Public renvoie l'usager une fois la prise faite. */
  readonly urlRetour: UrlRetour | null
}

/**
 * Une demande aboutit toujours à un lien de prise de rendez-vous, mais pas
 * nécessairement à un rendez-vous : `rdvId` n'est renseigné que si un créneau a
 * été retenu dans la foulée.
 */
export type DemandeRdvCreee = {
  readonly id: DemandeRdvId
  readonly usagerId: UsagerId
  readonly url: UrlPriseRdv
  readonly rdvId: RdvId | null
}
