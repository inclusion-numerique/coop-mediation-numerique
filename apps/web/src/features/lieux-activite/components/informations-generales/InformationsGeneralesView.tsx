import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import { typologieStructureLabels } from '@app/web/features/structures/typologieStructure'
import Tag from '@codegouvfr/react-dsfr/Tag'
import type { Typologie } from '@prisma/client'

export const InformationsGeneralesView = ({
  nom,
  adresse,
  commune,
  codePostal,
  complementAdresse,
  siret,
  rna,
  typologies,
}: {
  nom: string
  adresse: string
  commune: string
  codePostal: string
  complementAdresse?: string | null
  siret?: string | null
  rna?: string | null
  typologies?: Typologie[] | null
}) => (
  <div className="fr-flex fr-direction-column fr-flex-gap-6v">
    <div>
      <span className="fr-text-mention--grey">Nom de la structure</span>
      <div className="fr-text--medium" data-testid="informations-generales-nom">
        {nom}
      </div>
    </div>
    <div>
      <span className="fr-text-mention--grey">Adresse</span>
      <div
        className="fr-text--medium"
        data-testid="informations-generales-adresse"
      >
        {adresse}, {codePostal} {commune}
      </div>
    </div>
    <div>
      <span className="fr-text-mention--grey">Complément d’adresse</span>
      <div
        className="fr-text--medium"
        data-testid="informations-generales-complement-adresse"
      >
        {(complementAdresse?.length ?? 0) > 0
          ? complementAdresse
          : 'Non renseigné'}
      </div>
    </div>
    <div>
      <span className="fr-text-mention--grey">
        Typologie{sPluriel(typologies?.length ?? 0)}
      </span>
      {(typologies?.length ?? 0) > 0 ? (
        <ul className="fr-tags-group fr-mt-3v">
          {typologies?.map((typologie) => (
            <li key={typologie}>
              <Tag>{typologieStructureLabels[typologie]}</Tag>
            </li>
          ))}
        </ul>
      ) : (
        <div className="fr-text--medium">Non renseigné</div>
      )}
    </div>
    <div>
      <span className="fr-text-mention--grey">SIRET structure (ou RNA)</span>
      <div
        className="fr-text--medium"
        data-testid="informations-generales-pivot"
      >
        {(siret?.length ?? 0) > 0 || (rna?.length ?? 0) > 0
          ? (siret ?? rna)
          : 'Non renseigné'}
      </div>
    </div>
  </div>
)
