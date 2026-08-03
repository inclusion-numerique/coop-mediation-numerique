import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'
import { AdresseAGeocoder } from './adresse-a-geocoder'
import { DenominationEmployeuse } from './denomination-employeuse'
import { Siret } from './siret'

/**
 * Ce qu'il faut savoir d'une employeuse pour la faire exister dans `main`.
 *
 * Les trois chemins d'écriture la construisent à partir de sources
 * différentes — un choix dans Sirene à l'inscription, la réponse de l'API
 * Recherche d'entreprises, les claims ProConnect — mais aboutissent au même
 * contrat : un SIRET, une dénomination, une adresse géocodable. En deçà, on ne
 * crée rien plutôt que d'écrire une identité incomplète dans une table que nous
 * ne possédons pas.
 */
export const IdentiteEmployeuse = defineModel(
  z
    .object({
      siret: Siret.schema,
      denomination: DenominationEmployeuse.schema,
      adresse: AdresseAGeocoder.schema,
    })
    .brand('IdentiteEmployeuse'),
)

export type IdentiteEmployeuse = Model.TypeOf<typeof IdentiteEmployeuse>
