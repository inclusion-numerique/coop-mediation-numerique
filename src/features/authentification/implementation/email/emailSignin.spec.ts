import { describe, expect, it } from 'vitest'
import { emailSignin } from '@/features/authentification/implementation/email/emailSignin'
import { createMjmlTemplateOutput } from '@/libraries/emails/outputTemplateHtml'

describe('Template: emailSignin', () => {
  const output = createMjmlTemplateOutput('emailSignin')

  it('Compiles hello world react mjml template', async () => {
    const mjml = emailSignin.mjml({
      url: 'https://test.local?token=oui',
    })

    expect(mjml).toContain('Connexion')
    expect(mjml).toContain('https://test.local?token=oui')

    await output(mjml)
  })
})
