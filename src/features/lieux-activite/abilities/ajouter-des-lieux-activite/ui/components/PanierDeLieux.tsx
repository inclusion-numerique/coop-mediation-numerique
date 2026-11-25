import Button from '@codegouvfr/react-dsfr/Button'
import { SaisieDuLieuCard } from '@/features/lieux-activite/ui/components/SaisieDuLieuCard'
import type { LieuAuPanier } from '../forms/panier.form-data'

export const PanierDeLieux = ({
  lieux,
  onRetirer,
}: {
  lieux: readonly LieuAuPanier[]
  onRetirer: (index: number) => void
}) => (
  <>
    {lieux.toReversed().map((lieu, rang) => (
      <SaisieDuLieuCard
        key={lieu.id ?? lieu.structureCartographieNationaleId ?? lieu.nom}
        lieu={lieu}
        className="fr-mb-4v"
        topRight={
          <Button
            type="button"
            priority="tertiary no outline"
            size="small"
            iconPosition="right"
            iconId="fr-icon-close-line"
            onClick={() => onRetirer(lieux.length - 1 - rang)}
          >
            Retirer
          </Button>
        }
      />
    ))}
  </>
)
