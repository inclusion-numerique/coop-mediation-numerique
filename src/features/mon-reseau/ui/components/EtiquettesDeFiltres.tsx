'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import Tag from '@codegouvfr/react-dsfr/Tag'
import { useRouter, useSearchParams } from 'next/navigation'
import { sansLEtiquette } from '@/features/mon-reseau/ui/search-params/filtres-du-reseau.search-params'
import { requeteAvec } from '@/libraries/parametres-d-url'
import { type EtiquetteDeFiltre } from '../search-params/filtres-du-reseau.search-params'

export const EtiquettesDeFiltres = ({
  etiquettes,
}: {
  etiquettes: readonly EtiquetteDeFiltre[]
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const retirer = (etiquette: EtiquetteDeFiltre) =>
    router.replace(
      requeteAvec(searchParams, sansLEtiquette(searchParams, etiquette)),
      { scroll: false },
    )

  const effacer = () => router.replace('?', { scroll: false })

  return etiquettes.length > 0 ? (
    <>
      <hr className="fr-separator-1px" />
      <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-my-4v fr-flex-gap-4v">
        <ul className="fr-flex fr-flex-wrap fr-flex-gap-2v fr-list-group">
          {etiquettes.map((etiquette) => (
            <li
              className="fr-line-height-1 fr-p-0"
              key={`${etiquette.parametre}-${etiquette.valeur}`}
            >
              <Tag
                className="fr-pr-3v"
                small
                nativeButtonProps={{
                  type: 'button',
                  onClick: () => retirer(etiquette),
                }}
              >
                <span className="fr-icon-close-line fr-icon--xs" />
                &nbsp;{etiquette.libelle}
              </Tag>
            </li>
          ))}
        </ul>
        <div>
          <Button priority="tertiary no outline" onClick={effacer}>
            <span className="ri-close-circle-line" aria-hidden />
            &nbsp;Effacer&nbsp;les&nbsp;filtres
          </Button>
        </div>
      </div>
    </>
  ) : null
}
