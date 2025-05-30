import { createJobExecutionCron } from '@app/cdk/createJobExecutionCron'
import { environmentVariablesFromList } from '@app/cdk/environmentVariable'
import { WebCdkOutput } from '@app/cdk/getCdkOutput'
import { createOutput } from '@app/cdk/output'
import { terraformBackend } from '@app/cdk/terraformBackend'
import {
  computeBranchNamespace,
  createPreviewSubdomain,
  namespacer,
} from '@app/cdk/utils'
import {
  containerNamespaceName,
  databaseInstanceName,
  mainDomain,
  mainRootDomain,
  mainSubdomain,
  previewDomain,
  previewRootDomain,
  previewSubdomain,
  projectSlug,
  projectTitle,
  region,
} from '@app/config/config'
import { Container } from '@app/scaleway/container'
import { ContainerDomain } from '@app/scaleway/container-domain'
import { DataScalewayContainerNamespace } from '@app/scaleway/data-scaleway-container-namespace'
import { DataScalewayDomainZone } from '@app/scaleway/data-scaleway-domain-zone'
import { DataScalewayRdbInstance } from '@app/scaleway/data-scaleway-rdb-instance'
import { DomainRecord, DomainRecordConfig } from '@app/scaleway/domain-record'
import { ObjectBucket } from '@app/scaleway/object-bucket'
import { ScalewayProvider } from '@app/scaleway/provider'
import { RdbDatabase } from '@app/scaleway/rdb-database'
import { RdbPrivilege } from '@app/scaleway/rdb-privilege'
import { RdbUser } from '@app/scaleway/rdb-user'
import { Fn, TerraformStack } from 'cdktf'
import { Construct } from 'constructs'

export const webAppStackVariables = [
  'BREVO_USERS_LIST_ID',
  'SCW_DEFAULT_ORGANIZATION_ID',
  'SCW_PROJECT_ID',
  'SCALEWAY_GENERATIVE_API_SERVICE_URL',
  'ALBERT_SERVICE_URL',
  'WEB_CONTAINER_IMAGE',
] as const
export const webAppStackSensitiveVariables = [
  'BREVO_API_KEY',
  'SCW_ACCESS_KEY',
  'SCW_SECRET_KEY',
  'DATABASE_PASSWORD',
  'PROCONNECT_PREVIEW_CLIENT_SECRET',
  'PROCONNECT_MAIN_CLIENT_SECRET',
  'INTERNAL_API_PRIVATE_KEY',
  'CONSEILLER_NUMERIQUE_MONGODB_URL',
  'HMAC_SECRET_KEY',
  'ALBERT_API_KEY',
  'BRAVE_API_KEY',
  'RDV_SERVICE_PUBLIC_PREVIEW_API_KEY',
  'RDV_SERVICE_PUBLIC_PREVIEW_OAUTH_CLIENT_ID',
  'RDV_SERVICE_PUBLIC_PREVIEW_OAUTH_CLIENT_SECRET',
  'RDV_API_KEY',
  'RDV_SERVICE_PUBLIC_MAIN_OAUTH_CLIENT_ID',
  'RDV_SERVICE_PUBLIC_MAIN_OAUTH_CLIENT_SECRET',
] as const

/**
 * This stack represents the web app for a given branch (namespace).
 * It can be deployed for each branch.
 */
export class WebAppStack extends TerraformStack {
  constructor(scope: Construct, branch: string) {
    super(scope, 'web')

    const namespace = computeBranchNamespace(branch)

    const namespaced = namespacer(namespace)

    // ⚠️ When calling this function, do not forget to update typings in src/getCdkOutput.ts
    const output = createOutput<WebCdkOutput>(this)

    const isMain = namespace === 'main'

    // Specific prod instance
    const isSante = namespace === 'sante'

    const { hostname, subdomain } = isMain
      ? { hostname: mainDomain, subdomain: '' }
      : createPreviewSubdomain(namespace, previewDomain)

    const environmentVariables = environmentVariablesFromList(
      this,
      webAppStackVariables,
      { sensitive: false },
    )
    const sensitiveEnvironmentVariables = environmentVariablesFromList(
      this,
      webAppStackSensitiveVariables,
      { sensitive: true },
    )

    // Configuring provider that will be used for the rest of the stack
    new ScalewayProvider(this, 'provider', {
      region,
      accessKey: sensitiveEnvironmentVariables.SCW_ACCESS_KEY.value,
      secretKey: sensitiveEnvironmentVariables.SCW_SECRET_KEY.value,
      organizationId: environmentVariables.SCW_DEFAULT_ORGANIZATION_ID.value,
      projectId: environmentVariables.SCW_PROJECT_ID.value,
    })

    // State of deployed infrastructure for each branch will be stored in the
    // same 'stack-terraform-state' bucket, with namespace in .tfstate filename.
    terraformBackend(this, `web-${namespace}`)

    // The database instance is shared for each namespace/branch we refer to it (DataScaleway)
    // but do not manage it through this stack
    const databaseInstance = new DataScalewayRdbInstance(this, 'dbInstance', {
      name: databaseInstanceName,
    })

    output('databaseHost', databaseInstance.endpointIp)
    output('databasePort', databaseInstance.endpointPort)

    const databaseName = namespaced(projectSlug)
    const databaseUser = namespaced(projectSlug)
    const databasePasswordVariable =
      sensitiveEnvironmentVariables.DATABASE_PASSWORD

    const rdbDatabaseUser = new RdbUser(this, 'databaseUser', {
      name: databaseUser,
      instanceId: databaseInstance.instanceId,
      password: databasePasswordVariable.value,
    })

    const database = new RdbDatabase(this, 'database', {
      name: databaseName,
      instanceId: databaseInstance.instanceId,
    })

    output('databaseUser', databaseUser)
    output('databaseName', databaseName)

    new RdbPrivilege(this, 'databasePrivilege', {
      instanceId: databaseInstance.instanceId,
      databaseName,
      userName: databaseUser,
      permission: 'all',
      dependsOn: [database, rdbDatabaseUser],
    })

    const uploadsBucket = new ObjectBucket(this, 'uploads', {
      name: namespaced(`${projectSlug}-uploads`),
      corsRule: [
        {
          allowedHeaders: ['*'],
          allowedMethods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
          maxAgeSeconds: 3000,
          exposeHeaders: ['Etag'],
          allowedOrigins: [`https://${hostname}`],
        },
      ],
    })

    output('uploadsBucketName', uploadsBucket.name)
    output('uploadsBucketEndpoint', uploadsBucket.endpoint)

    const containerNamespace = new DataScalewayContainerNamespace(
      this,
      'containerNamespace',
      { name: containerNamespaceName },
    )

    const emailFromAddress = isMain
      ? `bot@${mainDomain}`
      : `bot+${namespace}@${mainDomain}`

    const emailFromName = isMain
      ? projectTitle
      : `[${namespace}] ${projectTitle}`

    const databaseUrl = Fn.format('postgres://%s:%s@%s:%s/%s', [
      databaseUser,
      databasePasswordVariable.value,
      databaseInstance.endpointIp,
      databaseInstance.endpointPort,
      databaseName,
    ]) as string

    // Changing the name will recreate a new container
    // The names fails with max length so we shorten it
    const maxContainerNameLength = 34
    const containerName =
      namespace.length > maxContainerNameLength
        ? namespace.slice(0, Math.max(0, maxContainerNameLength))
        : namespace

    const container = new Container(this, 'webContainer', {
      namespaceId: containerNamespace.namespaceId,
      registryImage: environmentVariables.WEB_CONTAINER_IMAGE.value,
      environmentVariables: {
        BREVO_USERS_LIST_ID: environmentVariables.BREVO_USERS_LIST_ID.value,
        EMAIL_FROM_ADDRESS: emailFromAddress,
        EMAIL_FROM_NAME: emailFromName,
        STACK_WEB_IMAGE: environmentVariables.WEB_CONTAINER_IMAGE.value,
        UPLOADS_BUCKET: uploadsBucket.name,
        BASE_URL: hostname,
        NEXTAUTH_URL: hostname,
        BRANCH: branch,
        NAMESPACE: namespace,
        // This env variable is reserved at the level of container namespace. We inject it here even if its shared.
        SCW_DEFAULT_REGION: region,
        SCALEWAY_GENERATIVE_API_SERVICE_URL:
          environmentVariables.SCALEWAY_GENERATIVE_API_SERVICE_URL.value,
        ALBERT_SERVICE_URL: environmentVariables.ALBERT_SERVICE_URL.value,
      },
      secretEnvironmentVariables: {
        BREVO_API_KEY: isMain
          ? sensitiveEnvironmentVariables.BREVO_API_KEY.value
          : '',
        DATABASE_URL: databaseUrl,
        PROCONNECT_CLIENT_SECRET: isMain
          ? sensitiveEnvironmentVariables.PROCONNECT_MAIN_CLIENT_SECRET.value
          : sensitiveEnvironmentVariables.PROCONNECT_PREVIEW_CLIENT_SECRET
              .value,
        RDV_SERVICE_PUBLIC_OAUTH_CLIENT_ID: isMain
          ? sensitiveEnvironmentVariables
              .RDV_SERVICE_PUBLIC_MAIN_OAUTH_CLIENT_ID.value
          : sensitiveEnvironmentVariables
              .RDV_SERVICE_PUBLIC_PREVIEW_OAUTH_CLIENT_ID.value,
        RDV_SERVICE_PUBLIC_OAUTH_CLIENT_SECRET: isMain
          ? sensitiveEnvironmentVariables
              .RDV_SERVICE_PUBLIC_MAIN_OAUTH_CLIENT_SECRET.value
          : sensitiveEnvironmentVariables
              .RDV_SERVICE_PUBLIC_PREVIEW_OAUTH_CLIENT_SECRET.value,
        RDV_SERVICE_PUBLIC_API_KEY: isMain
          ? sensitiveEnvironmentVariables.RDV_API_KEY.value
          : sensitiveEnvironmentVariables.RDV_SERVICE_PUBLIC_PREVIEW_API_KEY
              .value,
        INTERNAL_API_PRIVATE_KEY:
          sensitiveEnvironmentVariables.INTERNAL_API_PRIVATE_KEY.value,
        CONSEILLER_NUMERIQUE_MONGODB_URL:
          sensitiveEnvironmentVariables.CONSEILLER_NUMERIQUE_MONGODB_URL.value,
        HMAC_SECRET_KEY: sensitiveEnvironmentVariables.HMAC_SECRET_KEY.value,
        ALBERT_API_KEY: sensitiveEnvironmentVariables.ALBERT_API_KEY.value,
        BRAVE_API_KEY: sensitiveEnvironmentVariables.BRAVE_API_KEY.value,
      },
      name: containerName,
      minScale: isMain ? 2 : isSante ? 1 : namespace === 'dev' ? 1 : 0,
      maxScale: isMain ? 5 : 1,
      cpuLimit: isMain || isSante ? 3000 : 1120, // mVPCU
      memoryLimit: isMain || isSante ? 3072 : 2048, // mB
      deploy: true,
    })

    const domainZone = new DataScalewayDomainZone(this, 'dnsZone', {
      domain: isMain ? mainRootDomain : previewRootDomain,
      subdomain: isMain ? mainSubdomain : previewSubdomain,
    })

    const webDnsRecordConfig: DomainRecordConfig = subdomain
      ? {
          type: 'CNAME',
          dnsZone: domainZone.id,
          name: subdomain,
          data: `${container.domainName}.`,
          ttl: 60 * 5,
        }
      : {
          // Root domain record cannot be CNAME
          type: 'ALIAS',
          dnsZone: domainZone.id,
          name: '',
          data: `${container.domainName}.`,
          ttl: 60 * 5,
        }

    const webDnsRecord = new DomainRecord(
      this,
      'webDnsRecord',
      webDnsRecordConfig,
    )

    new ContainerDomain(this, 'webContainerDomain', {
      containerId: container.id,
      hostname,
      dependsOn: [webDnsRecord, container],
    })

    if (isMain) {
      // Weekly backup job
      createJobExecutionCron(this, {
        name: `backup-${namespace}-database-weekly`,
        job: {
          name: 'backup-database',
          payload: {
            databaseName,
            type: 'weekly',
          },
        },
        schedule: '0 0 * * 0',
        containerId: container.id,
      })

      // Daily backup job
      createJobExecutionCron(this, {
        name: `backup-${namespace}-database-daily`,
        job: {
          name: 'backup-database',
          payload: {
            databaseName,
            type: 'daily',
          },
        },
        schedule: '0 0 * * *',
        containerId: container.id,
      })

      // Daily update of the structure referent
      createJobExecutionCron(this, {
        name: 'update-conum-structure-referent',
        job: {
          name: 'update-conum-structure-referent',
        },
        schedule: '0 0 * * *',
        containerId: container.id,
      })

      // Daily update conseillers numériques info
      createJobExecutionCron(this, {
        name: 'update-conum-info',
        job: {
          name: 'update-conum-info',
        },
        schedule: '0 0 * * *',
        containerId: container.id,
      })

      // Daily update synchronize conseillers numériques
      createJobExecutionCron(this, {
        name: 'sync-conums',
        job: {
          name: 'sync-conums',
        },
        schedule: '0 0 * * *',
        containerId: container.id,
      })

      // Hourly backup job
      createJobExecutionCron(this, {
        name: `backup-${namespace}-database-hourly`,
        job: {
          name: 'backup-database',
          payload: {
            databaseName,
            type: 'hourly',
          },
        },
        schedule: '0 * * * *',
        containerId: container.id,
      })
    }

    createJobExecutionCron(this, {
      name: `update-structures-cartographie-nationale`,
      job: {
        name: 'update-structures-cartographie-nationale',
        payload: undefined,
      },
      schedule: '0 3 * * *',
      containerId: container.id,
    })

    output('webBaseUrl', hostname)
    output('containerDomainName', container.domainName)
    output('databaseUrl', databaseUrl, 'sensitive')
    output('databasePassword', databasePasswordVariable.value, 'sensitive')
    output(
      'webContainerStatus',
      container.status as WebCdkOutput['webContainerStatus'],
    )
    output('webContainerId', container.id)
    output('webContainerImage', environmentVariables.WEB_CONTAINER_IMAGE.value)
  }
}
