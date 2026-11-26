import {
  type EchecTechnique,
  enEchecTechnique,
  failure,
  type Result,
  success,
} from '@/libraries/result'

export const sansException = async <T>(
  operation: () => Promise<T>,
): Promise<Result<T, EchecTechnique>> => {
  try {
    return success(await operation())
  } catch (cause) {
    return failure(enEchecTechnique(cause))
  }
}
