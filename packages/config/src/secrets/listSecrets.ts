import {
  projectId,
  requestSecretClientWithRetry,
} from '@app/config/secrets/secretClient'

export const listSecrets = () => {
  console.log('Project ID', projectId)
  console.log('SCW_ORGANIZATION_ID', process.env.SCW_ORGANIZATION_ID)
  console.log('SCW_PROJECT_ID', process.env.SCW_PROJECT_ID)
  console.log('SCW_API_KEY_ID', process.env.SCW_API_KEY_ID)
  console.log(
    'SCW_SECRET_KEY',
    process.env.SCW_SECRET_KEY === '' ? 'is not defined' : 'is defined',
  )

  return requestSecretClientWithRetry<{
    secrets: {
      id: string
      project_id: string
      name: string
      status: 'ready' | 'locked'
      created_at: string
      updated_at: string
      tags: string[]
      version_count: number
      description: string
      region: string
    }[]
  }>({
    method: 'GET',
    url: '/',
    params: {
      page_size: 100,
    },
  }).then(({ data }) => data)
}
