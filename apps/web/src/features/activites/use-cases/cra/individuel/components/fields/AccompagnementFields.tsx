import RedAsterisk from '@app/ui/components/Form/RedAsterisk'
import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { type DefaultValues, withForm } from '@app/web/libs/form/use-app-form'
import {
  Autonomie,
  Materiel,
  StructureDeRedirection,
  Thematique,
} from '@prisma/client'
import { formOptions } from '@tanstack/react-form'
import Link from 'next/link'
import React from 'react'
import { type CraIndividuelData } from '../../validation/CraIndividuelValidation'

const options = formOptions({
  defaultValues: {} as DefaultValues<CraIndividuelData> & {
    mediateurId: string
  },
})

export const AccompagnementFields = withForm({
  ...options,
  props: {} as {
    isPending: boolean
    materielOptions: SelectOption<Materiel>[]
    thematiqueNonAdministrativesOptionsWithExtras: SelectOption<Thematique>[]
    thematiqueAdministrativesOptionsWithExtras: SelectOption<Thematique>[]
    autonomieOptionsWithExtras: SelectOption<Autonomie>[]
    yesNoBooleanOptions: SelectOption<'yes' | 'no'>[]
    structuresRedirectionOptions: SelectOption<StructureDeRedirection>[]
  },
  render: ({
    form,
    isPending,
    materielOptions,
    thematiqueNonAdministrativesOptionsWithExtras,
    thematiqueAdministrativesOptionsWithExtras,
    autonomieOptionsWithExtras,
    yesNoBooleanOptions,
    structuresRedirectionOptions,
  }) => (
    <>
      <form.AppField name="materiel">
        {(field) => (
          <field.Checkbox
            className="fr-flex-basis-0 fr-flex-grow-1 fr-mb-12v"
            classes={{
              content: 'fr-display-grid fr-grid--5x1 fr-grid-gap-2v',
            }}
            isPending={isPending}
            options={materielOptions}
            orientation="horizontal"
            legend="Matériel numérique utilisé"
          />
        )}
      </form.AppField>
      <form.AppField name="thematiques">
        {(field) => (
          <>
            <field.Checkbox
              className="fr-flex-basis-0 fr-flex-grow-1 fr-mb-12v"
              classes={{
                content:
                  'fr-display-grid fr-grid--3x1 fr-grid--last-span-3 fr-grid-gap-2v',
              }}
              isPending={isPending}
              options={thematiqueNonAdministrativesOptionsWithExtras}
              orientation="horizontal"
              legend={
                <>
                  Thématique(s) d’accompagnement de médiation numérique{' '}
                  <RedAsterisk />
                </>
              }
            />
            {field.state.value?.includes(
              Thematique.AideAuxDemarchesAdministratives,
            ) && (
              <>
                <form.AppField name="thematiques">
                  {(field) => (
                    <>
                      <field.Checkbox
                        className="fr-flex-basis-0 fr-flex-grow-1 fr-mb-12v"
                        classes={{
                          content:
                            'fr-display-grid fr-grid--3x1 fr-grid-gap-2v',
                        }}
                        isPending={isPending}
                        options={thematiqueAdministrativesOptionsWithExtras}
                        orientation="horizontal"
                        legend="Thématique(s) de la démarche administrative"
                      />
                    </>
                  )}
                </form.AppField>
                <form.AppField name="precisionsDemarche">
                  {(field) => (
                    <>
                      <field.Input
                        isPending={isPending}
                        label="Préciser le nom de la démarche administrative réalisée"
                      />
                    </>
                  )}
                </form.AppField>
              </>
            )}
          </>
        )}
      </form.AppField>
      <hr className="fr-separator-12v" />
      <form.AppField name="autonomie">
        {(field) => (
          <field.RadioButtons
            className="fr-flex-basis-0 fr-flex-grow-1 fr-mb-12v"
            classes={{ content: 'fr-display-grid fr-grid--3x1 fr-grid-gap-2v' }}
            isPending={isPending}
            options={autonomieOptionsWithExtras}
            orientation="horizontal"
            legend={
              <>
                Niveau d’autonomie du bénéficiaire{' '}
                <Link
                  className="fr-link"
                  href="https://www.notion.so/incubateurdesterritoires/Accompagnement-individuel-de-m-diation-num-rique-94011d45a214412981168bdd5e9d66c7?pvs=4#492e5cab20aa4431b817be4e9f1a4329"
                  target="_blank"
                >
                  En savoir plus
                </Link>
              </>
            }
          />
        )}
      </form.AppField>
      <form.AppField name="orienteVersStructure">
        {(field) => (
          <>
            <field.RadioButtons
              className="fr-flex-basis-0 fr-flex-grow-1"
              classes={{
                content: 'fr-display-grid fr-grid--2x1 fr-grid-gap-2v',
              }}
              isPending={isPending}
              options={yesNoBooleanOptions}
              orientation="horizontal"
              legend="Le bénéficiaire est-il orienté vers une autre structure ?"
            />
            {field.state.value === 'yes' && (
              <form.AppField name="structureDeRedirection">
                {(field) => (
                  <field.Select
                    className="fr-flex-basis-0 fr-flex-grow-1 fr-mb-8v"
                    isPending={isPending}
                    options={structuresRedirectionOptions}
                    placeholder="Structure de redirection"
                    label={<></>}
                  />
                )}
              </form.AppField>
            )}
          </>
        )}
      </form.AppField>
    </>
  ),
})
