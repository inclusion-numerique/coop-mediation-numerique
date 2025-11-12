'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { trpc } from '@app/web/trpc'
import { numberToString } from '@app/web/utils/formatNumber'
import Button from '@codegouvfr/react-dsfr/Button'
import * as Sentry from '@sentry/nextjs'
import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import type {
  BeneficiaireDoublon,
  BeneficiairesDoublonsPageData,
} from '../getBeneficiairesDoublonsPageData'
import styles from './BeneficiaireFusionDoublons.module.css'

export type FusionItemToKeep = 'a' | 'b'

type FusionItemState = {
  selected: boolean
  keep: FusionItemToKeep
}

type FusionItemsState = Map<string, FusionItemState>

const fusionDataFromFusionItems = ({
  duplicates,
  fusionItems,
}: {
  duplicates: BeneficiaireDoublon[]
  fusionItems: FusionItemsState
}): { sourceId: string; targetId: string }[] =>
  [...fusionItems.entries()]
    .filter(([_, { selected }]) => selected)
    .map(([id, { keep }]) => ({
      id,
      keep,
      duplicate: duplicates.find((duplicate) => duplicate.id === id),
    }))
    // only here for typesafety, should never happen
    .filter(
      (
        element,
      ): element is {
        id: string
        keep: FusionItemToKeep
        duplicate: BeneficiaireDoublon
      } => element.duplicate !== undefined,
    )
    .map(({ duplicate, keep }) => {
      if (keep === 'a') {
        return {
          targetId: duplicate.a.id,
          sourceId: duplicate.b.id,
        }
      }

      return {
        targetId: duplicate.b.id,
        sourceId: duplicate.a.id,
      }
    })

const BeneficiaireFusionDoublons = ({
  data: { count: totalCount, duplicates },
}: {
  data: BeneficiairesDoublonsPageData
}) => {
  const mutation = trpc.beneficiaires.fusionner.useMutation()
  const router = useRouter()

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

  const executeFusion = async () => {
    const fusionData = fusionDataFromFusionItems({
      duplicates,
      fusionItems,
    })

    try {
      await mutation.mutateAsync({
        fusions: fusionData,
      })

      createToast({
        priority: 'success',
        message: `${fusionData.length} doublon${sPluriel(fusionData.length)} fusionné${sPluriel(fusionData.length)}`,
      })

      router.push(`/coop/mes-beneficiaires`)
    } catch (error) {
      createToast({
        priority: 'error',
        message: 'Une erreur est survenue lors de la fusion des doublons',
      })
      Sentry.captureException(error)
    }
  }

  const isLoading = mutation.isPending || mutation.isSuccess

  return (
    <>
      <div className="fr-p-6v fr-my-6v fr-border fr-border-radius--8 fr-flex fr-align-items-center fr-justify-content-space-between">
        <div className="fr-checkbox-group fr-checkbox-group--sm fr-mb-0 fr-py-2v">
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

        {selectedCount !== 0 && (
          <Button
            type="button"
            onClick={executeFusion}
            {...buttonLoadingClassname(isLoading)}
          >
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
            <div
              className={classNames(
                'fr-pr-6v fr-pl-8v fr-flex fr-align-items-center fr-justify-content-center',
                styles.checkboxContainer,
              )}
            >
              <div className="fr-checkbox-group fr-checkbox-group--sm fr-mb-0">
                <input
                  type="checkbox"
                  id={checkboxId}
                  checked={selected}
                  onChange={() => onSelectItem(duplicate.id)}
                  aria-label="Sélectionner"
                />
                <label
                  className={classNames(styles.labelNoText)}
                  htmlFor={checkboxId}
                >
                  Sélectionner
                </label>
              </div>
            </div>
            <BeneficiaireRadioColumn
              disabled={!selected}
              columnId={keepAId}
              duplicateId={duplicate.id}
              isActive={keep === 'a'}
              onSelect={onKeepItem}
              side="a"
              {...duplicate.a}
            />
            <BeneficiaireRadioColumn
              disabled={!selected}
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

export default withTrpc(BeneficiaireFusionDoublons)

type BeneficiaireColumnProps = {
  disabled?: boolean
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
  className?: string
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
  className,
  disabled,
}: BeneficiaireColumnProps) => (
  <div
    className={classNames(
      'fr-border-left fr-px-4v fr-py-3v fr-flex fr-align-items-center fr-justify-content-space-between fr-flex-gap-4v fr-flex-grow-1 fr-flex-basis-0 fr-min-width-0',
      className,
    )}
  >
    <div className="fr-radio-group fr-radio-group--vertical-center fr-justify-content-center fr-radio-group--sm fr-mb-0 fr-flex fr-align-items-center fr-flex-grow-1 fr-min-width-0">
      <input
        type="radio"
        id={columnId}
        name={`keep-${duplicateId}`}
        value={side}
        checked={isActive}
        onChange={() => onSelect(duplicateId, side)}
        disabled={disabled}
      />
      <label
        htmlFor={columnId}
        className="fr-min-width-0"
        style={{ width: '100%' }}
      >
        <span className="fr-display-block fr-pl-2v">
          <span
            className={classNames(
              'fr-display-block fr-text--bold fr-mb-0 fr-text--break-all',
              isActive ? 'fr-text-title--grey-700' : 'fr-text-disabled-grey',
            )}
          >
            {formatDisplayName(nom, prenom)}
          </span>
          <span
            className={classNames(
              'fr-display-block fr-text--sm fr-mb-0 fr-text--break-all',
              !isActive && 'fr-text-disabled-grey',
            )}
          >
            {formatDisplayPhone(telephone)}
          </span>
          <span
            className={classNames(
              'fr-display-block fr-text--sm fr-mb-0 fr-text--break-all',
              !isActive && 'fr-text-disabled-grey',
            )}
          >
            {email || '/'}
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
  telephone && telephone.trim().length > 0 ? telephone : '/'
