import Badge from '@codegouvfr/react-dsfr/Badge'
import Button from '@codegouvfr/react-dsfr/Button'
import Tag from '@codegouvfr/react-dsfr/Tag'
import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  coordinateurDe,
  inscription,
  type Jalon,
  mediateurDe,
} from '@/features/utilisateurs/domain'
import { BadgeStatutCompte } from '@/features/utilisateurs/ui/components/BadgeStatutCompte'
import {
  hrefDAjoutALEquipe,
  hrefDeLaFusion,
  hrefDeLUtilisateur,
} from '@/features/utilisateurs/ui/presenters/liens.presenter'
import {
  dateAsDay,
  dateAsDayAndTime,
  dateAsDayAndTimeInTimeZone,
} from '@/libraries/date'
import { contentId } from '@/libraries/liens-d-evitement'
import { SkipLinksPortal } from '@/libraries/liens-d-evitement/composants'
import { numberToString } from '@/libraries/nombre'
import {
  AdministrationBreadcrumbs,
  AdministrationInfoCard,
  AdministrationInlineLabelsValues,
  AdministrationMailtoLink,
  AdministrationTitle,
  CoopPageContainer,
} from '@/libraries/ui/components'
import type { Evenement, FicheUtilisateur } from '../../domain'
import {
  compteSupprime,
  etiquettesDuCompte,
  renseigne,
  telephoneAffiche,
} from '../presenters/fiche-utilisateur.presenter'

export type SectionsDeLaFiche = {
  readonly roles: ReactNode
  readonly suppression: ReactNode
  readonly avertissements: ReactNode
  readonly usurpation: ReactNode
  readonly deconnexion: ReactNode
  readonly visibiliteCarto: ReactNode
  readonly equipe: ReactNode
  readonly employeuses: ReactNode
  readonly lieux: ReactNode
  readonly statistiques: ReactNode
}

const aParis = (jalon: Jalon): string =>
  jalon._tag === 'Le'
    ? dateAsDayAndTimeInTimeZone(jalon.date, 'Europe/Paris')
    : 'Jamais'

const inscriptionValidee = (jalon: Jalon): string =>
  jalon._tag === 'Le' ? dateAsDayAndTime(jalon.date) : 'Non'

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
  const supprime = compteSupprime(fiche)
  const deconnexion = supprime ? null : sections.deconnexion
  const visibiliteCarto = supprime ? null : sections.visibiliteCarto

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
          actions={
            supprime ? null : (
              <div className="fr-flex fr-flex-gap-2v">
                {sections.roles}
                {fiche.role === 'User' && sections.suppression}
              </div>
            )
          }
        >
          {fiche.nomAffiche} <span className="fr-mx-1v" />{' '}
          <BadgeStatutCompte statut={fiche.statut} />
        </AdministrationTitle>
        {sections.avertissements}
        <div className="fr-flex fr-flex-gap-2v fr-mb-6v">
          {etiquettesDuCompte(fiche).map((etiquette) => (
            <Tag key={etiquette} small>
              {etiquette}
            </Tag>
          ))}
        </div>
        <AdministrationInfoCard
          title="Détails de l'utilisateur"
          actions={
            <div>
              {sections.usurpation}
              {!supprime && (
                <Button
                  iconId="fr-icon-git-merge-line"
                  priority="tertiary"
                  size="small"
                  linkProps={{
                    href: hrefDeLaFusion(fiche.id),
                  }}
                >
                  Fusionner avec un autre utilisateur
                </Button>
              )}
            </div>
          }
        >
          <AdministrationInlineLabelsValues
            items={[
              { label: 'Id', value: fiche.id },
              { label: 'Prénom', value: renseigne(fiche.prenom) },
              { label: 'Nom de famille', value: renseigne(fiche.nom) },
              {
                label: 'Email',
                value: <AdministrationMailtoLink email={fiche.courriel} />,
              },
              {
                label: 'Téléphone',
                value: telephoneAffiche(fiche),
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
                    <div className="fr-col-auto">{deconnexion}</div>
                  </div>
                ),
              },
              { label: 'Dernière visite', value: aParis(fiche.derniereVisite) },
              {
                label: 'Inscription validée',
                value: inscriptionValidee(inscription(fiche.cycle)),
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
                  value:
                    visibiliteCarto ??
                    (mediateur.visible ? 'Visible' : 'Non visible'),
                },
                {
                  label: 'Coordonné(e) par',
                  value:
                    mediateur.coordinations.length > 0 ? (
                      mediateur.coordinations.map(
                        ({ coordinateurUtilisateurId, nom }) => (
                          <Link
                            key={coordinateurUtilisateurId}
                            href={hrefDeLUtilisateur(coordinateurUtilisateurId)}
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
            {sections.equipe !== null && (
              <>
                <div className="fr-flex fr-mt-8v fr-mb-6v fr-align-items-center fr-justify-content-space-between">
                  <h5 className="fr-mb-0">Équipe</h5>
                  <Button
                    iconId="fr-icon-user-add-line"
                    priority="secondary"
                    size="small"
                    linkProps={{
                      href: hrefDAjoutALEquipe(fiche.id),
                    }}
                  >
                    Ajouter un membre
                  </Button>
                </div>
                {sections.equipe}
              </>
            )}
          </AdministrationInfoCard>
        )}
        {sections.statistiques}
        {(mediateur !== null || coordinateur !== null) && sections.employeuses}
        {mediateur !== null && sections.lieux}
        <AdministrationInfoCard
          title="Sessions de connexion et comptes liés"
          actions={deconnexion}
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
      </main>
    </CoopPageContainer>
  )
}
