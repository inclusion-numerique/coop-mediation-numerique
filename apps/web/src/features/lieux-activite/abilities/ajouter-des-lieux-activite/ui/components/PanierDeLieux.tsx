import StructureCard from '@app/web/components/structure/StructureCard'
import Button from '@codegouvfr/react-dsfr/Button'
import type { LieuAuPanier } from '../panier'

/**
 * Les lieux retenus, du plus récemment ajouté au plus ancien : ce qu'on vient
 * de sélectionner est ce qu'on veut voir apparaître.
 *
 * Le rang rendu à l'appelant est celui de la LISTE, pas celui de l'affichage :
 * l'ordre montré en est l'inverse, et laisser voyager un index inversé jusqu'au
 * champ de formulaire est le meilleur moyen de retirer le mauvais lieu.
 */
export const PanierDeLieux = ({
  lieux,
  onRetirer,
}: {
  lieux: readonly LieuAuPanier[]
  onRetirer: (index: number) => void
}) => (
  <>
    {lieux.toReversed().map((lieu, rang) => (
      <StructureCard
        key={lieu.id ?? lieu.structureCartographieNationaleId ?? lieu.nom}
        structure={lieu}
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
