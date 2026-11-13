'use client'

import { CaptureButton } from '@app/web/libs/statistiques/CaptureButton'
import Button from '@codegouvfr/react-dsfr/Button'
import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl'
import { Fragment, type ReactNode, useRef, useState } from 'react'

type AccompagnementCategory = 'thematiques' | 'demarches' | 'tags'
type StructuresCategory = 'lieux' | 'communes'

export const SectionActivites = ({
  wording = 'personnel',
  canManageTags = false,
  types,
  thematiques,
  demarches,
  tags,
  materiels,
  canaux,
  durees,
  lieux,
  communes,
}: {
  wording?: 'personnel' | 'generique'
  canManageTags?: boolean
  types: ReactNode
  thematiques: ReactNode
  demarches: ReactNode
  tags: ReactNode
  materiels: ReactNode
  canaux: ReactNode
  durees: ReactNode
  lieux?: ReactNode
  communes?: ReactNode
}) => {
  const captureTypesAccompagnementsRef = useRef<HTMLDivElement | null>(null)
  const captureThematiquesAccompagnementsRef = useRef<HTMLDivElement | null>(
    null,
  )
  const captureMaterielAccompagnementsRef = useRef<HTMLDivElement | null>(null)
  const captureCreneauxAccompagnementsRef = useRef<HTMLDivElement | null>(null)

  const [accompagnementCategory, setAccompagnementCategory] =
    useState<AccompagnementCategory>('thematiques')

  const [structuresCategory, setStructuresCategory] =
    useState<StructuresCategory>('lieux')

  const accompagnementCategories = [
    {
      category: 'thematiques',
      title: 'Thématiques des accompagnements de médiation numérique',
      description:
        'Thématiques sélectionnées lors de l’enregistrement d’un accompagnement. À noter : un accompagnement peut avoir plusieurs thématiques.',
      contenu: thematiques,
    },
    {
      category: 'demarches',
      title: 'Thématiques des accompagnements de démarches administratives',
      description:
        'Thématiques des démarches administratives sélectionnées lors de l’enregistrement d’un accompagnement. À noter : un accompagnement peut avoir plusieurs thématiques administratives.',
      contenu: demarches,
    },
    {
      category: 'tags',
      title: 'Tags spécifiques',
      description:
        'Tags spécifiques sélectionnés lors de l’enregistrement d’un accompagnement. À noter : un accompagnement peut avoir plusieurs tags.',
      contenu: tags,
      ...(canManageTags
        ? {
            actions: (
              <Button
                priority="tertiary no outline"
                size="small"
                iconId="fr-icon-settings-5-line"
                linkProps={{ href: '/coop/tags' }}
              >
                Gérer mes tags
              </Button>
            ),
          }
        : {}),
    },
  ]

  return (
    <>
      <h2 className="fr-h5 fr-text-mention--grey">
        <span className="ri-service-line fr-mr-1w" aria-hidden />
        Statistiques sur{' '}
        {wording === 'personnel'
          ? 'vos accompagnements'
          : 'les accompagnements'}
      </h2>
      <div
        ref={captureTypesAccompagnementsRef}
        className="fr-background-alt--blue-france fr-px-8v fr-py-6v fr-mb-3w fr-border-radius--16 fr-grid-row fr-flex-gap-12v fr-position-relative"
      >
        <span className="fr-no-print fr-position-absolute fr-top-0 fr-right-0 fr-p-4v">
          <CaptureButton
            captureRef={captureTypesAccompagnementsRef}
            captureName="types-accompagnements"
            title="Télécharger l’image des types d’accompagnements"
            iconId="fr-icon-download-line"
            size="small"
            priority="tertiary no outline"
          />
        </span>
        {types}
      </div>
      <div
        className="fr-border fr-p-4w fr-mb-3w fr-border-radius--16 fr-background-default--grey fr-border-radius--16"
        ref={captureThematiquesAccompagnementsRef}
      >
        <div className="fr-flex">
          <SegmentedControl
            className="fr-md-col fr-col-12 fr-ml-auto"
            hideLegend
            legend="Bascule entre les thématiques"
            segments={[
              {
                label: 'Médiation numérique',
                nativeInputProps: {
                  checked: accompagnementCategory === 'thematiques',
                  onChange: () => setAccompagnementCategory('thematiques'),
                },
              },
              {
                label: 'Démarches administratives',
                nativeInputProps: {
                  checked: accompagnementCategory === 'demarches',
                  onChange: () => setAccompagnementCategory('demarches'),
                },
              },
              {
                label: (
                  <>
                    <span className="ri-price-tag-3-line" aria-hidden />
                    &ensp;Tags spécifiques
                  </>
                ),
                nativeInputProps: {
                  checked: accompagnementCategory === 'tags',
                  onChange: () => setAccompagnementCategory('tags'),
                },
              },
            ]}
          />
          <span className="fr-no-print">
            <CaptureButton
              captureRef={captureThematiquesAccompagnementsRef}
              captureName="thematiques-accompagnements"
              title="Télécharger l’image des thematiques d’accompagnements"
              iconId="fr-icon-download-line"
              size="small"
              priority="tertiary no outline"
            />
          </span>
        </div>
        <hr className="fr-separator-8v" />
        {accompagnementCategories.map(
          ({ category, title, description, contenu, actions }) =>
            category === accompagnementCategory && (
              <Fragment key={category}>
                <div className="fr-flex fr-align-items-center fr-justify-content-space-between fr-mb-6v">
                  <div className="fr-mb-0 fr-flex fr-align-items-center">
                    <h3 className="fr-text--md fr-mb-0 fr-text--nowrap">
                      {title}
                    </h3>
                    <Button
                      className="fr-px-1v fr-ml-1v fr-no-print"
                      title={`Plus d’information à propos des ${title.toLowerCase()}`}
                      priority="tertiary no outline"
                      size="small"
                      type="button"
                      aria-describedby={`tooltip-accompagnement-${category}`}
                    >
                      <span
                        className="ri-information-line fr-text--lg"
                        aria-hidden
                      />
                    </Button>
                    <span
                      className="fr-tooltip fr-placement"
                      id={`tooltip-accompagnement-${category}`}
                      role="tooltip"
                      aria-hidden
                    >
                      {description}
                    </span>
                  </div>
                  <div className="fr-no-print">{actions && actions}</div>
                </div>
                {contenu}
              </Fragment>
            ),
        )}
      </div>
      <div
        className="fr-border fr-p-8v fr-pb-10v fr-mb-3w fr-border-radius--16 fr-background-default--grey fr-border-radius--16 fr-position-relative"
        ref={captureMaterielAccompagnementsRef}
      >
        <span className="fr-no-print fr-position-absolute fr-top-0 fr-right-0 fr-p-4v">
          <CaptureButton
            captureRef={captureMaterielAccompagnementsRef}
            captureName="meteriel-accompagnements"
            title="Télécharger l’image des matériels utilisés lors des accompagnements"
            iconId="fr-icon-download-line"
            size="small"
            priority="tertiary no outline"
          />
        </span>
        {materiels}
      </div>
      <div
        ref={captureCreneauxAccompagnementsRef}
        className="fr-border fr-p-4w fr-background-default--grey fr-border-radius--16 fr-position-relative"
      >
        <div className="fr-flex fr-flex-wrap fr-flex-gap-16v">
          {canaux}
          {durees}
        </div>
        {(!!lieux || !!communes) && (
          <>
            <hr className="fr-separator-1px fr-my-5w" />
            <div className="fr-flex fr-align-items-center fr-justify-content-space-between fr-mb-4v">
              <h3 className="fr-text--md fr-mb-0">
                Nombre d'accompagnements par{' '}
                {structuresCategory === 'lieux'
                  ? "lieux d'activités"
                  : 'communes'}
              </h3>
              <SegmentedControl
                hideLegend
                legend="Bascule entre lieux et communes"
                segments={[
                  {
                    label: (
                      <>
                        <span className="ri-home-office-line" aria-hidden />
                        &ensp;Par lieux d'activités
                      </>
                    ),
                    nativeInputProps: {
                      checked: structuresCategory === 'lieux',
                      onChange: () => setStructuresCategory('lieux'),
                    },
                  },
                  {
                    label: (
                      <>
                        <span className="ri-road-map-line" aria-hidden />
                        &ensp;Par communes
                      </>
                    ),
                    nativeInputProps: {
                      checked: structuresCategory === 'communes',
                      onChange: () => setStructuresCategory('communes'),
                    },
                  },
                ]}
              />
            </div>
            {structuresCategory === 'lieux' && lieux}
            {structuresCategory === 'communes' && communes}
          </>
        )}
        <span className="fr-no-print fr-position-absolute fr-top-0 fr-right-0 fr-p-4v">
          <CaptureButton
            captureRef={captureCreneauxAccompagnementsRef}
            captureName="creneaux-accompagnements"
            title="Télécharger l’image des crénaux d’accompagnements"
            iconId="fr-icon-download-line"
            size="small"
            priority="tertiary no outline"
          />
        </span>
      </div>
    </>
  )
}
