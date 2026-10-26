import { compileMjml } from '@app/emails/mjml'
import { inactiviteProlongeeAvertissementEmail } from '@app/emails/templates/inactiviteProlongeeAvertissementEmail'
import { output } from './output'

compileMjml(
  inactiviteProlongeeAvertissementEmail.mjml({
    firstname: 'Camille',
    dateDeSuppression: '01/01/2027',
  }),
)
  .then(() => {
    output.log('Le bundle des jobs rend les courriels')
    process.exit(0)
  })
  .catch((error: unknown) => {
    output.error(error)
    process.exit(1)
  })
