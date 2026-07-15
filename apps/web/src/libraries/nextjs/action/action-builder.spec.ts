import { z } from 'zod'
import {
  ACTION_INVALID_INPUT_ERROR,
  ACTION_TECHNICAL_ERROR,
  actionBuilder,
} from './action-builder'
import { withInput } from './middlewares'

const captureException = jest.fn()

jest.mock('@sentry/nextjs', () => ({
  get captureException() {
    return captureException
  },
}))

const InputValidation = z.object({ nom: z.string().min(1) })

describe('actionBuilder', () => {
  let consoleError: jest.SpyInstance

  beforeEach(() => {
    consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    captureException.mockClear()
  })

  afterEach(() => {
    consoleError.mockRestore()
  })

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

  it('convertit une entrée invalide en échec INVALID_INPUT tracé', async () => {
    const action = actionBuilder()
      .use(withInput(InputValidation))
      .execute(async ({ input }) => input.nom)

    const result = await action({ nom: '' })

    expect(result).toEqual({
      success: false,
      error: ACTION_INVALID_INPUT_ERROR,
    })
    expect(consoleError).toHaveBeenCalledWith(
      'Server action failed',
      expect.any(z.ZodError),
    )
    expect(captureException).toHaveBeenCalledWith(expect.any(z.ZodError))
  })

  it('convertit une exception du handler en échec TECHNICAL_ERROR tracé', async () => {
    const crash = new Error('infra down')
    const action = actionBuilder().execute(async () => {
      throw crash
    })

    expect(await action()).toEqual({
      success: false,
      error: ACTION_TECHNICAL_ERROR,
    })
    expect(consoleError).toHaveBeenCalledWith('Server action failed', crash)
    expect(captureException).toHaveBeenCalledWith(crash)
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
    expect(captureException).not.toHaveBeenCalled()
  })
})
