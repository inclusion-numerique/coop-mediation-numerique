import { environnementClient } from '@/configuration/environnement/client'

export const projectTitle = environnementClient.NEXT_PUBLIC_APP_NAME
export const projectSlug = environnementClient.NEXT_PUBLIC_APP_SLUG
export const mainLiveUrl = `https://${projectSlug}.incubateur.anct.gouv.fr`
export const repositoryUrl = `https://github.com/inclusion-numerique/${projectSlug}`

export const cypressProjectId = 'n4w1es'
export const chromaticAppId = '661549fb7cb5474a3bf7d8d7'
