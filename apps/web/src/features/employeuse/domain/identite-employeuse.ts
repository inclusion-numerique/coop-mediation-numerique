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
 * contrat : un SIRET et une commune. En deçà, on ne crée rien plutôt que
 * d'écrire une identité non rattachable dans une table que nous ne possédons
 * pas.
 *
 * La dénomination, elle, peut manquer : c'est la règle métier des
 * établissements non diffusibles, et c'est déjà l'état de 14 employeuses de
 * production (entreprises individuelles, à qui SIRENE attribue un nom et un
 * prénom plutôt qu'une dénomination). L'exiger ici rendait ces employeuses
 * lisibles mais non enregistrables — le modèle de lecture les modélise en
 * `DenominationEmployeuse | null` depuis toujours. Quand l'API renvoie le
 * marqueur `[Non diffusible]`, on le conserve tel quel : c'est un libellé
 * affichable, pas une absence.
 */
export const IdentiteEmployeuse = defineModel(
  z
    .object({
      siret: Siret.schema,
      denomination: DenominationEmployeuse.schema
        .nullish()
        .transform((value) => value ?? null),
      adresse: AdresseAGeocoder.schema,
    })
    .brand('IdentiteEmployeuse'),
)

export type IdentiteEmployeuse = Model.TypeOf<typeof IdentiteEmployeuse>

/**
 * Établissement tel que SIRENE le décrit, réduit à ce qui fait une identité
 * d'employeuse. L'adaptateur d'API en fait la traduction ; le domaine juge.
 */
export type EtablissementSirene = {
  readonly siret: string
  readonly raisonSociale: string | null
  readonly ferme: boolean
  readonly voie: string | null
  readonly commune: string | null
  readonly codePostal: string | null
  readonly codeInsee: string | null
}

/**
 * Identité d'employeuse tirée d'un établissement, ou `null` s'il n'en fournit
 * pas une exploitable.
 *
 * Deux refus, pour deux raisons distinctes : un établissement **fermé** ne peut
 * plus employer personne, et une identité **sans commune** n'a rien à soumettre
 * à la BAN, donc rien à rattacher dans une table que nous ne possédons pas.
 *
 * L'absence de raison sociale, elle, ne fait plus échouer : elle voyage en
 * `null` jusqu'à `main`, dont la colonne l'accepte.
 */
export const identiteDepuisEtablissement = ({
  siret,
  raisonSociale,
  ferme,
  voie,
  commune,
  codePostal,
  codeInsee,
}: EtablissementSirene): IdentiteEmployeuse | null => {
  if (ferme) return null

  return IdentiteEmployeuse.safe({
    siret,
    denomination: raisonSociale,
    adresse: {
      voie,
      commune: commune ?? '',
      codePostal: codePostal || null,
      codeInsee: codeInsee || null,
    },
  })
}
