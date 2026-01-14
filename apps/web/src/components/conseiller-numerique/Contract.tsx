import Card from '@app/web/components/Card'
import { AlerteFinContrat } from '@app/web/conseiller-numerique/getContractInfo'
import Badge from '@codegouvfr/react-dsfr/Badge'
import Link from 'next/link'
import React from 'react'

const Contract = ({
  isCoordinateur,
  type,
  debut,
  fin,
  finDeContrat,
  idPGConum,
}: {
  isCoordinateur: boolean
  type: string
  debut: string | null
  fin: string | null
  finDeContrat: AlerteFinContrat | null
  idPGConum?: number | null
}) => (
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
              isCoordinateur
                ? '/images/illustrations/role/coordination.svg'
                : '/images/illustrations/role/conseillers-numerique.svg'
            }
            alt=""
          />
        </span>
        <span className="fr-text-title--blue-france">
          {isCoordinateur
            ? 'Contrat coordinateur de conseiller numérique'
            : 'Contrat conseiller numérique'}
        </span>
      </span>
    }
    action={
      <span>
        {finDeContrat &&
          (finDeContrat === AlerteFinContrat.prochainement ? (
            <Badge severity="warning">
              Fin&nbsp;de&nbsp;contrat&nbsp;prochaine
            </Badge>
          ) : null)}
        {finDeContrat &&
          (finDeContrat === AlerteFinContrat.termine ? (
            <Badge severity="error" noIcon>
              Contrat&nbsp;terminé
            </Badge>
          ) : null)}
      </span>
    }
  >
    <>
      <div className="fr-grid-row fr-text--md fr-mb-3w">
        {!!idPGConum && (
          <div className="fr-col-3 fr-flex fr-direction-column">
            <span className="fr-text-mention--grey">ID Conum</span>
            <span className="fr-text--semi-bold">{idPGConum}</span>
          </div>
        )}
        <div
          className={`fr-col-${idPGConum == null ? '4' : '3'} fr-flex fr-direction-column`}
        >
          <span className="fr-text-mention--grey">Type de contrat</span>
          <span className="fr-text--semi-bold">{type}</span>
        </div>
        {debut && (
          <div
            className={`fr-col-${idPGConum == null ? '4' : '3'} fr-flex fr-direction-column`}
          >
            <span className="fr-text-mention--grey">Date de début</span>
            <span className="fr-text--semi-bold">{debut}</span>
          </div>
        )}
        {fin && (
          <div
            className={`fr-col-${idPGConum == null ? '4' : '3'} fr-flex fr-direction-column`}
          >
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
        contractuels à la Banque des Territoires ; la mise à jour du tableau de
        pilotage. Si ces démarches ont bien été réalisées et que l’erreur
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

export default Contract
