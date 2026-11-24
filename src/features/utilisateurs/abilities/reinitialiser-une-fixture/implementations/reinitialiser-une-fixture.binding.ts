import { reinitialiserUneFixture as reinitialiserLaFixture } from '../domain/reinitialiser-une-fixture'
import { estUneFixture, reinitialiser } from './prisma/reinitialiser.mutation'

export const reinitialiserUneFixture = reinitialiserLaFixture({
  estUneFixture,
  reinitialiser,
})
