import { createHash } from 'node:crypto'
import {
  COURRIEL_HASH_LENGTH,
  CourrielHash,
} from '@app/web/features/utilisateurs/domain'
import type { Hash } from '../../domain'

/**
 * Empreinte déterministe d'un compte, reprise à l'identique de l'ancienne
 * suppression : même graine, même algorithme, même longueur. Un compte déjà
 * anonymisé par le code précédent garde donc exactement le même courriel si on
 * rejoue son effacement — c'est ce qui rend la reprise du passif possible.
 */
export const hash: Hash = (seed) =>
  CourrielHash(
    createHash('sha256')
      .update(seed)
      .digest('base64url')
      .slice(0, COURRIEL_HASH_LENGTH),
  )
