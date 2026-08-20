import { branch as gitBranch } from 'git-rev-sync'

export const getBranch = () => process.env.CDK_FORCE_BRANCH || gitBranch()

/**
 * Longueur maximale d'un namespace de branche.
 *
 * Elle est imposée par la plus contraignante des ressources qui en dérivent, le
 * bucket S3 des téléversements :
 *
 *     coop-mediation-numerique-uploads-    33 caractères
 *   + namespace                            30 au plus
 *   = 63, la limite d'un nom de bucket
 *
 * Les autres ressources sont plus larges : la base de données et son
 * utilisateur (`coop-mediation-numerique-<ns>`) plafonnent à 55 sur 63, et le
 * sous-domaine de prévisualisation se tronque lui-même (`createPreviewSubdomain`).
 *
 * La valeur était de 32. Les deux caractères de trop ne se payaient qu'au
 * déploiement, sur un `InvalidBucketName` qui ne nomme ni la longueur, ni la
 * branche, ni la ressource — et seulement pour les branches assez longues pour
 * les atteindre.
 */
export const MAX_NAMESPACE_LENGTH = 30

export const computeBranchNamespace = (branch: string) =>
  branch
    // Replace special characters with hyphen
    .replaceAll(/[./@_]/g, '-')
    // Do not include digits
    .replaceAll(/\d/g, '')
    // When digits are removed, there might be multiple hyphens in a row
    .replaceAll(/--+/g, '-')
    // Remove prefix hyphen
    .replace(/^-/, '')
    // Voir `MAX_NAMESPACE_LENGTH` : c'est le nom du bucket S3 qui fixe la borne.
    .slice(0, MAX_NAMESPACE_LENGTH)
    // Remove suffix hyphen
    .replace(/-$/, '')
    .toLowerCase()

export const namespacer = (namespace: string) => (name: string) =>
  `${name}-${namespace}`

export const generateDatabaseUrl = ({
  user,
  password,
  host,
  port,
  name,
}: {
  user: string
  password: string
  host: string
  port: number
  name: string
}) =>
  `postgres://${user}:${encodeURIComponent(password)}@${host}:${port}/${name}`

export const shortenNamespace = (namespace: string, length: number) =>
  namespace
    .slice(0, length)
    // Remove trailing hyphen
    .replace(/-$/, '')
    // Remove trailing underscore
    .replace(/_$/, '')

export const createPreviewSubdomain = (
  namespace: string,
  previewDomain: string,
) => {
  // DNS record has to be 63 chars or shorter
  const maxRecordLength = 63
  // We will add a ".", also remove 1
  const maxNamespaceLength = maxRecordLength - 1 - previewDomain.length

  const subdomain = shortenNamespace(namespace, maxNamespaceLength)

  return { hostname: `${subdomain}.${previewDomain}`, subdomain }
}
