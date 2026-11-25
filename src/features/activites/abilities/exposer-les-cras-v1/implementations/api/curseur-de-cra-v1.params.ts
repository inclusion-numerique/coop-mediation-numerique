import { z } from 'zod'
import { Horodatage } from '../../domain'

const CurseurValidation = z.iso.datetime()

export const curseurDeCraV1 = (curseur: string): Horodatage =>
  Horodatage(new Date(CurseurValidation.parse(curseur)))
