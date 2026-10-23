'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import Tag from '@codegouvfr/react-dsfr/Tag'
import { useRouter, useSearchParams } from 'next/navigation'
import type { EtiquetteDeFiltre } from '../libelles-des-filtres.presenter'

const sansLaCommune = (communes: string | null, cle: string): string =>
  (communes ?? '')
    .split(',')
    .filter((commune) => commune !== '' && commune !== cle)
    .join(',')

export const EtiquettesDeFiltres = ({
  etiquettes,
}: {
  etiquettes: readonly EtiquetteDeFiltre[]
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const retirer = (cle: string) => {
    const restantes = sansLaCommune(searchParams.get('communes'), cle)
    const params = new URLSearchParams(
      [...searchParams.entries()].filter(([nom]) => nom !== 'communes'),
    )
    const avecLesCommunes =
      restantes === ''
        ? params
        : new URLSearchParams([...params.entries(), ['communes', restantes]])
    router.replace(`?${avecLesCommunes}`, { scroll: false })
  }

  const effacer = () => router.replace('?', { scroll: false })

  return etiquettes.length > 0 ? (
    <>
      <hr className="fr-separator-1px" />
      <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-my-4v fr-flex-gap-4v">
        <ul className="fr-flex fr-flex-wrap fr-flex-gap-2v fr-list-group">
          {etiquettes.map(({ cle, libelle }) => (
            <li className="fr-line-height-1 fr-p-0" key={cle}>
              <Tag
                className="fr-pr-3v"
                small
                nativeButtonProps={{
                  type: 'button',
                  onClick: () => retirer(cle),
                }}
              >
                <span className="fr-icon-close-line fr-icon--xs" />
                &nbsp;{libelle}
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
