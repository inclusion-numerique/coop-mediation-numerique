import AdministrationInfoCard from '@app/web/app/administration/AdministrationInfoCard'
import AdministrationInlineLabelsValues from '@app/web/app/administration/AdministrationInlineLabelsValues'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { dateAsDayAndTimeInTimeZone } from '@app/web/utils/dateAsDayAndTime'
import { numberToString } from '@app/web/utils/formatNumber'
import { contentId } from '@app/web/utils/skipLinks'
import AdministrationSyncUserDataButton from './AdministrationSyncUserDataButton'
import type { AdministrationRdvspUserData } from './getAdministrationRdvspUserData'

const renderDriftCell = ({ value }: { value: number }) =>
  value > 0 ? (
    <span className="fr-text--bold">{numberToString(value)}</span>
  ) : (
    numberToString(value)
  )

const renderDriftRow = ({
  label,
  count,
  drift,
  noop,
  created,
  updated,
  deleted,
}: {
  label: string
  count: number
  drift: number
  noop: number
  created: number
  updated: number
  deleted: number
}) => {
  return (
    <tr>
      <td>{label}</td>
      <td className="fr-text--right">{count}</td>
      <td className="fr-text--right">{renderDriftCell({ value: drift })}</td>
      <td className="fr-text--right">{noop}</td>
      <td className="fr-text--right">{created}</td>
      <td className="fr-text--right">{updated}</td>
      <td className="fr-text--right">{deleted}</td>
    </tr>
  )
}

export const AdministrationRdvspUserPage = async ({
  data: {
    user: { name, rdvAccount, id: userId },
  },
  timezone = 'Europe/Paris',
}: {
  data: AdministrationRdvspUserData
  timezone?: string
}) => {
  const { syncLogs } = rdvAccount
  const lastSync = syncLogs.at(0)

  return (
    <CoopPageContainer>
      <SkipLinksPortal />
      <AdministrationBreadcrumbs
        parents={[
          {
            label: 'Fonctionnalités',
            linkProps: { href: `/administration/fonctionnalites` },
          },
          {
            label: 'RDVSP',
            linkProps: { href: `/administration/fonctionnalites/rdvsp` },
          },
        ]}
        currentPage={name ?? 'Utilisateur'}
      />
      <main id={contentId}>
        <AdministrationTitle icon="ri-calendar-check-line">
          Rendez-Vous Service Public - {name ?? 'Détails'}
        </AdministrationTitle>
        <AdministrationInfoCard title="Détails de l’intégration">
          <AdministrationInlineLabelsValues
            items={[
              {
                label: 'Identifiant chez RDVSP',
                value: rdvAccount.id,
              },
              {
                label: `${numberToString(rdvAccount.organisations.length)} organisations`,
                value: rdvAccount.organisations
                  .map((organisation) => organisation.organisation.name)
                  .join(', '),
              },
              {
                label: 'Nombre de RDVs',
                value: numberToString(rdvAccount._count.rdvs),
              },
              {
                label: 'Création de l’intégration',
                value: dateAsDayAndTimeInTimeZone(rdvAccount.created, timezone),
              },
              {
                label: 'Date limite de synchronisation',
                value: rdvAccount.syncFrom
                  ? dateAsDayAndTimeInTimeZone(rdvAccount.syncFrom, timezone)
                  : 'Aucune',
              },
              {
                label: 'Statut de la connexion',
                value:
                  rdvAccount.accessToken && rdvAccount.refreshToken
                    ? 'Connecté'
                    : 'Déconnecté',
              },
              { label: 'Erreur de connexion', value: rdvAccount.error || '-' },
              {
                label: 'Affichage des RDVs dans "mes activités"',
                value: rdvAccount.includeRdvsInActivitesList ? 'Oui' : 'Non',
              },
            ]}
          />
        </AdministrationInfoCard>
        <AdministrationInfoCard
          title="Dernière synchronisation"
          actions={<AdministrationSyncUserDataButton user={{ id: userId }} />}
        >
          {lastSync ? (
            <>
              <AdministrationInlineLabelsValues
                items={[
                  {
                    label: 'Début',
                    value: dateAsDayAndTimeInTimeZone(
                      lastSync.started,
                      timezone,
                    ),
                  },
                  {
                    label: 'Durée',
                    value: lastSync.ended
                      ? `${numberToString(
                          Math.round(
                            (lastSync.ended.getTime() -
                              lastSync.started.getTime()) /
                              1000,
                          ),
                        )}s`
                      : 'En cours, la synchronisation peut prendre jusqu’a 2 minutes...',
                  },
                  { label: 'Erreur', value: lastSync.error || '-' },
                  { label: 'Drift', value: numberToString(lastSync.drift) },
                ]}
              />
              <div className="fr-table" data-fr-js-table="true">
                <div className="fr-table__wrapper">
                  <div className="fr-table__container">
                    <div className="fr-table__content">
                      <table data-fr-js-table-element="true">
                        <thead>
                          <tr>
                            <th scope="col">Modèle</th>
                            <th scope="col" className="fr-text--right">
                              Total RDV Api
                            </th>
                            <th scope="col" className="fr-text--right">
                              Drift
                            </th>
                            <th scope="col" className="fr-text--right">
                              Noop
                            </th>
                            <th scope="col" className="fr-text--right">
                              Créé
                            </th>
                            <th scope="col" className="fr-text--right">
                              Mis à jour
                            </th>
                            <th scope="col" className="fr-text--right">
                              Supprimé
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {renderDriftRow({
                            label: 'Webhooks',
                            count: lastSync.webhooksCount,
                            drift: lastSync.webhooksDrift,
                            noop: lastSync.webhooksNoop,
                            created: lastSync.webhooksCreated,
                            updated: lastSync.webhooksUpdated,
                            deleted: lastSync.webhooksDeleted,
                          })}
                          {renderDriftRow({
                            label: 'RDVs',
                            count: lastSync.rdvsCount,
                            drift: lastSync.rdvsDrift,
                            noop: lastSync.rdvsNoop,
                            created: lastSync.rdvsCreated,
                            updated: lastSync.rdvsUpdated,
                            deleted: lastSync.rdvsDeleted,
                          })}
                          {renderDriftRow({
                            label: 'Organisations',
                            count: lastSync.organisationsCount,
                            drift: lastSync.organisationsDrift,
                            noop: lastSync.organisationsNoop,
                            created: lastSync.organisationsCreated,
                            updated: lastSync.organisationsUpdated,
                            deleted: lastSync.organisationsDeleted,
                          })}
                          {renderDriftRow({
                            label: 'Utilisateurs',
                            count: lastSync.usersCount,
                            drift: lastSync.usersDrift,
                            noop: lastSync.usersNoop,
                            created: lastSync.usersCreated,
                            updated: lastSync.usersUpdated,
                            deleted: lastSync.usersDeleted,
                          })}
                          {renderDriftRow({
                            label: 'Motifs',
                            count: lastSync.motifsCount,
                            drift: lastSync.motifsDrift,
                            noop: lastSync.motifsNoop,
                            created: lastSync.motifsCreated,
                            updated: lastSync.motifsUpdated,
                            deleted: lastSync.motifsDeleted,
                          })}
                          {renderDriftRow({
                            label: 'Lieux',
                            count: lastSync.lieuxCount,
                            drift: lastSync.lieuxDrift,
                            noop: lastSync.lieuxNoop,
                            created: lastSync.lieuxCreated,
                            updated: lastSync.lieuxUpdated,
                            deleted: lastSync.lieuxDeleted,
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <p className="fr-text--sm fr-text--bold fr-mb-2v">
                Log de la synchronisation :
              </p>
              <pre className="fr-text--xs fr-mb-0 fr-border-radius--8 fr-background-alt--grey fr-p-4v">
                {lastSync.log}
              </pre>
            </>
          ) : (
            <span className="fr-text--error fr-text--xs fr-mb-0">
              Aucune synchronisation
            </span>
          )}
        </AdministrationInfoCard>
      </main>
    </CoopPageContainer>
  )
}
