import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'
import type { AuteurSuppression } from './auteur-suppression'
import type { NomRetentionPolicy } from './retention-policy'

export const motifsSuppression = [
  'DemandeDuTitulaire',
  'DecisionAdministrateur',
  'InactiviteApresInscription',
] as const

export const MotifSuppression = defineModel(
  z.enum(motifsSuppression).brand('MotifSuppression'),
)
export type MotifSuppression = Model.TypeOf<typeof MotifSuppression>

/**
 * Le motif se DÉDUIT de l'auteur, il ne se saisit pas (DM-5) : les porter tous
 * deux, ce serait deux champs pour un seul état, avec la possibilité de les
 * désaccorder — un effacement « demandé par le titulaire » attribué à un
 * administrateur.
 */
const MOTIF_PAR_AUTEUR: Record<
  Exclude<AuteurSuppression['_tag'], 'systeme'>,
  MotifSuppression
> = {
  titulaire: MotifSuppression('DemandeDuTitulaire'),
  administrateur: MotifSuppression('DecisionAdministrateur'),
}

/**
 * Un effacement automatique se journalise sous le motif de LA POLITIQUE qui l'a
 * déclenché, et non sous un motif attaché au fait qu'il soit automatique.
 *
 * La table est exhaustive : ajouter une politique de rétention sans dire ce
 * qu'elle journalise ne compile pas. Sans elle, une seconde politique — celle
 * de l'inactivité à un an, déjà prévue — aurait été enregistrée comme une
 * « inactivité après inscription », en silence et pour toujours.
 */
const MOTIF_PAR_POLICY: Record<NomRetentionPolicy, MotifSuppression> = {
  InscritJamaisActif: MotifSuppression('InactiviteApresInscription'),
}

/** La marque ne peut pas servir d'index : le paramètre reçoit le nom nu. */
const motifDeLaPolicy = (policy: NomRetentionPolicy): MotifSuppression =>
  MOTIF_PAR_POLICY[policy]

export const motifDe = (auteur: AuteurSuppression): MotifSuppression =>
  auteur._tag === 'systeme'
    ? motifDeLaPolicy(auteur.policy)
    : MOTIF_PAR_AUTEUR[auteur._tag]
