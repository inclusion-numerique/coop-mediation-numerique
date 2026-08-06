import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'
import { CodeInsee } from './code-insee'
import { CodePostal } from './code-postal'

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
 *
 * Les deux codes sont validés par leur value object plutôt que transportés en
 * `string` — mesure sur `main.adresse` : 43 313 lignes, 0 code postal nul,
 * 22 hors du format 5 chiffres (0,05 %). Conséquence assumée : le schéma étant
 * total, un de ces codes hors format fait tomber l'adresse ENTIÈRE à `null` via
 * le `.safe()` du transfer (`db/employeuse.transfer.ts`). L'employeuse s'affiche
 * alors sans bloc adresse — les lecteurs gèrent déjà `adresse?.` — mais sort du
 * filtre par département, faute de code INSEE. Arbitrage : préférer l'absence
 * franche à une donnée d'adressage fausse ; c'est ce que fixe la spec.
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
      codePostal: CodePostal.schema,
      codeInsee: CodeInsee.schema,
      commune: z.string().trim().min(1),
    })
    .brand('AdresseEmployeuse'),
)

export type AdresseEmployeuse = Model.TypeOf<typeof AdresseEmployeuse>
