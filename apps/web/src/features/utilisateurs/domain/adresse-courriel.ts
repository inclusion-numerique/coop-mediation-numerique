import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/**
 * Adresse de courriel d'un compte.
 *
 * La normalisation vit dans le schéma (`trim` + `toLowerCase`) pour survivre à
 * la composition — c'est la règle de `defineModel`. Un courriel déjà anonymisé
 * (`deleted+…@coop-numerique.anct.gouv.fr`) reste une adresse valide : relire un
 * compte supprimé ne doit pas échouer.
 */
export const AdresseCourriel = defineModel(
  z.string().trim().toLowerCase().email().brand('AdresseCourriel'),
)

export type AdresseCourriel = Model.TypeOf<typeof AdresseCourriel>
