import Button from '@codegouvfr/react-dsfr/Button'

const MesBeneficiairesListeEmptyPage = () => (
  <>
    <hr className="fr-separator-6v" />
    <div className="fr-border-radius--8 fr-p-12v fr-background-alt--blue-france fr-align-items-center">
      <h2 className="fr-h6 fr-mb-2v fr-text--center">
        Vous n’avez pas enregistré de bénéficiaire
      </h2>
      <p className="fr-text--center fr-mb-8v">
        Vous pouvez créer un·e bénéficiaire afin de réaliser un suivi de ses
        accompagnements. Vous retrouverez la liste de vos bénéficiaires sur
        cette page.
        <br />
        <br />
        Vous pouvez également importer une liste de bénéficiaires au format
        Excel.
      </p>
      <div className="fr-flex fr-direction-column fr-width-full fr-flex-gap-2v fr-text--center">
        <div>
          <Button
            iconId="fr-icon-download-line"
            priority="secondary"
            linkProps={{
              href: '/coop/mes-beneficiaires/importer',
            }}
          >
            Importer des bénéficiaires
          </Button>
        </div>
        OU
        <div>
          <Button
            iconId="fr-icon-user-add-line"
            linkProps={{
              href: '/coop/mes-beneficiaires/nouveau',
            }}
          >
            Créer un bénéficiaire
          </Button>
        </div>
      </div>
    </div>
  </>
)

export default MesBeneficiairesListeEmptyPage
