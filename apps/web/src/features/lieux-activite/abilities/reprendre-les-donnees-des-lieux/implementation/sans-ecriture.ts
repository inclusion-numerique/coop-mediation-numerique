import type {
  DeposerLeReleve,
  ReprendreLesHoraires,
  TrierLesListes,
} from '../domain'

export const sansTri: TrierLesListes = async () => undefined

export const sansRepriseDesHoraires: ReprendreLesHoraires = async () =>
  undefined

export const sansDepot: DeposerLeReleve = async () => []
