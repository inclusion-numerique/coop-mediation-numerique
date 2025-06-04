import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { type DefaultValues, withForm } from '@app/web/libs/form/use-app-form'
import { Autonomie } from '@prisma/client'
import { formOptions } from '@tanstack/react-form'
import Link from 'next/link'
import { type CraIndividuelData } from '../../validation/CraIndividuelValidation'

const options = formOptions({
  defaultValues: {} as DefaultValues<CraIndividuelData> & {
    mediateurId: string
  },
})

export const AutonomieBeneficiaireField = withForm({
  ...options,
  props: {} as {
    isPending: boolean
    autonomieOptionsWithExtras: SelectOption<Autonomie>[]
  },
  render: ({ form, isPending, autonomieOptionsWithExtras }) => (
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
  ),
})
