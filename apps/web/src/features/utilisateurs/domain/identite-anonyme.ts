import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'
import { AdresseCourriel } from './adresse-courriel'
import type { CourrielHash } from './courriel-hash'

export const PRENOM_ANONYME = 'Utilisateur'
export const NOM_ANONYME = 'Supprimé'
export const DOMAINE_COURRIEL_ANONYME = 'coop-numerique.anct.gouv.fr'

/**
 * L'identité que porte un compte effacé.
 *
 * Composite (DM-7) parce que ces champs ne sont jamais écrits séparément : les
 * dissocier permettrait d'anonymiser le nom en oubliant le courriel, ce qui
 * laisserait le compte identifiable tout en le déclarant supprimé.
 */
export const IdentiteAnonyme = defineModel(
  z
    .object({
      prenom: z.literal(PRENOM_ANONYME),
      nom: z.literal(NOM_ANONYME),
      nomComplet: z.literal(`${PRENOM_ANONYME} ${NOM_ANONYME}`),
      courriel: AdresseCourriel.schema,
    })
    .brand('IdentiteAnonyme'),
)

export type IdentiteAnonyme = Model.TypeOf<typeof IdentiteAnonyme>

/**
 * Fabrique l'identité anonyme d'un compte à partir de son empreinte. Pure et
 * déterministe : deux appels avec la même empreinte rendent le même courriel.
 */
export const identiteAnonyme = (hash: CourrielHash): IdentiteAnonyme =>
  IdentiteAnonyme({
    prenom: PRENOM_ANONYME,
    nom: NOM_ANONYME,
    nomComplet: `${PRENOM_ANONYME} ${NOM_ANONYME}`,
    courriel: AdresseCourriel(`deleted+${hash}@${DOMAINE_COURRIEL_ANONYME}`),
  })

/**
 * Ce courriel est-il déjà celui d'une identité effacée ?
 *
 * C'est cette question — et non le drapeau `deleted` — qui décide s'il faut
 * écrire l'identité anonyme. Les deux ne coïncident pas toujours : un compte
 * peut porter une date de suppression sans avoir été anonymisé, et il faut alors
 * pouvoir le rattraper. À l'inverse, réécrire une identité déjà anonyme lui
 * donnerait une nouvelle adresse à chaque rejeu, l'empreinte se calculant sur le
 * courriel courant.
 */
export const estCourrielAnonymise = (courriel: AdresseCourriel): boolean =>
  courriel.startsWith('deleted+') &&
  courriel.endsWith(`@${DOMAINE_COURRIEL_ANONYME}`)
