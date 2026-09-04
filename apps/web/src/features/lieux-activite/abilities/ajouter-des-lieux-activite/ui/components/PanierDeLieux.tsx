import StructureCard from '@app/web/components/structure/StructureCard'
import Button from '@codegouvfr/react-dsfr/Button'
import type { LieuAuPanier } from '../panier'

/**
 * Les lieux retenus, du plus récemment ajouté au plus ancien : ce qu'on vient
 * de sélectionner est ce qu'on veut voir apparaître.
 *
 * Le retrait s'exprime par le lieu lui-même, non par son rang : l'ordre affiché
 * est l'inverse de l'ordre retenu, et faire voyager un index inversé jusqu'à
 * l'état est le meilleur moyen de retirer le mauvais.
 */
export const PanierDeLieux = ({
  lieux,
  onRetirer,
}: {
  lieux: readonly LieuAuPanier[]
  onRetirer: (lieu: LieuAuPanier) => void
}) => (
  <>
    {lieux.toReversed().map((lieu) => (
      <StructureCard
        key={lieu.id ?? lieu.structureCartographieNationaleId ?? lieu.nom}
        structure={lieu}
        className="fr-mt-4v"
        topRight={
          <Button
            type="button"
            priority="tertiary no outline"
            size="small"
            iconPosition="right"
            iconId="fr-icon-close-line"
            onClick={() => onRetirer(lieu)}
          >
            Retirer
          </Button>
        }
      />
    ))}
  </>
)
