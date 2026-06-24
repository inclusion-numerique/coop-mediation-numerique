export const BeneficiairesNoResults = ({
  recherche,
}: {
  recherche: string
}) => (
  <div className="fr-mt-2v fr-p-8v fr-text--center">
    <p className="fr-text--bold fr-text--lg fr-mb-1v">
      Aucun bénéficiaire ne correspond à votre recherche
    </p>
    <p className="fr-text-mention--grey fr-mb-0">
      Aucun résultat pour «&nbsp;{recherche}&nbsp;».
    </p>
  </div>
)
