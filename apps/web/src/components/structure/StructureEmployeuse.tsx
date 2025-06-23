import Card from '@app/web/components/Card'
import Badge from '@codegouvfr/react-dsfr/Badge'
import type { Typologie } from '@prisma/client'
import React, { ReactNode } from 'react'
import { Typologies } from './Typologies'

export const StructureEmployeuse = ({
  id,
  nom,
  adresse,
  complementAdresse,
  commune,
  codePostal,
  typologies = [],
  siret,
  rna,
  isLieuActivite,
  children,
}: {
  id: string
  nom: string
  adresse: string
  complementAdresse?: string | null
  commune: string
  codePostal: string
  typologies?: Typologie[]
  siret?: string | null
  rna?: string | null
  isLieuActivite: boolean
  children?: ReactNode
}) => (
  <Card noBorder className="fr-border fr-border-radius--8" titleAs="div">
    <span className="fr-text--lg fr-text--bold fr-mb-0">{nom}</span>
    <div className="fr-text--sm fr-mb-0 fr-text-mention--grey fr-flex fr-direction-column fr-flex-gap-1v">
      <div>
        <span className="ri-map-pin-2-line fr-mr-1v" />{' '}
        {[
          adresse,
          ...(complementAdresse ? [`(${complementAdresse})`] : []),
        ].join(' ')}
        , {codePostal} {commune}
      </div>
      <Typologies
        id={`typologies-structure-employeuse-${id}`}
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
    {isLieuActivite && (
      <Badge className="fr-mt-6v fr-text--uppercase" noIcon severity="info">
        <span className="ri-home-office-line fr-mr-1v" aria-hidden />
        Référencé dans vos Lieux d’activité
      </Badge>
    )}
    {children}
  </Card>
)
