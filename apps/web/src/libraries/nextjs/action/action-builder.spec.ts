import { createNoopReporter } from '@arckit/telemetry/error-reporter'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import {
  ACTION_INVALID_INPUT_ERROR,
  ACTION_TECHNICAL_ERROR,
  actionBuilder as baseActionBuilder,
} from './action-builder'
import { withInput } from './middlewares'

const errorReporter = createNoopReporter()

const actionBuilder = (options: { readonly errorPrefix?: string } = {}) =>
  baseActionBuilder({ ...options, errorReporter })

const InputValidation = z.object({ nom: z.string().min(1) })

describe('actionBuilder', () => {
  it('retourne le résultat du handler en succès', async () => {
    const action = actionBuilder()
      .use(withInput(InputValidation))
      .execute(async ({ input }) => input.nom)

    expect(await action({ nom: 'Piaf' })).toEqual({
      success: true,
      data: 'Piaf',
    })
  })

  it('type l’entrée de l’action depuis le schéma de withInput', async () => {
    const action = actionBuilder()
      .use(withInput(InputValidation))
      .execute(async ({ input }) => input.nom)

    // @ts-expect-error — propriété inconnue rejetée à la compilation
    await action({ nom: 'Piaf', inconnu: true })
    // @ts-expect-error — entrée requise pour une action avec withInput
    await action()
  })

  it('expose une action sans argument en l’absence de withInput', async () => {
    const action = actionBuilder().execute(async () => 'ok')

    expect(await action()).toEqual({ success: true, data: 'ok' })
  })

  it('convertit une entrée invalide en échec INVALID_INPUT', async () => {
    const action = actionBuilder()
      .use(withInput(InputValidation))
      .execute(async ({ input }) => input.nom)

    const result = await action({ nom: '' })

    expect(result).toEqual({
      success: false,
      error: ACTION_INVALID_INPUT_ERROR,
    })
  })

  it('convertit une exception du handler en échec TECHNICAL_ERROR', async () => {
    const crash = new Error('infra down')
    const action = actionBuilder().execute(async () => {
      throw crash
    })

    expect(await action()).toEqual({
      success: false,
      error: ACTION_TECHNICAL_ERROR,
    })
  })

  it('préfixe les codes techniques avec errorPrefix', async () => {
    const action = actionBuilder({ errorPrefix: 'beneficiaire' })
      .use(withInput(InputValidation))
      .execute(async ({ input }) => input.nom)

    expect(await action({ nom: '' })).toEqual({
      success: false,
      error: `beneficiaire.${ACTION_INVALID_INPUT_ERROR}`,
    })
  })

  it('relance les erreurs de redirection Next', async () => {
    const redirect = Object.assign(new Error('NEXT_REDIRECT'), {
      digest: 'NEXT_REDIRECT;replace;/coop;307;',
    })
    const action = actionBuilder().execute(async () => {
      throw redirect
    })

    await expect(action()).rejects.toBe(redirect)
  })
})
