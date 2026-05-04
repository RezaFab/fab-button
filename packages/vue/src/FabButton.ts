import { computed, defineComponent, h, mergeProps, nextTick, onUnmounted, ref, watch } from "vue"
import type { PropType } from "vue"
import {
  getEnabledSectionIndices,
  getFabButtonTheme,
  getFabButtonClasses,
  getFabButtonCssVars,
  getNavigationCommand,
  resolveSectionIndex,
  getSectionClasses,
  subscribeFabButtonConfig,
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
    theme: {
      type: String as PropType<FabButtonProps["theme"]>,
      default: undefined
    },
    ariaLabel: {
      type: String,
      default: undefined
    },
    keyboardNavigation: {
      type: String as PropType<FabButtonProps["keyboardNavigation"]>,
      default: "tab"
    },
    keyboardOrientation: {
      type: String as PropType<FabButtonProps["keyboardOrientation"]>,
      default: undefined
    },
    loopNavigation: {
      type: Boolean,
      default: true
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
    const configVersion = ref(0)
    const unsubscribeConfig = subscribeFabButtonConfig(() => {
      configVersion.value += 1
    })
    onUnmounted(() => {
      unsubscribeConfig()
    })

    const rootRef = ref<HTMLElement | null>(null)
    const activeIndex = ref(-1)
    const normalizedSections = computed(() => normalizeSections(props.sections ?? []))
    const hasSectionActions = computed(() =>
      normalizedSections.value.some((section) => Boolean(section.onClick))
    )
    const isDisabled = computed(() => props.disabled || props.loading)
    const toolbarMode = computed(
      () => hasSectionActions.value && props.keyboardNavigation === "toolbar"
    )
    const keyboardOrientation = computed(
      () => props.keyboardOrientation ?? (props.layout === "grid" ? "both" : "horizontal")
    )
    const enabledIndices = computed(() =>
      getEnabledSectionIndices(normalizedSections.value, isDisabled.value)
    )

    watch(
      [toolbarMode, enabledIndices],
      () => {
        if (!toolbarMode.value) return
        if (!enabledIndices.value.length) {
          activeIndex.value = -1
          return
        }
        if (!enabledIndices.value.includes(activeIndex.value)) {
          activeIndex.value = enabledIndices.value[0]
        }
      },
      { immediate: true }
    )

    const focusSection = (index: number) => {
      nextTick(() => {
        rootRef.value
          ?.querySelector<HTMLButtonElement>(`button[data-section-index="${index}"]`)
          ?.focus()
      })
    }

    const handleToolbarKeyDown = (event: KeyboardEvent) => {
      if (!toolbarMode.value || !enabledIndices.value.length) return

      const command = getNavigationCommand(event.key, keyboardOrientation.value)
      if (!command) return

      const target = event.target as HTMLElement | null
      const sectionButton = target?.closest<HTMLButtonElement>("button[data-section-index]")
      if (!sectionButton) return

      const indexValue = Number(sectionButton.dataset.sectionIndex)
      const currentIndex = Number.isNaN(indexValue) ? activeIndex.value : indexValue
      const nextIndex = resolveSectionIndex({
        command,
        currentIndex,
        enabledIndices: enabledIndices.value,
        loop: props.loopNavigation
      })
      if (nextIndex === null) return

      event.preventDefault()
      activeIndex.value = nextIndex
      focusSection(nextIndex)
    }

    return () => {
      configVersion.value

      const styleVars = getFabButtonCssVars({
        columns: props.columns,
        rows: props.rows,
        gap: props.gap
      })
      const resolvedTheme = props.theme ?? getFabButtonTheme()
      const rootClassName = props.unstyled
        ? props.className
        : getFabButtonClasses({
            className: props.className,
            layout: props.layout,
            size: props.size,
            shape: props.shape,
            variant: props.variant,
            theme: resolvedTheme,
            disabled: isDisabled.value,
            loading: props.loading
          })
      const rootProps = {
        class: rootClassName,
        style: [styleVars, props.style],
        "aria-label": props.ariaLabel,
        "aria-busy": props.loading ? "true" : undefined,
        "data-layout": props.layout,
        "data-variant": props.variant,
        "data-size": props.size,
        "data-shape": props.shape,
        "data-theme": resolvedTheme,
        "data-disabled": isDisabled.value ? "true" : undefined
      }

      if (hasSectionActions.value) {
        const children = props.loading
          ? h(
              "span",
              {
                class: props.unstyled ? undefined : getSectionClasses({ theme: resolvedTheme }),
                "aria-live": "polite",
                role: "status"
              },
              "Loading..."
            )
          : normalizedSections.value.map((section, index) =>
              h(
                "button",
                {
                  key: section.key,
                  type: "button",
                  class:
                    props.unstyled
                      ? section.className
                      : getSectionClasses({ ...section, interactive: true, theme: resolvedTheme }),
                  style: section.style,
                  disabled: isDisabled.value || section.disabled,
                  tabIndex:
                    toolbarMode.value
                      ? index === activeIndex.value
                        ? 0
                        : -1
                      : undefined,
                  "aria-label": section.ariaLabel,
                  "data-section": section.key,
                  "data-section-index": index,
                  onFocus: () => {
                    if (toolbarMode.value) activeIndex.value = index
                  },
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
            ref: rootRef,
            role: toolbarMode.value ? "toolbar" : "group",
            "aria-orientation":
              toolbarMode.value && keyboardOrientation.value !== "both"
                ? keyboardOrientation.value
                : undefined,
            "aria-disabled": isDisabled.value ? "true" : undefined,
            onKeydown: handleToolbarKeyDown
          }),
          children
        )
      }

      const children = props.loading
        ? h(
            "span",
            {
              class: props.unstyled ? undefined : getSectionClasses({ theme: resolvedTheme }),
              "aria-live": "polite",
              role: "status"
            },
            "Loading..."
          )
        : normalizedSections.value.map((section) =>
            h(
              "span",
              {
                key: section.key,
                class:
                  props.unstyled
                    ? section.className
                    : getSectionClasses({ ...section, theme: resolvedTheme }),
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
          disabled: isDisabled.value,
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
