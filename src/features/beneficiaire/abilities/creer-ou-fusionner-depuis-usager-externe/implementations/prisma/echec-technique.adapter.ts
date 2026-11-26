import { failure, type Result, success } from '@/libraries/result'
import { EchecTechnique } from '../../domain/errors'

export const sansException = async <T>(
  operation: () => Promise<T>,
): Promise<Result<T, EchecTechnique>> => {
  try {
    return success(await operation())
  } catch (cause) {
    return failure(EchecTechnique(cause))
  }
}
