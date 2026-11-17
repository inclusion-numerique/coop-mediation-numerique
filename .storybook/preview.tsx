import '@codegouvfr/react-dsfr/main.css'
import '@codegouvfr/react-dsfr/dsfr/utility/colors/colors.min.css'
import '@/styles/index.css'
import { startReactDsfr } from '@codegouvfr/react-dsfr/spa'
import { Preview } from '@storybook/react'
import { DEFAULT_VIEWPORT, MINIMAL_VIEWPORTS } from 'storybook/viewport'

startReactDsfr({
  defaultColorScheme: 'system',
  useLang: () => 'fr',
})

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      story: {
        // inline: false,
      },
    },
    nextjs: {
      appDirectory: true,
    },
    viewport: {
      defaultViewport: DEFAULT_VIEWPORT,
      viewports: {
        ...MINIMAL_VIEWPORTS,
        mediumContainer: {
          name: 'Medium container',
          styles: {
            width: '792px',
            height: '1000px',
          },
        },
        narrowContainer: {
          name: 'Narrow container',
          styles: {
            width: '588px',
            height: '1000px',
          },
        },
        container: {
          name: 'Container',
          styles: {
            width: '1200px',
            height: '1000px',
          },
        },
      },
    },
  },
}

export default preview
