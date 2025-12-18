import Button from '@codegouvfr/react-dsfr/Button'
import { ButtonProps } from '@codegouvfr/react-dsfr/src/Button'
import { snapdom } from '@zumer/snapdom'
import { RefObject } from 'react'

const downloadName = (captureName: string, includeDate: boolean) =>
  `${[captureName, includeDate && Date.now()].filter(Boolean).join('-')}.png`

const filter = (node: Element) =>
  node instanceof HTMLElement ? !node.classList.contains('fr-no-print') : true

const downloadCapture =
  (captureName: string, includeDate: boolean) => (blob: Blob | null) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = downloadName(captureName, includeDate)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

type CaptureButtonProps = ButtonProps.Common &
  ButtonProps.IconOnly &
  ButtonProps.AsButton & {
    captureRef: RefObject<HTMLDivElement | null>
    captureName: string
    includeDate?: boolean
  }

export const CaptureButton = ({
  captureRef,
  captureName,
  includeDate = true,
  title,
  iconId,
  ...commonProps
}: CaptureButtonProps) => {
  const handleDownload = async () => {
    if (!captureRef.current) return
    const canvas = await snapdom.toCanvas(captureRef.current, { filter })
    canvas.toBlob(downloadCapture(captureName, includeDate), 'image/png', 1.0)
  }

  return (
    <Button
      {...commonProps}
      title={title}
      iconId={iconId}
      onClick={handleDownload}
    />
  )
}
