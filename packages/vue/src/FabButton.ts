import { defineComponent, h, mergeProps } from "vue"
import type { PropType } from "vue"
import {
  getFabButtonClasses,
  getFabButtonCssVars,
  getSectionClasses,
  normalizeSections
} from "@rezafab/fab-button-core"
import type { FabButtonProps, FabButtonSection, FabButtonSectionContent } from "./types"

import "@rezafab/fab-button-styles/style.css"

const resolveSectionContent = (content: FabButtonSectionContent) =>
  (typeof content === "function" ? content() : content) ?? undefined

export const FabButton = defineComponent({
  name: "FabButton",
  inheritAttrs: false,
  props: {
    sections: {
      type: Array as PropType<FabButtonSection[]>,
      required: true
    },
    variant: {
      type: String as PropType<FabButtonProps["variant"]>,
      default: "default"
    },
    size: {
      type: String as PropType<FabButtonProps["size"]>,
      default: "md"
    },
    shape: {
      type: String as PropType<FabButtonProps["shape"]>,
      default: "rounded"
    },
    layout: {
      type: String as PropType<FabButtonProps["layout"]>,
      default: "flex"
    },
    columns: {
      type: String,
      default: undefined
    },
    rows: {
      type: String,
      default: undefined
    },
    gap: {
      type: String,
      default: undefined
    },
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: [String, Array, Object] as PropType<FabButtonProps["style"]>,
      default: undefined
    },
    unstyled: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    ariaLabel: {
      type: String,
      default: undefined
    },
    onClick: {
      type: Function as PropType<FabButtonProps["onClick"]>,
      default: undefined
    }
  },
  emits: {
    click: (_event: MouseEvent) => true,
    "section-click": (_key: string, _event: MouseEvent) => true
  },
  setup(props, { attrs, emit }) {
    return () => {
      const normalizedSections = normalizeSections(props.sections ?? [])
      const hasSectionActions = normalizedSections.some((section) => Boolean(section.onClick))
      const isDisabled = props.disabled || props.loading
      const styleVars = getFabButtonCssVars({
        columns: props.columns,
        rows: props.rows,
        gap: props.gap
      })
      const rootClassName = props.unstyled
        ? props.className
        : getFabButtonClasses({
            className: props.className,
            layout: props.layout,
            size: props.size,
            shape: props.shape,
            variant: props.variant,
            disabled: isDisabled,
            loading: props.loading
          })
      const rootProps = {
        class: rootClassName,
        style: [styleVars, props.style],
        "aria-label": props.ariaLabel,
        "data-layout": props.layout,
        "data-variant": props.variant,
        "data-size": props.size,
        "data-shape": props.shape,
        "data-disabled": isDisabled ? "true" : undefined
      }

      if (hasSectionActions) {
        const children = props.loading
          ? h("span", { class: props.unstyled ? undefined : "fab-button__section", "aria-live": "polite" }, "Loading...")
          : normalizedSections.map((section) =>
              h(
                "button",
                {
                  key: section.key,
                  type: "button",
                  class: props.unstyled ? section.className : getSectionClasses(section),
                  style: section.style,
                  disabled: isDisabled || section.disabled,
                  "aria-label": section.ariaLabel,
                  "data-section": section.key,
                  onClick: (event: MouseEvent) => {
                    section.onClick?.(event)
                    emit("section-click", section.key, event)
                  }
                },
                resolveSectionContent(section.content)
              )
            )

        return h(
          "div",
          mergeProps(attrs, {
            ...rootProps,
            role: "group",
            "aria-disabled": isDisabled ? "true" : undefined
          }),
          children
        )
      }

      const children = props.loading
        ? h("span", { class: props.unstyled ? undefined : "fab-button__section", "aria-live": "polite" }, "Loading...")
        : normalizedSections.map((section) =>
            h(
              "span",
              {
                key: section.key,
                class: props.unstyled ? section.className : getSectionClasses(section),
                style: section.style,
                "data-section": section.key,
                "aria-label": section.ariaLabel
              },
              resolveSectionContent(section.content)
            )
          )

      return h(
        "button",
        mergeProps(attrs, {
          ...rootProps,
          type: "button",
          disabled: isDisabled,
          onClick: (event: MouseEvent) => {
            props.onClick?.(event)
            emit("click", event)
          }
        }),
        children
      )
    }
  }
})
