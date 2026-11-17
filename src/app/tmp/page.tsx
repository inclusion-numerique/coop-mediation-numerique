import { metadataTitle } from '@app/web/app/metadataTitle'
import { entrepotPrismaClient } from '@app/web/entrepotPrismaClient'
import { prismaClient } from '@app/web/prismaClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: metadataTitle('Validation entrepôt - communes'),
}

// Page de validation temporaire. Vérifie que les DEUX connexions cohabitent : la base Coop
// (schéma `coop`, via `prismaClient`) et la base de l'entrepôt Dataspace (schémas `admin/main/…`,
// via `entrepotPrismaClient`). Le compte de `admin.commune` prouve que l'entrepôt est branché.
// Affiche le `current_database()` de chaque connexion pour repérer une mauvaise cible. Tolère
// l'absence du schéma (environnement encore branché sur la seule base Coop).
export const dynamic = 'force-dynamic'

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error)

const currentDatabase = (
  client: typeof prismaClient | typeof entrepotPrismaClient,
): Promise<string | null> =>
  client.$queryRaw<
    { database: string }[]
  >`SELECT current_database() AS database`
    .then(([row]) => row?.database ?? null)
    .catch(() => null)

type Communes = { ok: true; count: number } | { ok: false; error: string }

const countCommunes = (): Promise<Communes> =>
  entrepotPrismaClient.$queryRaw<
    { count: number }[]
  >`SELECT count(*)::int AS count FROM admin.commune`
    .then((rows): Communes => ({ ok: true, count: rows[0]?.count ?? 0 }))
    .catch((error): Communes => ({ ok: false, error: errorMessage(error) }))

const getValidationData = async () => {
  const [coopDatabase, entrepotDatabase, communes] = await Promise.all([
    currentDatabase(prismaClient),
    currentDatabase(entrepotPrismaClient),
    countCommunes(),
  ])
  return { coopDatabase, entrepotDatabase, communes }
}

const TmpValidationPage = async () => {
  const { coopDatabase, entrepotDatabase, communes } = await getValidationData()

  return (
    <main className="fr-container fr-my-8w">
      <h1>Validation entrepôt : cohabitation des connexions</h1>
      <p className="fr-text--lead">
        Compte des communes dans <code>admin.commune</code> via la connexion
        entrepôt, base Coop conservée en parallèle.
      </p>

      <div className="fr-grid-row fr-grid-row--gutters fr-mb-4w">
        <div className="fr-col-12 fr-col-md-6">
          <p className="fr-text--sm fr-text-mention--grey fr-mb-1v">
            Connexion Coop (<code>prismaClient</code>)
          </p>
          <code>{coopDatabase ?? 'injoignable'}</code>
        </div>
        <div className="fr-col-12 fr-col-md-6">
          <p className="fr-text--sm fr-text-mention--grey fr-mb-1v">
            Connexion entrepôt (<code>entrepotPrismaClient</code>)
          </p>
          <code>{entrepotDatabase ?? 'injoignable'}</code>
        </div>
      </div>

      {communes.ok ? (
        <div className="fr-callout">
          <h2 className="fr-callout__title">
            {communes.count.toLocaleString('fr-FR')} communes
          </h2>
          <p className="fr-callout__text">
            <span className="fr-badge fr-badge--success">
              Schéma&ensp;<i>admin</i>&ensp;présent
            </span>{' '}
            L’entrepôt est branché et la table <i>admin.commune</i> est
            accessible sur cet environnement.
          </p>
        </div>
      ) : (
        <div className="fr-callout">
          <h2 className="fr-callout__title">Schéma indisponible</h2>
          <p className="fr-callout__text">
            <span className="fr-badge fr-badge--error">
              Schéma&ensp;<i>admin</i>&ensp;absent
            </span>{' '}
            La table <i>admin.commune</i> n’a pas pu être lue : l’entrepôt n’est
            probablement pas (encore) branché sur cet environnement.
          </p>
          <pre className="fr-text--xs">{communes.error}</pre>
        </div>
      )}
    </main>
  )
}

export default TmpValidationPage
