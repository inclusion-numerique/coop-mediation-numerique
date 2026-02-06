'use client'

import CustomSelectFormField from '@app/ui/components/Form/CustomSelectFormField'
import InputFormField from '@app/ui/components/Form/InputFormField'
import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import type { SessionUser } from '@app/web/auth/sessionUser'
import AdresseBanFormField from '@app/web/components/form/AdresseBanFormField'
import StructureCard from '@app/web/components/structure/StructureCard'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import SiretInputInfo from '@app/web/features/structures/siret/SiretInputInfo'
import {
  type RenseignerStructureEmployeuseData,
  RenseignerStructureEmployeuseValidation,
} from '@app/web/features/utilisateurs/use-cases/registration/RenseignerStructureEmployeuse'
import { trpc, vanillaTrpc } from '@app/web/trpc'
import { applyZodValidationMutationErrorsToForm } from '@app/web/utils/applyZodValidationMutationErrorsToForm'
import Button from '@codegouvfr/react-dsfr/Button'
import { zodResolver } from '@hookform/resolvers/zod'
import debounce from 'debounce-promise'
import { useRouter } from 'next/navigation'
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { StructureSearchResult } from './searchStructureEmployeuseCombined'

const RenseignerStructureEmployeuseForm = ({
  user,
  nextStepPath,
}: {
  user: Pick<SessionUser, 'id'>
  nextStepPath: string
}) => {
  const [mode, setMode] = useState<'search' | 'manual'>('search')
  const [selectedStructure, setSelectedStructure] =
    useState<StructureSearchResult | null>(null)

  const form = useForm<RenseignerStructureEmployeuseData>({
    resolver: zodResolver(RenseignerStructureEmployeuseValidation),
    defaultValues: {
      userId: user.id,
      structureEmployeuse: {
        nom: '',
        siret: '',
      },
    },
  })

  const {
    control,
    setError,
    handleSubmit,
    setValue,
    formState: { isSubmitting, isSubmitSuccessful, errors },
  } = form

  const mutation = trpc.inscription.renseignerStructureEmployeuse.useMutation()

  const router = useRouter()

  const structuresMapRef = useRef(new Map<string, StructureSearchResult>())

  const onSubmit = async (data: RenseignerStructureEmployeuseData) => {
    try {
      await mutation.mutateAsync(data)
      router.push(nextStepPath)
      router.refresh()
    } catch (mutationError) {
      if (applyZodValidationMutationErrorsToForm(mutationError, setError)) {
        return
      }
      createToast({
        priority: 'error',
        message:
          "Une erreur est survenue lors de l'enregistrement, veuillez réessayer ultérieurement.",
      })
    }
  }

  const loadOptions = debounce(async (search: string) => {
    if (search.length < 3) {
      return [
        {
          label: 'La recherche doit contenir au moins 3 caractères',
          value: '',
        },
      ]
    }

    try {
      const result = await vanillaTrpc.structures.searchCombined.query({
        query: search,
      })

      const { structures, totalCount, moreResults } = result

      for (const structure of structures) {
        const key = structure.siret || `${structure.nom}-${structure.codeInsee}`
        structuresMapRef.current.set(key, structure)
      }

      const hasMoreMessage =
        moreResults > 0
          ? `Veuillez préciser votre recherche - ${moreResults} structure${sPluriel(moreResults)} non affichée${sPluriel(moreResults)}`
          : null

      return [
        {
          label: `${totalCount} résultat${sPluriel(totalCount)}`,
          value: '',
        },
        ...structures.map((structure: StructureSearchResult) => ({
          label: (
            <>
              <div className="fr-width-full fr-text--sm fr-mb-0">
                {structure.nom}
              </div>
              <div className="fr-width-full fr-text--xs fr-text-mention--grey fr-mb-0">
                {(structure.typologies?.length ?? 0) > 0
                  ? `${structure.typologies?.join(', ')} · `
                  : null}
                {structure.adresse}, {structure.codePostal} {structure.commune}
              </div>
            </>
          ),
          value: structure.siret || `${structure.nom}-${structure.codeInsee}`,
        })),
        ...(hasMoreMessage ? [{ label: hasMoreMessage, value: '' }] : []),
      ] as { label: string; value: string }[]
    } catch {
      return [
        {
          label: 'Erreur lors de la recherche',
          value: '',
        },
      ]
    }
  }, 800)

  const onStructureSelect = (value: string | null) => {
    if (!value) return

    const structure = structuresMapRef.current.get(value)
    if (!structure) return

    setSelectedStructure(structure)
    setValue('structureEmployeuse', {
      id: structure.id,
      nom: structure.nom,
      adresseBan: {
        id: `${structure.codeInsee}-${structure.adresse}`,
        nom: structure.adresse,
        commune: structure.commune,
        codePostal: structure.codePostal,
        codeInsee: structure.codeInsee,
        contexte: structure.commune,
        latitude: 0,
        longitude: 0,
      },
      siret: structure.siret ?? '',
      typologies: structure.typologies,
    })
  }

  const switchToManualMode = () => {
    setMode('manual')
    setSelectedStructure(null)
    form.reset({
      userId: user.id,
      structureEmployeuse: {
        nom: '',
        siret: '',
      },
    })
  }

  const switchToSearchMode = () => {
    setMode('search')
    setSelectedStructure(null)
    form.reset({
      userId: user.id,
      structureEmployeuse: {
        nom: '',
        siret: '',
      },
    })
  }

  const isLoading = isSubmitting || isSubmitSuccessful

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {mode === 'search' ? (
        <>
          <CustomSelectFormField
            key={selectedStructure?.siret ?? 'search'}
            label="Rechercher par SIRET, nom ou adresse de votre structure"
            control={control}
            path="structureEmployeuse.siret"
            placeholder="Rechercher"
            loadOptions={loadOptions}
            isOptionDisabled={(option) => option.value === ''}
            cacheOptions
            info={<SiretInputInfo />}
            onChange={(option) => {
              if (option && 'value' in option) {
                onStructureSelect(option.value as string)
              }
            }}
          />
          {errors.structureEmployeuse?.root && (
            <p className="fr-text-default--error fr-mb-0">
              {errors.structureEmployeuse.root.message}
            </p>
          )}
          {selectedStructure && (
            <StructureCard
              className="fr-mt-6v fr-mb-6v"
              structure={selectedStructure}
            />
          )}
          <div className="fr-mt-6v">
            <Button
              type="button"
              iconId="fr-icon-add-line"
              onClick={switchToManualMode}
            >
              Ma structure n'apparaît pas, je la crée manuellement
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="fr-mb-4v">
            <Button
              type="button"
              priority="tertiary no outline"
              iconId="fr-icon-arrow-left-line"
              onClick={switchToSearchMode}
            >
              Retour à la recherche
            </Button>
          </div>
          <h3 className="fr-h6 fr-mb-4v">Créer une structure manuellement</h3>
          <InputFormField
            control={control}
            path="structureEmployeuse.nom"
            label="Nom de la structure"
            asterisk
            disabled={isLoading}
          />
          <InputFormField
            control={control}
            path="structureEmployeuse.siret"
            label="SIRET"
            hint="14 chiffres"
            asterisk
            disabled={isLoading}
            info={<SiretInputInfo />}
          />
          <AdresseBanFormField
            control={control}
            path="structureEmployeuse.adresseBan"
            label="Adresse"
            placeholder="Rechercher une adresse"
            asterisk
            disabled={isLoading}
          />
        </>
      )}

      <hr className="fr-separator-12v" />

      <div className="fr-btns-group">
        <Button
          type="submit"
          priority="primary"
          {...buttonLoadingClassname(isLoading, 'fr-mb-0')}
          disabled={!selectedStructure && mode === 'search'}
        >
          Continuer
        </Button>
      </div>
    </form>
  )
}

export default withTrpc(RenseignerStructureEmployeuseForm)
