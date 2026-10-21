import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import {
  coordinateurDe,
  type Jalon,
  mediateurDe,
} from '@app/web/features/utilisateurs/domain'
import { BadgeStatutCompte } from '@app/web/features/utilisateurs/ui'
import { telephoneDisplayString } from '@app/web/libraries/telephone'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationInfoCard from '@app/web/libs/ui/administration/AdministrationInfoCard'
import AdministrationInlineLabelsValues from '@app/web/libs/ui/administration/AdministrationInlineLabelsValues'
import AdministrationMailtoLink from '@app/web/libs/ui/administration/AdministrationMailtoLink'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { dateAsDay } from '@app/web/utils/dateAsDay'
import {
  dateAsDayAndTime,
  dateAsDayAndTimeInTimeZone,
} from '@app/web/utils/dateAsDayAndTime'
import { numberToString } from '@app/web/utils/formatNumber'
import { contentId } from '@app/web/utils/skipLinks'
import Badge from '@codegouvfr/react-dsfr/Badge'
import Tag from '@codegouvfr/react-dsfr/Tag'
import Link from 'next/link'
import type { ReactNode } from 'react'
import type { Evenement, FicheUtilisateur } from '../../domain'

export type SectionsDeLaFiche = {
  readonly actions: ReactNode
  readonly avertissements: ReactNode
  readonly outils: ReactNode
  readonly deconnexion: ReactNode
  readonly visibiliteCarto: ReactNode
  readonly equipe: ReactNode
  readonly employeuses: ReactNode
  readonly lieux: ReactNode
}

const aParis = (jalon: Jalon): string =>
  jalon._tag === 'Le'
    ? dateAsDayAndTimeInTimeZone(jalon.date, 'Europe/Paris')
    : 'Jamais'

const Evenements = ({
  evenements,
  prefixe,
  vide,
}: {
  evenements: readonly Evenement[]
  prefixe: string
  vide: string
}) =>
  evenements.length === 0 ? (
    <p className="fr-mb-0">{vide}</p>
  ) : (
    <AdministrationInlineLabelsValues
      items={evenements.map(({ libelle, le }) => ({
        label: libelle,
        value: `${prefixe} ${dateAsDayAndTime(le)}`,
      }))}
    />
  )

export const FicheUtilisateurPage = ({
  fiche,
  sections,
}: {
  fiche: FicheUtilisateur
  sections: SectionsDeLaFiche
}) => {
  const mediateur = mediateurDe(fiche.rattachements)
  const coordinateur = coordinateurDe(fiche.rattachements)

  return (
    <CoopPageContainer size={64}>
      <SkipLinksPortal />
      <AdministrationBreadcrumbs
        currentPage={fiche.nomAffiche}
        parents={[
          {
            label: 'Utilisateurs',
            linkProps: { href: '/administration/utilisateurs' },
          },
        ]}
      />
      <main id={contentId}>
        <AdministrationTitle
          icon="fr-icon-user-line"
          actions={sections.actions}
        >
          {fiche.nomAffiche} <span className="fr-mx-1v" />{' '}
          <BadgeStatutCompte statut={fiche.statut} />
        </AdministrationTitle>
        {sections.avertissements}
        <div className="fr-flex fr-flex-gap-2v fr-mb-6v">
          {fiche.role === 'Admin' && <Tag small>Administrateur</Tag>}
          {fiche.role === 'Support' && <Tag small>Support</Tag>}
          {mediateur !== null && <Tag small>Médiateur</Tag>}
          {fiche.dispositif === 'ConseillerNumerique' && (
            <Tag small>Conseiller numérique</Tag>
          )}
          {coordinateur !== null && <Tag small>Coordinateur</Tag>}
        </div>
        <AdministrationInfoCard
          title="Détails de l'utilisateur"
          actions={sections.outils}
        >
          <AdministrationInlineLabelsValues
            items={[
              { label: 'Id', value: fiche.id },
              { label: 'Prénom', value: fiche.prenom || 'Non renseigné' },
              { label: 'Nom de famille', value: fiche.nom || 'Non renseigné' },
              {
                label: 'Email',
                value: <AdministrationMailtoLink email={fiche.courriel} />,
              },
              {
                label: 'Téléphone',
                value: fiche.telephone
                  ? telephoneDisplayString(fiche.telephone)
                  : 'Non renseigné',
              },
              { label: 'Rôle sécurité', value: fiche.role },
              {
                label: 'Dispositif',
                value:
                  fiche.dispositif === 'ConseillerNumerique' ? (
                    <Badge noIcon severity="info">
                      Conseiller numérique
                    </Badge>
                  ) : (
                    <Badge noIcon className="fr-text-mention--grey">
                      -
                    </Badge>
                  ),
              },
              { label: 'Siret ProConnect', value: fiche.siret || '-' },
              { label: 'Créé le', value: dateAsDay(fiche.creeLe) },
              {
                label: 'Dernière connexion',
                value: (
                  <div className="fr-grid-row fr-grid-row--middle fr-grid-row--gutters">
                    <div className="fr-col-auto">
                      {aParis(fiche.derniereConnexion)}
                    </div>
                    <div className="fr-col-auto">{sections.deconnexion}</div>
                  </div>
                ),
              },
              { label: 'Dernière visite', value: aParis(fiche.derniereVisite) },
              {
                label: 'Profil d’inscription',
                value: fiche.profilInscription || 'Non renseigné',
              },
              {
                label: 'Inscription validée',
                value: fiche.inscritLe
                  ? dateAsDayAndTime(fiche.inscritLe)
                  : 'Non',
              },
            ]}
          />
        </AdministrationInfoCard>
        {mediateur !== null && (
          <AdministrationInfoCard title="Rôle médiateur">
            <AdministrationInlineLabelsValues
              items={[
                { label: 'ID Médiateur', value: mediateur.id },
                { label: 'Créé le', value: dateAsDay(mediateur.creeLe) },
                { label: 'Modifié le', value: dateAsDay(mediateur.modifieLe) },
                {
                  label: 'Nombre de bénéficiaires',
                  value: numberToString(mediateur.beneficiaires),
                },
                {
                  label: 'Nombre d’activités',
                  value: numberToString(mediateur.activites),
                },
                { label: 'Lieux d’activité', value: mediateur.lieuxActivite },
                {
                  label: 'Visible sur la cartographie',
                  value: sections.visibiliteCarto,
                },
                {
                  label: 'Coordoné(e) par',
                  value:
                    mediateur.coordinations.length > 0 ? (
                      mediateur.coordinations.map(
                        ({ coordinateurUtilisateurId, nom }) => (
                          <Link
                            key={coordinateurUtilisateurId}
                            href={`/administration/utilisateurs/${coordinateurUtilisateurId}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {nom}
                          </Link>
                        ),
                      )
                    ) : (
                      <Badge severity="warning">Aucune coordination</Badge>
                    ),
                },
              ]}
            />
          </AdministrationInfoCard>
        )}
        {coordinateur !== null && (
          <AdministrationInfoCard title="Rôle coordinateur" id="coordinateur">
            <AdministrationInlineLabelsValues
              items={[
                { label: 'ID Coordinateur', value: coordinateur.id },
                { label: 'Créé le', value: dateAsDay(coordinateur.creeLe) },
                {
                  label: 'Modifié le',
                  value: dateAsDay(coordinateur.modifieLe),
                },
                {
                  label: 'Nombre de médiateurs coordonnés',
                  value: numberToString(coordinateur.mediateursCoordonnes),
                },
              ]}
            />
            {sections.equipe}
          </AdministrationInfoCard>
        )}
        {(mediateur !== null || coordinateur !== null) && sections.employeuses}
        {mediateur !== null && sections.lieux}
        <AdministrationInfoCard
          title="Sessions de connexion et comptes liés"
          actions={sections.deconnexion}
        >
          <AdministrationInlineLabelsValues
            items={[
              ...(fiche.liaisons.length > 0
                ? fiche.liaisons.map(({ fournisseur, identifiant }) => ({
                    label: `Sub ID ${fournisseur}`,
                    value: identifiant,
                  }))
                : [
                    {
                      label: 'Compte',
                      value: "Aucun provider d'authentification lié",
                    },
                  ]),
              ...(fiche.sessions.length > 0
                ? fiche.sessions.map(({ libelle, le }) => ({
                    label: libelle,
                    value: `Expire le ${dateAsDayAndTime(le)}`,
                  }))
                : [{ label: 'Session', value: 'Aucune session' }]),
            ]}
          />
        </AdministrationInfoCard>
        <AdministrationInfoCard title="Mutations">
          <Evenements
            evenements={fiche.mutations}
            prefixe="Date:"
            vide="Aucune mutation enregistrée."
          />
        </AdministrationInfoCard>
        {fiche.fichiers.length > 0 && (
          <AdministrationInfoCard title="Uploads">
            <Evenements
              evenements={fiche.fichiers}
              prefixe="Uploadé le:"
              vide=""
            />
          </AdministrationInfoCard>
        )}
      </main>
    </CoopPageContainer>
  )
}
