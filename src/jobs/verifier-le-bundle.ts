import { inactiviteProlongeeAvertissementEmail } from '@app/web/features/utilisateurs/abilities/anonymiser-les-comptes-inactifs/implementation/email/inactiviteProlongeeAvertissementEmail'
import { compileMjml } from '@app/web/libraries/emails/mjml'
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
