import Card from '@app/web/components/Card'
import { ReferentStructure } from '@app/web/components/structure/ReferentStructure'
import type { EmploiEmployeuseAffichage } from '@app/web/features/employeuse'
import Badge from '@codegouvfr/react-dsfr/Badge'
import Link from 'next/link'
import { ReactNode } from 'react'

/** Vue de l'emploi affiché : l'employeuse, telle que la feature employeuse la met à plat. */
export type ActeurEmploi = { structure: EmploiEmployeuseAffichage }

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
    structure: {
      id: _structureId,
      nom,
      adresseComplete,
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
}: ActeurStructureEmployeuseProps) => (
  <Card noBorder className="fr-border fr-border-radius--8" titleAs="div">
    {title}
    <span className="fr-text--lg fr-text--bold fr-mb-1v">{nom}</span>
    <div className="fr-text--sm fr-mb-1v fr-text-mention--grey fr-flex fr-direction-column fr-flex-gap-1v">
      {adresseComplete && (
        <div>
          <span className="ri-map-pin-2-line fr-mr-1v" /> {adresseComplete}
        </div>
      )}
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

export default ActeurStructureEmployeuse
