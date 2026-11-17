import Card from '@app/web/components/Card'
import Badge from '@codegouvfr/react-dsfr/Badge'
import Link from 'next/link'
import type { Contrat } from '../domain'
import { contratAffiche } from './contrat.presenter'

export const CarteContrat = ({
  contrat,
  coordinateur,
}: {
  contrat: Contrat
  coordinateur: boolean
}) => {
  const { type, debut, fin, badge } = contratAffiche(contrat)

  return (
    <Card
      noBorder
      className="fr-border fr-border-radius--8"
      titleAs="h2"
      title={
        <span className="fr-flex fr-flex-gap-3v fr-align-items-center fr-h6 fr-mb-0">
          <span className="fr-flex fr-background-alt--blue-france fr-p-1-5v fr-border-radius--8">
            <img
              width="20px"
              height="20px"
              src={
                coordinateur
                  ? '/images/illustrations/role/coordination.svg'
                  : '/images/illustrations/role/conseillers-numerique.svg'
              }
              alt=""
            />
          </span>
          <span className="fr-text-title--blue-france">
            {coordinateur
              ? 'Contrat coordinateur de conseiller numérique'
              : 'Contrat conseiller numérique'}
          </span>
        </span>
      }
      action={
        badge === null ? undefined : (
          <Badge severity={badge.severite} noIcon={!badge.icone}>
            {badge.libelle.replaceAll(' ', '\u00a0')}
          </Badge>
        )
      }
    >
      <>
        <div className="fr-grid-row fr-text--md fr-mb-3w">
          <div className="fr-col-4 fr-flex fr-direction-column">
            <span className="fr-text-mention--grey">Type de contrat</span>
            <span className="fr-text--semi-bold">{type}</span>
          </div>
          {debut && (
            <div className="fr-col-4 fr-flex fr-direction-column">
              <span className="fr-text-mention--grey">Date de début</span>
              <span className="fr-text--semi-bold">{debut}</span>
            </div>
          )}
          {fin && (
            <div className="fr-col-4 fr-flex fr-direction-column">
              <span className="fr-text-mention--grey">Date de fin</span>
              <span className="fr-text--semi-bold">{fin}</span>
            </div>
          )}
        </div>
        <div className="fr-text--xs fr-background-alt--blue-france fr-text-default--grey fr-mb-0 fr-py-4v fr-px-6v fr-border-radius--8">
          Cette donnée est liée au tableau de pilotage conseillers numériques,
          l’outil utilisé par votre structure employeuse pour mettre à jour les
          informations relatives à votre contrat. Si vous constatez une erreur,
          veuillez d’abord vérifier avec que votre structure qu’elle a bien
          effectué les démarches suivantes : la transmission des documents
          contractuels à la Banque des Territoires ; la mise à jour du tableau
          de pilotage. Si ces démarches ont bien été réalisées et que l’erreur
          persiste, merci de contacter&nbsp;:&nbsp;
          <Link
            className="fr-link fr-link--xs"
            href="mailto:conseiller-numerique@anct.gouv.fr"
          >
            conseiller-numerique@anct.gouv.fr
          </Link>
        </div>
      </>
    </Card>
  )
}
