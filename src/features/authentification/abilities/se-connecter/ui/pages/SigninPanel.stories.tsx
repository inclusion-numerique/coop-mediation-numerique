import { Meta, StoryObj } from '@storybook/react'
import SigninPanel from '@/features/authentification/abilities/se-connecter/ui/pages/SigninPanel'

const meta: Meta<typeof SigninPanel> = {
  title: 'SigninPanel',
  component: SigninPanel,
}

export default meta

type Story = StoryObj<typeof SigninPanel>

export const Desktop: Story = {}
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}
