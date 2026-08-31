import { createHash } from 'node:crypto'
import {
  EMPREINTE_COURRIEL_LONGUEUR,
  EmpreinteCourriel,
} from '@app/web/features/utilisateurs/domain'
import type { Empreinte } from '../../domain'

/**
 * Empreinte déterministe d'un compte, reprise à l'identique de l'ancienne
 * suppression : même graine, même algorithme, même longueur. Un compte déjà
 * anonymisé par le code précédent garde donc exactement le même courriel si on
 * rejoue son effacement — c'est ce qui rend la reprise du passif possible.
 */
export const empreinte: Empreinte = (graine) =>
  EmpreinteCourriel(
    createHash('sha256')
      .update(graine)
      .digest('base64url')
      .slice(0, EMPREINTE_COURRIEL_LONGUEUR),
  )
