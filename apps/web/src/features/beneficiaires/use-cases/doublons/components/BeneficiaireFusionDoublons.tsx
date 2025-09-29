'use client'

import { BeneficiairesDoublonsPageData } from '../getBeneficiairesDoublonsPageData'
import { useMemo, useState } from 'react'
import Button from '@codegouvfr/react-dsfr/Button'
import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import { numberToString } from '@app/web/utils/formatNumber'
import Link from 'next/link'
import classNames from 'classnames'

export type FusionItemToKeep = 'a' | 'b'

type FusionItemState = {
  selected: boolean
  keep: FusionItemToKeep
}

type FusionItemsState = Map<string, FusionItemState>

const BeneficiaireFusionDoublons = ({
  data: { count: totalCount, duplicates },
}: {
  data: BeneficiairesDoublonsPageData
}) => {
  const [fusionItems, setFusionItems] = useState<FusionItemsState>(
    new Map(
      duplicates.map((duplicate) => [
        duplicate.id,
        { selected: false, keep: 'a' },
      ]),
    ),
  )

  const selectedItems = useMemo(
    () => [...fusionItems.values()].filter(({ selected }) => selected),
    [fusionItems],
  )

  const selectedCount = selectedItems.length

  const allItemsAreSelected = selectedCount === totalCount

  const setAllItemsSelected = (selected: boolean) => {
    setFusionItems(
      new Map(
        [...fusionItems.entries()].map(([id, { keep }]) => [
          id,
          { selected, keep },
        ]),
      ),
    )
  }

  const onSelectAll = () => {
    setAllItemsSelected(!allItemsAreSelected)
  }

  const onSelectItem = (id: string) => {
    const newFusionItems = new Map(fusionItems)
    const existingItem = newFusionItems.get(id)

    if (!existingItem) return

    existingItem.selected = !existingItem.selected
    setFusionItems(newFusionItems)
  }

  const onKeepItem = (id: string, keep: FusionItemToKeep) => {
    const newFusionItems = new Map(fusionItems)
    const existingItem = newFusionItems.get(id)

    if (!existingItem || existingItem.keep === keep) return

    existingItem.keep = keep
    setFusionItems(newFusionItems)
  }

  const executeFusion = () => {
    console.log('executeFusion')
  }

  return (
    <>
      <div className="fr-p-6v fr-my-6v fr-border fr-border-radius--8 fr-flex fr-align-items-center fr-justify-content-space-between">
        <div className="fr-checkbox-group fr-checkbox-group--sm fr-mb-0">
          <input
            type="checkbox"
            id="select-all-duplicates"
            checked={allItemsAreSelected}
            onChange={onSelectAll}
          />
          <label
            className="fr-text--sm fr-mb-0"
            htmlFor="select-all-duplicates"
          >
            Tout sélectionner ({numberToString(totalCount)})
          </label>
        </div>

        {selectedCount === 0 ? (
          <Button type="button" disabled>
            Fusionner
          </Button>
        ) : (
          <Button type="button" onClick={executeFusion}>
            Fusionner {numberToString(selectedCount)} doublon
            {sPluriel(selectedCount)}
          </Button>
        )}
      </div>
      {duplicates.map((duplicate) => {
        const fusionItem = fusionItems.get(duplicate.id)

        if (!fusionItem) return null

        const { selected, keep } = fusionItem
        const checkboxId = `select-duplicate-${duplicate.id}`
        const keepAId = `keep-a-${duplicate.id}`
        const keepBId = `keep-b-${duplicate.id}`

        return (
          <article
            key={duplicate.id}
            className={classNames(
              'fr-border fr-border-radius--8 fr-mt-4v fr-flex fr-align-items-stretch',
              selected && 'fr-border--blue-france',
            )}
          >
            <div className="fr-px-6v fr-flex fr-align-items-center">
              <div className="fr-checkbox-group fr-checkbox-group--sm fr-mb-0">
                <input
                  type="checkbox"
                  id={checkboxId}
                  checked={selected}
                  onChange={() => onSelectItem(duplicate.id)}
                />
                <label className="" htmlFor={checkboxId}>
                  Sélectionner
                </label>
              </div>
            </div>
            <BeneficiaireRadioColumn
              columnId={keepAId}
              duplicateId={duplicate.id}
              isActive={keep === 'a'}
              onSelect={onKeepItem}
              side="a"
              {...duplicate.a}
            />
            <BeneficiaireRadioColumn
              columnId={keepBId}
              duplicateId={duplicate.id}
              isActive={keep === 'b'}
              onSelect={onKeepItem}
              side="b"
              {...duplicate.b}
            />
          </article>
        )
      })}
    </>
  )
}

export default BeneficiaireFusionDoublons

type BeneficiaireColumnProps = {
  columnId: string
  duplicateId: string
  isActive: boolean
  onSelect: (id: string, keep: FusionItemToKeep) => void
  side: FusionItemToKeep
  id: string
  nom: string
  prenom: string
  telephone: string
  email: string
}

const BeneficiaireRadioColumn = ({
  columnId,
  duplicateId,
  isActive,
  onSelect,
  side,
  id,
  nom,
  prenom,
  telephone,
  email,
}: BeneficiaireColumnProps) => (
  <div className="fr-border-left fr-px-4v fr-py-3v fr-flex fr-align-items-center fr-flex-gap-4v">
    <div className="fr-radio-group fr-radio-group--sm fr-mb-0 fr-flex fr-align-items-center fr-flex-gap-4v">
      <input
        type="radio"
        id={columnId}
        name={`keep-${duplicateId}`}
        value={side}
        checked={isActive}
        onChange={() => onSelect(duplicateId, side)}
      />
      <label htmlFor={columnId}>
        <span className="fr-pl-2v">
          <span
            className={classNames(
              'fr-text--bold fr-mb-0 fr-text-title--grey-700',
              !isActive && 'fr-text-mention--grey',
            )}
          >
            {formatDisplayName(nom, prenom)}
          </span>
          <br />
          <span
            className={classNames(
              'fr-text--sm fr-mb-0',
              !isActive && 'fr-text-mention--grey',
            )}
          >
            {formatDisplayPhone(telephone)}
          </span>
          <br />
          <span
            className={classNames(
              'fr-text--sm fr-mb-0',
              !isActive && 'fr-text-mention--grey',
            )}
          >
            {email || 'Adresse e-mail non renseignée'}
          </span>
        </span>
      </label>
    </div>
    <Button
      priority="tertiary no outline"
      size="small"
      linkProps={{ href: `/coop/mes-beneficiaires/${id}`, target: '_blank' }}
    >
      Voir
    </Button>
  </div>
)

const formatDisplayName = (
  nom?: string | null,
  prenom?: string | null,
): string => {
  if (!nom && !prenom) return 'Nom non renseigné'

  if (!nom) return prenom ?? 'Nom non renseigné'

  if (!prenom) return nom

  return `${prenom} ${nom}`
}

const formatDisplayPhone = (telephone?: string | null): string =>
  telephone && telephone.trim().length > 0
    ? telephone
    : 'Téléphone non renseigné'
