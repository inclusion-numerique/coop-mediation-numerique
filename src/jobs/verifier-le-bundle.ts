import { inactiviteProlongeeAvertissementEmail } from '@/features/utilisateurs/abilities/anonymiser-les-comptes-inactifs/implementations/email/avertissement-d-inactivite-prolongee.email'
import { compileMjml } from '@/libraries/emails/mjml'
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
