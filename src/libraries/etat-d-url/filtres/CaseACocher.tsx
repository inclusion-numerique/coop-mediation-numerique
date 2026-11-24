'use client'

import Checkbox from '@codegouvfr/react-dsfr/Checkbox'
import type { ParserMap } from 'nuqs'
import type { FiltreQuelconque } from '../definition/filtre'
import { useFiltre } from './use-filtre'

export const CaseACocher = ({
  filtre,
  valeur,
  libelle,
}: {
  filtre: FiltreQuelconque & { readonly cle: string }
  valeur: string
  libelle: string
}) => {
  const [lues, ecrire] = useFiltre<ParserMap>(filtre.parametres)

  return (
    <Checkbox
      small
      className="fr-mb-0 fr-ml-2v fr-align-self-center"
      options={[
        {
          label: libelle,
          nativeInputProps: {
            checked: lues[filtre.cle] === valeur,
            onChange: (evenement) =>
              ecrire({
                [filtre.cle]: evenement.target.checked ? valeur : null,
              }),
          },
        },
      ]}
    />
  )
}
