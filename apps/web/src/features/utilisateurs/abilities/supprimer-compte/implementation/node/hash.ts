import { createHash } from 'node:crypto'
import {
  COURRIEL_HASH_LENGTH,
  CourrielHash,
} from '@app/web/features/utilisateurs/domain'
import type { Hash } from '../../domain'

export const hash: Hash = (seed) =>
  CourrielHash(
    createHash('sha256')
      .update(seed)
      .digest('base64url')
      .slice(0, COURRIEL_HASH_LENGTH),
  )
