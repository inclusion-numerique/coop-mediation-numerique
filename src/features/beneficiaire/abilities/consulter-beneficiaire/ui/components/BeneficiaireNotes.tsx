const BeneficiaireNotes = ({ notes }: { notes: string | null }) => (
  <div className="fr-pt-6v fr-px-6v fr-pb-8v">
    <h4 className="fr-text--xs fr-text--bold fr-text--uppercase fr-mb-4v">
      Notes supplémentaires
    </h4>
    {notes ? (
      <div dangerouslySetInnerHTML={{ __html: notes }} />
    ) : (
      <p className="fr-text--sm">-</p>
    )}
  </div>
)

export default BeneficiaireNotes
