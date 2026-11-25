import { Octokit } from '@octokit/core'
import { restEndpointMethods } from '@octokit/plugin-rest-endpoint-methods'
import { environnementOutillage } from '@/configuration/environnement/serveur'
import { projectSlug } from '@/configuration/projet'

export const owner = 'inclusion-numerique'
export const repo = projectSlug()

const token = environnementOutillage().GITHUB_TOKEN

if (!token) {
  throw new Error(
    'Missing GITHUB_TOKEN env variable for octokit authentication',
  )
}

const OctokitWithPlugins = Octokit.plugin(restEndpointMethods)

export const octokit = new OctokitWithPlugins({ auth: token })
