import { FrIconClassName, RiIconClassName, fr } from '@codegouvfr/react-dsfr'
import { cx } from '@codegouvfr/react-dsfr/tools/cx'
import React, {
  memo,
  forwardRef,
  useId,
  type CSSProperties,
  type DetailedHTMLProps,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react'
import { assert, Equals } from 'tsafe/assert'
import { symToStr } from 'tsafe/symToStr'
export type InputProps = InputProps.RegularInput | InputProps.TextArea

export namespace InputProps {
  export type Common = {
    className?: string
    id?: string
    label: ReactNode
    hintText?: ReactNode
    hideLabel?: boolean
    disabled?: boolean
    iconId?: FrIconClassName | RiIconClassName
    size?: 'small' | 'medium' | 'large' | 'x-large'
    classes?: Partial<
      Record<
        | 'root'
        | 'label'
        | 'description'
        | 'nativeInputOrTextArea'
        | 'message'
        | 'wrap',
        string
      >
    >
    style?: CSSProperties
    state?: 'success' | 'error' | 'info' | 'default'
    stateRelatedMessage?: ReactNode
    addinStart?: ReactNode
    addinEnd?: ReactNode
    addonStart?: ReactNode
    addonEnd?: ReactNode
    action?: ReactNode
  }

  export type RegularInput = Common & {
    textArea?: false
    nativeInputProps?: DetailedHTMLProps<
      InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >
    nativeLabelProps?: DetailedHTMLProps<
      LabelHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >

    nativeTextAreaProps?: never
  }

  export type TextArea = Common & {
    textArea: true
    nativeTextAreaProps?: DetailedHTMLProps<
      TextareaHTMLAttributes<HTMLTextAreaElement>,
      HTMLTextAreaElement
    >
    nativeLabelProps?: DetailedHTMLProps<
      LabelHTMLAttributes<HTMLTextAreaElement>,
      HTMLTextAreaElement
    >

    nativeInputProps?: never
  }
}

export const Input = memo(
  forwardRef<HTMLDivElement, InputProps>((props, ref) => {
    const {
      className,
      id,
      label,
      hintText,
      hideLabel,
      disabled = false,
      iconId,
      classes = {},
      style,
      size = 'medium',
      state = 'default',
      stateRelatedMessage,
      textArea = false,
      nativeTextAreaProps,
      nativeInputProps,
      addinStart,
      addinEnd,
      addonStart,
      addonEnd,
      action,
      nativeLabelProps,
      ...rest
    } = props

    const nativeInputOrTextAreaProps =
      (textArea ? nativeTextAreaProps : nativeInputProps) ?? {}

    const NativeInputOrTextArea = textArea ? 'textarea' : 'input'

    assert<Equals<keyof typeof rest, never>>()

    const inputId = (function useClosure() {
      const id = useId()

      return nativeInputOrTextAreaProps.id ?? `input-${id}`
    })()

    const messageId = `${inputId}-desc-error`
    const messagesGroupId = `${inputId}-messages-group`

    return (
      <div
        className={cx(
          fr.cx(
            nativeInputProps?.type === 'file'
              ? 'fr-upload-group'
              : 'fr-input-group',
            disabled && 'fr-input-group--disabled',
            (() => {
              switch (state) {
                case 'error':
                  return 'fr-input-group--error'
                case 'success':
                  return 'fr-input-group--valid'
                default:
                  return undefined
              }
            })(),
          ),
          classes.root,
          className,
        )}
        style={style}
        ref={ref}
        id={id}
        {...rest}
      >
        {Boolean(label || hintText) && (
          <label
            className={cx(
              fr.cx('fr-label', hideLabel && 'fr-sr-only'),
              classes.label,
            )}
            htmlFor={inputId}
            {...(nativeLabelProps as {})}
          >
            {label}
            {hintText !== undefined && (
              <span className="fr-hint-text">{hintText}</span>
            )}
          </label>
        )}
        {(() => {
          const nativeInputOrTextArea = (
            <NativeInputOrTextArea
              {...(nativeInputOrTextAreaProps as {})}
              className={cx(
                fr.cx(
                  'fr-input',
                  (() => {
                    switch (state) {
                      case 'error':
                        return 'fr-input--error'
                      case 'success':
                        return 'fr-input--valid'
                      default:
                        return undefined
                    }
                  })(),
                ),
                'fr-input--white',
                (() => {
                  switch (size) {
                    case 'small':
                      return 'fr-input--sm'
                    case 'large':
                      return 'fr-input--lg'
                    case 'x-large':
                      return 'fr-input--xl'
                    default:
                      return undefined
                  }
                })(),
                classes.nativeInputOrTextArea,
              )}
              disabled={disabled || undefined}
              aria-describedby={
                [
                  state !== 'default' ? messageId : undefined,
                  nativeInputOrTextAreaProps['aria-describedby'],
                ]
                  .filter((value) => value !== undefined)
                  .join(' ') || undefined
              }
              type={textArea ? undefined : (nativeInputProps?.type ?? 'text')}
              id={inputId}
            />
          )

          const hasIcon = iconId !== undefined
          const hasAddinStart = addinStart !== undefined
          const hasAddinEnd = addinEnd !== undefined
          const hasAddonStart = addonStart !== undefined
          const hasAddonEnd = addonEnd !== undefined
          const hasAction = action !== undefined
          return hasIcon ||
            hasAddinStart ||
            hasAddinEnd ||
            hasAddonStart ||
            hasAddonEnd ||
            hasAction ? (
            <div
              className={cx(
                'fr-input-wrap',
                hasIcon && iconId,
                (hasAddonStart || hasAddonEnd) && 'fr-input-wrap--addon',
                (hasAddinStart || hasAddinEnd) && 'fr-input-wrap--addin',
                hasAction && 'fr-input-wrap--action',
                classes.wrap,
              )}
            >
              {hasAddonStart && addonStart}
              {hasAddinStart && (
                <span className="fr-input--addin-start">{addinStart}</span>
              )}
              {nativeInputOrTextArea}
              {hasAddinEnd && (
                <span className="fr-input--addin-end">{addinEnd}</span>
              )}
              {hasAddonEnd && addonEnd}
              {hasAction && action}
            </div>
          ) : (
            nativeInputOrTextArea
          )
        })()}
        <div
          id={messagesGroupId}
          className={fr.cx('fr-messages-group')}
          aria-live="polite"
        >
          {state !== 'default' && (
            <p
              id={messageId}
              className={cx(
                fr.cx(
                  (() => {
                    switch (state) {
                      case 'error':
                        return 'fr-error-text'
                      case 'success':
                        return 'fr-valid-text'
                      case 'info':
                        return 'fr-info-text'
                      default:
                        return undefined
                    }
                  })(),
                ),
                classes.message,
              )}
            >
              {stateRelatedMessage}
            </p>
          )}
        </div>
      </div>
    )
  }),
)

Input.displayName = symToStr({ Input })

export default Input
