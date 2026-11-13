import { allocatePercentagesFromRecords } from '@app/web/libraries/proportions'
import type { AccompagnementsParTag } from '../domain'

export const parTagPresentes = (parTag: AccompagnementsParTag) =>
  allocatePercentagesFromRecords(
    parTag.map(({ tag, nombre }) => ({ label: tag.nom, count: nombre })),
    'count',
    'proportion',
  )
