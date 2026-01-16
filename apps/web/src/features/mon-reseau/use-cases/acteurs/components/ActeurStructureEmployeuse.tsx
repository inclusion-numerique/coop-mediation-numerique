import Card from '@app/web/components/Card'
import { ReferentStructure } from '@app/web/components/structure/ReferentStructure'
import { Typologies } from '@app/web/components/structure/Typologies'
import type { ActeurEmploi } from '@app/web/features/mon-reseau/use-cases/acteurs/db/getActeurEmploiForDate'
import Badge from '@codegouvfr/react-dsfr/Badge'
import Link from 'next/link'
import { ReactNode } from 'react'

export type ActeurStructureEmployeuseProps = {
  emploi: ActeurEmploi
  showIsLieuActiviteNotice: boolean
  showReferentStructure: boolean
  showReferentStructureConseillerNumeriqueSupportNotice: boolean
  canUpdateStructure?: boolean
  title?: ReactNode
}

const ActeurStructureEmployeuse = ({
  emploi: {
    id: emploiId,
    structure: {
      id: _structureId,
      nom,
      adresse,
      complementAdresse,
      commune,
      codePostal,
      typologies,
      siret,
      rna,
      nomReferent,
      courrielReferent,
      telephoneReferent,
    },
  },
  showIsLieuActiviteNotice,
  showReferentStructure,
  showReferentStructureConseillerNumeriqueSupportNotice,
  canUpdateStructure,
  title,
}: ActeurStructureEmployeuseProps) => {
  const addresseString = complementAdresse
    ? `${adresse} (${complementAdresse})`
    : adresse

  return (
    <Card noBorder className="fr-border fr-border-radius--8" titleAs="div">
      {title}
      <span className="fr-text--lg fr-text--bold fr-mb-1v">{nom}</span>
      <div className="fr-text--sm fr-mb-1v fr-text-mention--grey fr-flex fr-direction-column fr-flex-gap-1v">
        <div>
          <span className="ri-map-pin-2-line fr-mr-1v" /> {addresseString},{' '}
          {codePostal} {commune}
        </div>
        <Typologies
          id={`typologies-structure-employeuse-${emploiId}`}
          typologies={typologies}
        />
        {(siret || rna) && (
          <>
            {siret && (
              <span>
                <span className="fr-text--medium">SIRET</span> : {siret}
              </span>
            )}
            {rna && (
              <span>
                <span className="fr-text--medium">RNA</span> : {rna}
              </span>
            )}
          </>
        )}
      </div>
      {showIsLieuActiviteNotice && (
        <Badge className="fr-mt-6v fr-text--uppercase" noIcon severity="info">
          <span className="ri-home-office-line fr-mr-1v" aria-hidden />
          Référencé dans vos Lieux d’activité
        </Badge>
      )}
      {showReferentStructure && nomReferent != null && (
        <>
          <ReferentStructure
            nomReferent={nomReferent}
            courrielReferent={courrielReferent}
            telephoneReferent={telephoneReferent}
          />
          {showReferentStructureConseillerNumeriqueSupportNotice && (
            <em className="fr-text--xs fr-text-mention--grey fr-mb-0 fr-mt-6v">
              Si vous constatez une erreur sur les informations concernant cette
              structure, veuillez contacter le support du dispositif conseiller
              numérique&nbsp;:&nbsp;
              <Link href="mailto:conseiller-numerique@anct.gouv.fr">
                conseiller-numerique@anct.gouv.fr
              </Link>
            </em>
          )}
        </>
      )}
      {/* Structure update now happens via Dataspace API sync */}
    </Card>
  )
}

export default ActeurStructureEmployeuse
