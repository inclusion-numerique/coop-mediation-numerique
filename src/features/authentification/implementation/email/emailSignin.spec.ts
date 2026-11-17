import { emailSignin } from '@app/web/features/authentification/implementation/email/emailSignin'
import { createMjmlTemplateOutput } from '@app/web/libraries/emails/outputTemplateHtml'
import { describe, expect, it } from 'vitest'

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
