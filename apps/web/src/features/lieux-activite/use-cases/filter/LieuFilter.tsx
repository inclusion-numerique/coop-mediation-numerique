'use client'

import { SelectOption } from '@app/ui/components/Form/utils/options'
import { Popover } from '@app/ui/components/Primitives/Popover'
import { FilterFooter } from '@app/web/libs/filters/FilterFooter'
import { FilterSelection } from '@app/web/libs/filters/FilterSelection'
import TriggerButton from '@app/web/libs/filters/TriggerButton'
import { matchingOption, update } from '@app/web/libs/filters/helpers'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { TypeLieuLabel } from '../../combo-box/TypeLieuComboBox'
import { SelectCommune } from './SelectCommune'
import { SelectDepartement } from './SelectDepartement'
import { SelectTypeLieu } from './SelectTypeLieu'

export const LieuFilter = ({
  lieuxParams,
  communesParams,
  departementsParams,
}: {
  lieuxParams: SelectOption[]
  communesParams: SelectOption[]
  departementsParams: SelectOption[]
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams.toString())

  const [isOpen, setIsOpen] = useState(false)
  const [typeLieu, setTypeLieu] = useState<TypeLieuLabel | null>()
  const [communes, setCommunes] = useState(communesParams)
  const [departements, setDepartements] = useState(departementsParams)
  const [lieuxActivite, setLieuxActivite] = useState(lieuxParams)

  const allFilters = [...departements, ...communes, ...lieuxActivite]
  const hasFilters = allFilters.length > 0

  const closePopover = (close: boolean = false) => {
    setTypeLieu(null)
    close && setIsOpen(false)
    router.replace(`?${params}`, { scroll: false })
  }

  const handleSubmit = (close: boolean = false) => {
    update(params)('lieux', lieuxActivite)
    update(params)('communes', communes)
    update(params)('departements', departements)

    closePopover(close)
  }

  const handleClearFilters = () => {
    setCommunes([])
    setDepartements([])
    setLieuxActivite([])

    update(params)('lieux', [])
    update(params)('communes', [])
    update(params)('departements', [])

    closePopover(true)
  }

  const handleRemoveFilter = (option: SelectOption) => {
    setCommunes(communes.filter(matchingOption(option)))
    setDepartements(departements.filter(matchingOption(option)))
    setLieuxActivite(lieuxActivite.filter(matchingOption(option)))
  }

  return (
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}
      onInteractOutside={() => handleSubmit()}
      onEscapeKeyDown={() => handleSubmit()}
      trigger={
        <TriggerButton isOpen={isOpen} isFilled={hasFilters}>
          Lieu{hasFilters && <>&nbsp;·&nbsp;{allFilters.length}</>}
        </TriggerButton>
      }
    >
      <form style={{ width: 384 }} action={() => handleSubmit(true)}>
        <SelectTypeLieu setTypeLieu={setTypeLieu} />
        {typeLieu === 'lieu' && <>Choisir un lieu d’activité</>}
        {typeLieu === 'commune' && (
          <SelectCommune
            communes={communes}
            handleSelectFilter={(option: SelectOption | null) => {
              if (!option) return handleClearFilters()
              setCommunes((prev) => [...prev, option])
            }}
          />
        )}
        {typeLieu === 'departement' && (
          <SelectDepartement
            departements={departements}
            handleSelectFilter={(option: SelectOption | null) => {
              if (!option) return handleClearFilters()
              setDepartements((prev) => [...prev, option])
            }}
          />
        )}
        {hasFilters && (
          <>
            <FilterSelection
              options={allFilters}
              onRemoveFilter={handleRemoveFilter}
              label={{
                singular: 'lieu sélectionné',
                plural: 'lieux sélectionnés',
              }}
            />
            <FilterFooter onClearFilters={handleClearFilters} />
          </>
        )}
      </form>
    </Popover>
  )
}
