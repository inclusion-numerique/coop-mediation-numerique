import type { ZodType, infer as zodInfer } from 'zod'

export type ZodFunctionOptions<Parameters extends ZodType, Result = unknown> = {
  name: string
  parameters: Parameters
  function?: (args: zodInfer<Parameters>) => Result | Promise<Result>
  description?: string | undefined
}
