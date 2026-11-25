import { environnementClient } from '@/configuration/environnement'

export const projectTitle = () => environnementClient().NEXT_PUBLIC_APP_NAME
export const projectSlug = () => environnementClient().NEXT_PUBLIC_APP_SLUG
export const mainLiveUrl = () =>
  `https://${projectSlug()}.incubateur.anct.gouv.fr`
export const repositoryUrl = () =>
  `https://github.com/inclusion-numerique/${projectSlug()}`

export const cypressProjectId = 'n4w1es'
export const chromaticAppId = '661549fb7cb5474a3bf7d8d7'

export const contactEmail = () =>
  environnementClient().NEXT_PUBLIC_CONTACT_EMAIL
export const centreAideUrl =
  'https://docs.numerique.gouv.fr/docs/1cf724be-c40c-4299-906d-df22c181c77b/'
