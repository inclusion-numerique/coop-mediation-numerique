import { BeneficiaireInformationsPageData } from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/(informations)/getBeneficiaireInformationsPageData'
import BeneficiairePageNavigationBar from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/BeneficiairePageNavigationBar'
import { DeleteBeneficiaireModal } from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/DeleteBeneficiaireModal'
import {
  genreLabels,
  statutSocialLabels,
  trancheAgeLabels,
} from '@app/web/beneficiaire/beneficiaire'
import InfoLabelValue from '@app/web/components/InfoLabelValue'
import { dateAsDay } from '@app/web/utils/dateAsDay'
import Button from '@codegouvfr/react-dsfr/Button'
import Tag from '@codegouvfr/react-dsfr/Tag'
import styles from './ViewBeneficiaireInformationsPage.module.css'

const ViewBeneficiaireInformationsPage = ({
  data: { beneficiaire, thematiquesCounts, totalActivitesCount },
}: {
  data: BeneficiaireInformationsPageData
}) => {
  const {
    notes,
    telephone,
    email,
    pasDeTelephone,
    communeCodePostal,
    commune,
    communeCodeInsee,
    genre,
    statutSocial,
    trancheAge,
  } = beneficiaire
  return (
    <>
      <BeneficiairePageNavigationBar
        beneficiaireId={beneficiaire.id}
        accompagnementsCount={totalActivitesCount}
        current="informations"
      />
      <div className="fr-border-radius--8 fr-border fr-mt-6v fr-mb-10v">
        <div className="fr-border--bottom fr-py-6v fr-px-8v fr-flex fr-flex-gap-6v fr-align-items-center fr-justify-content-space-between">
          <div>
            <h3 className="fr-h6 fr-mb-0">Informations bénéficiaire</h3>
            <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
              Créé le {dateAsDay(beneficiaire.creation)}
            </p>
          </div>
          <div>
            <Button
              iconId="fr-icon-edit-line"
              iconPosition="right"
              size="small"
              priority="tertiary no outline"
              linkProps={{
                href: `/coop/mes-beneficiaires/${beneficiaire.id}/modifier`,
              }}
            >
              Modifier
            </Button>
            <Button
              iconId="fr-icon-delete-bin-line"
              className="fr-ml-1v"
              iconPosition="right"
              size="small"
              priority="tertiary no outline"
              type="button"
              {...DeleteBeneficiaireModal.buttonProps}
            >
              Supprimer
            </Button>
          </div>
        </div>
        <div className="fr-border--bottom fr-pt-6v fr-px-6v fr-pb-8v">
          <h4 className="fr-text--xs fr-text--bold fr-text--uppercase fr-mb-0">
            Thématiques d’accompagnements
          </h4>
          <p className="fr-text--xs fr-text-mention--grey fr-mb-4v">
            Retrouvez les thématiques d’accompagnements vues avec ce
            bénéficiaire.
          </p>
          {thematiquesCounts.length > 0 ? (
            <div className="fr-flex fr-flex-wrap fr-flex-gap-3v">
              {thematiquesCounts.map(({ thematique, label, count }) => (
                <Tag key={thematique}>
                  {label}
                  {count > 1 ? (
                    <>
                      &nbsp;·&nbsp;
                      <span className="fr-text--bold">{count}</span>
                    </>
                  ) : null}
                </Tag>
              ))}
            </div>
          ) : (
            <p className="fr-text--sm">-</p>
          )}
        </div>
        <div className="fr-border--bottom fr-pt-6v fr-px-6v fr-pb-8v">
          <h4 className="fr-text--xs fr-text--bold fr-text--uppercase fr-mb-4v">
            Coordonnées
          </h4>
          <div className={styles.infosGrid}>
            <div>
              <InfoLabelValue
                label="Numéro de téléphone"
                value={pasDeTelephone ? 'Pas de téléphone' : telephone || '-'}
              />
            </div>
            <div>
              <InfoLabelValue label="E-mail" value={email || '-'} />
            </div>
          </div>
        </div>
        <div className="fr-border--bottom fr-pt-6v fr-px-6v fr-pb-8v">
          <h4 className="fr-text--xs fr-text--bold fr-text--uppercase fr-mb-4v">
            Informations complémentaires
          </h4>
          <div className={styles.infosGrid}>
            <div>
              <InfoLabelValue
                label="Commune de résidence"
                value={
                  commune && communeCodeInsee && communeCodePostal
                    ? `${communeCodePostal} ${commune}`
                    : '-'
                }
              />
            </div>
            <div>
              <InfoLabelValue
                label="Genre"
                value={genre ? genreLabels[genre] : '-'}
              />
            </div>
            <div>
              <InfoLabelValue
                label="Tranche d’âge"
                value={trancheAge ? trancheAgeLabels[trancheAge] : '-'}
              />
            </div>
            <div>
              <InfoLabelValue
                label="Statut social"
                value={statutSocial ? statutSocialLabels[statutSocial] : '-'}
              />
            </div>
          </div>
        </div>
        <div className="fr-pt-6v fr-px-6v fr-pb-8v">
          <h4 className="fr-text--xs fr-text--bold fr-text--uppercase fr-mb-4v">
            Notes supplémentaires
          </h4>
          {notes ? (
            <div
              dangerouslySetInnerHTML={{
                __html: notes,
              }}
            />
          ) : (
            <p className="fr-text--sm">-</p>
          )}
        </div>
      </div>
    </>
  )
}

export default ViewBeneficiaireInformationsPage
