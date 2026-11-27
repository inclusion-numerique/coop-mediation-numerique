import { UsagerId } from '../../domain/identifiants/usager-id'
import {
  EmailExterne,
  NomExterne,
  PrenomExterne,
  TelephoneExterne,
} from '../../domain/identite'
import type { UsagerExterne } from '../../domain/ports'

type LigneUsager = {
  readonly id: number
  readonly firstName: string
  readonly lastName: string
  readonly email: string | null
  readonly phoneNumber: string | null
  readonly address: string | null
  readonly birthDate: Date | null
}

const facultatif =
  <T>(decoder: (valeur: string) => T | null) =>
  (valeur: string | null): T | null =>
    valeur === null ? null : decoder(valeur)

export const identiteExterneToDomain = (ligne: LigneUsager) => ({
  prenom: PrenomExterne.safe(ligne.firstName),
  nom: NomExterne.safe(ligne.lastName),
  email: facultatif(EmailExterne.safe)(ligne.email),
  telephone: facultatif(TelephoneExterne.safe)(ligne.phoneNumber),
})

export const usagerExterneToDomain = (ligne: LigneUsager): UsagerExterne => ({
  rdvUserId: UsagerId(ligne.id),
  ...identiteExterneToDomain(ligne),
  adresse: ligne.address,
  birthDate: ligne.birthDate,
})
