import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'
import { CodeInsee } from './code-insee'

/**
 * Adresse d'une employeuse.
 *
 * Dans `main.adresse`, code postal, code INSEE et nom de commune sont NOT NULL :
 * dès qu'une adresse existe, ces trois-là sont renseignés. Seule la voie peut
 * manquer. L'absence complète d'adresse (`adresse_id` nul — 98 lignes mesurées
 * en production) se modélise par `AdresseEmployeuse | null` au niveau du champ.
 *
 * C'est ce que les `?? ''` de la lecture précédente effaçaient : « pas
 * d'adresse » et « adresse vide » y devenaient la même chose, et un code INSEE
 * absent voyageait en chaîne vide jusqu'au filtre par département.
 */
export const AdresseEmployeuse = defineModel(
  z
    .object({
      voie: z
        .string()
        .trim()
        .min(1)
        .nullish()
        .transform((value) => value ?? null),
      codePostal: z.string().trim().min(1),
      codeInsee: CodeInsee.schema,
      commune: z.string().trim().min(1),
    })
    .brand('AdresseEmployeuse'),
)

export type AdresseEmployeuse = Model.TypeOf<typeof AdresseEmployeuse>
