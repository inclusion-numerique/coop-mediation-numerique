import { describe, expect, it } from 'vitest'
import { connexionParCourriel } from '@/features/authentification/implementations/email/connexion-par-courriel.email'
import { createMjmlTemplateOutput } from '@/libraries/emails/rendu'

describe('Template: connexionParCourriel', () => {
  const output = createMjmlTemplateOutput('emailSignin')

  it('Compiles hello world react mjml template', async () => {
    const mjml = connexionParCourriel.mjml({
      url: 'https://test.local?token=oui',
    })

    expect(mjml).toContain('Connexion')
    expect(mjml).toContain('https://test.local?token=oui')

    await output(mjml)
  })
})
