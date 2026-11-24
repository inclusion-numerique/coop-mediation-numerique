'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import Tag from '@codegouvfr/react-dsfr/Tag'
import { useRouter, useSearchParams } from 'next/navigation'
import { sansLaValeur } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/ui/search-params/lister-les-utilisateurs.search-params'
import { type LibelleDeFiltre } from '@/features/utilisateurs/ui/presenters/libelles-des-filtres.presenter'
import { requeteAvec } from '@/libraries/parametres-d-url'

export const EtiquettesDesFiltres = ({
  libelles,
}: {
  libelles: readonly LibelleDeFiltre[]
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const retirer = ({ type, cle }: LibelleDeFiltre) => {
    router.replace(
      requeteAvec(searchParams, sansLaValeur(searchParams, type, cle)),
      { scroll: false },
    )
  }

  if (libelles.length === 0) return null

  return (
    <>
      <div className="fr-flex fr-justify-content-space-between fr-mb-2v">
        <ul className="fr-tags-group">
          {libelles.map((libelle) => (
            <li
              className="fr-line-height-1"
              key={`${libelle.type}-${libelle.cle}`}
            >
              <Tag
                className="fr-pr-3v"
                small
                nativeButtonProps={{
                  type: 'button',
                  onClick: () => retirer(libelle),
                }}
              >
                <span className="fr-icon-close-line fr-icon--xs" />
                &nbsp;{libelle.libelle}
              </Tag>
            </li>
          ))}
        </ul>
        <div>
          <Button
            priority="tertiary no outline"
            onClick={() => router.replace('?', { scroll: false })}
          >
            <span className="ri-close-circle-line" aria-hidden />
            &nbsp;Effacer&nbsp;les&nbsp;filtres
          </Button>
        </div>
      </div>
      <hr className="fr-mt-4v fr-pb-3v" />
    </>
  )
}
