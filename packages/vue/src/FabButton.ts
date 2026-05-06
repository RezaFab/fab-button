import { Fragment, computed, defineComponent, h, mergeProps, nextTick, onUnmounted, ref, watch } from "vue"
import type { PropType } from "vue"
import {
  type FabButtonSectionAsyncState,
  getEnabledSectionIndices,
  getFabButtonTheme,
  getFabButtonClasses,
  getFabButtonCssVars,
  getShortcutSectionIndex,
  getNavigationCommand,
  getSectionShortcutHint,
  resolveSectionConfirmPrompt,
  resolveSectionIndex,
  getSectionClasses,
  subscribeFabButtonConfig,
  normalizeSections
} from "@rezafab/fab-button-core"
import type { FabButtonProps, FabButtonSection, FabButtonSectionContent } from "./types"

import "@rezafab/fab-button-styles/style.css"

const AUTO_ASYNC_FEEDBACK_MS = 1600

const isPromiseLike = (value: unknown): value is PromiseLike<unknown> =>
  Boolean(value) && typeof (value as { then?: unknown }).then === "function"

const resolveSectionContent = (content: FabButtonSectionContent) =>
  (typeof content === "function" ? content() : content) ?? undefined

const getSectionConfirmFallbackTitle = (section: FabButtonSection) => {
  if (typeof section.content === "string" || typeof section.content === "number") {
    return `${section.content}`
  }
  return section.ariaLabel || section.key
}

const toShortcutDataAttribute = (shortcut: FabButtonSection["shortcut"]) => {
  if (shortcut === undefined) return undefined
  return Array.isArray(shortcut) ? shortcut.join(",") : `${shortcut}`
}

const toShortcutIdDataAttribute = (shortcutId: FabButtonSection["shortcutId"]) => {
  if (shortcutId === undefined) return undefined
  return Array.isArray(shortcutId) ? shortcutId.join(",") : `${shortcutId}`
}

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
    overflowMode: {
      type: String as PropType<FabButtonProps["overflowMode"]>,
      default: "none"
    },
    overflowBreakpoint: {
      type: Number,
      default: 768
    },
    overflowVisibleCount: {
      type: Number,
      default: 2
    },
    overflowMenuLabel: {
      type: String,
      default: "More"
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
    const pendingConfirm = ref<{
      sectionIndex: number
      title: string
      description?: string
      confirmText: string
      cancelText: string
    } | null>(null)
    const pendingConfirmBypassIndex = ref<number | null>(null)
    const runtimeAsyncStates = ref<Record<string, FabButtonSectionAsyncState>>({})
    const asyncResetTimers = new Map<string, ReturnType<typeof globalThis.setTimeout>>()
    const isCompactViewport = ref(false)
    const overflowMenuOpen = ref(false)
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
    const getSectionAsyncState = (section: FabButtonSection): FabButtonSectionAsyncState => {
      if (section.asyncState !== undefined) return section.asyncState
      return runtimeAsyncStates.value[section.key] ?? "idle"
    }
    const sectionsForInteraction = computed(() =>
      normalizedSections.value.map((section) => {
        const sectionAsyncState = getSectionAsyncState(section)
        return {
          ...section,
          disabled: section.disabled || sectionAsyncState === "loading"
        }
      })
    )
    const safeOverflowVisibleCount = computed(() => Math.max(1, Math.trunc(props.overflowVisibleCount ?? 2)))
    const sectionEntries = computed(() =>
      normalizedSections.value.map((section, index) => ({ section, index }))
    )
    const isOverflowEnabled = computed(
      () =>
        hasSectionActions.value &&
        props.overflowMode === "more" &&
        sectionEntries.value.length > safeOverflowVisibleCount.value
    )
    const isOverflowActive = computed(() => isOverflowEnabled.value && isCompactViewport.value)
    const visibleSectionEntries = computed(() => {
      if (!isOverflowActive.value) return sectionEntries.value
      return sectionEntries.value.slice(0, safeOverflowVisibleCount.value)
    })
    const overflowSectionEntries = computed(() => {
      if (!isOverflowActive.value) return []
      return sectionEntries.value.slice(safeOverflowVisibleCount.value)
    })
    const hiddenOverflowIndexSet = computed(() => {
      if (!isOverflowActive.value || overflowMenuOpen.value) return new Set<number>()
      return new Set(overflowSectionEntries.value.map((entry) => entry.index))
    })
    const enabledIndices = computed(() =>
      getEnabledSectionIndices(sectionsForInteraction.value, isDisabled.value).filter(
        (index) => !hiddenOverflowIndexSet.value.has(index)
      )
    )

    const clearAsyncResetTimer = (sectionKey: string) => {
      const timer = asyncResetTimers.get(sectionKey)
      if (!timer) return
      globalThis.clearTimeout(timer)
      asyncResetTimers.delete(sectionKey)
    }

    const scheduleAsyncStateReset = (section: FabButtonSection) => {
      clearAsyncResetTimer(section.key)
      const timer = globalThis.setTimeout(
        () => {
          if (section.asyncState !== undefined) return
          const nextState = { ...runtimeAsyncStates.value }
          if (nextState[section.key] === undefined) return
          delete nextState[section.key]
          runtimeAsyncStates.value = nextState
          asyncResetTimers.delete(section.key)
        },
        section.asyncFeedbackDuration ?? AUTO_ASYNC_FEEDBACK_MS
      )
      asyncResetTimers.set(section.key, timer)
    }

    const startAsyncSectionAction = (section: FabButtonSection, result: unknown) => {
      if (section.asyncState !== undefined) return
      if (!isPromiseLike(result)) return

      clearAsyncResetTimer(section.key)
      runtimeAsyncStates.value = { ...runtimeAsyncStates.value, [section.key]: "loading" }

      Promise.resolve(result)
        .then(() => {
          runtimeAsyncStates.value = { ...runtimeAsyncStates.value, [section.key]: "success" }
          scheduleAsyncStateReset(section)
        })
        .catch(() => {
          runtimeAsyncStates.value = { ...runtimeAsyncStates.value, [section.key]: "error" }
          scheduleAsyncStateReset(section)
        })
    }

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

    watch(
      normalizedSections,
      (sections) => {
        const validKeys = new Set(sections.map((section) => section.key))
        const nextState = { ...runtimeAsyncStates.value }
        let changed = false

        Object.keys(nextState).forEach((sectionKey) => {
          if (validKeys.has(sectionKey)) return
          delete nextState[sectionKey]
          clearAsyncResetTimer(sectionKey)
          changed = true
        })

        if (changed) {
          runtimeAsyncStates.value = nextState
        }
      },
      { immediate: true }
    )

    watch(
      isOverflowEnabled,
      (enabled) => {
        if (!enabled) {
          isCompactViewport.value = false
          overflowMenuOpen.value = false
          return
        }
        if (typeof window === "undefined") return
        isCompactViewport.value = window.innerWidth <= props.overflowBreakpoint
      },
      { immediate: true }
    )

    watch(isOverflowActive, (active) => {
      if (!active) {
        overflowMenuOpen.value = false
      }
    })

    onUnmounted(() => {
      Array.from(asyncResetTimers.keys()).forEach((sectionKey) => clearAsyncResetTimer(sectionKey))
    })

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

    const handleWindowShortcutKeyDown = (event: KeyboardEvent) => {
      if (!hasSectionActions.value) return
      if (pendingConfirm.value) {
        if (event.key === "Escape") {
          event.preventDefault()
          pendingConfirm.value = null
        }
        return
      }

      if (overflowMenuOpen.value && event.key === "Escape") {
        event.preventDefault()
        overflowMenuOpen.value = false
        return
      }

      const shortcutSectionIndex = getShortcutSectionIndex(
        sectionsForInteraction.value,
        event,
        isDisabled.value
      )
      if (shortcutSectionIndex === null) return

      const shortcutSection = sectionsForInteraction.value[shortcutSectionIndex]
      if (!shortcutSection?.onClick) return

      const shortcutButton = rootRef.value?.querySelector<HTMLButtonElement>(
        `button[data-section-index="${shortcutSectionIndex}"]`
      )
      if (!shortcutButton || shortcutButton.disabled) return

      event.preventDefault()
      if (toolbarMode.value) {
        activeIndex.value = shortcutSectionIndex
      }
      if (shortcutButton.offsetParent !== null) {
        shortcutButton.focus()
      }
      shortcutButton.click()
    }

    const closeConfirmDialog = () => {
      pendingConfirm.value = null
    }

    const proceedConfirmedSectionAction = () => {
      if (!pendingConfirm.value) return
      const nextIndex = pendingConfirm.value.sectionIndex
      pendingConfirm.value = null

      const targetButton = rootRef.value?.querySelector<HTMLButtonElement>(
        `button[data-section-index="${nextIndex}"]`
      )
      if (!targetButton || targetButton.disabled) return

      pendingConfirmBypassIndex.value = nextIndex
      targetButton.focus()
      targetButton.click()
    }

    const handleWindowResize = () => {
      if (!isOverflowEnabled.value) return
      isCompactViewport.value = window.innerWidth <= props.overflowBreakpoint
    }

    const handleDocumentMouseDown = (event: MouseEvent) => {
      if (!overflowMenuOpen.value) return
      const target = event.target as Node | null
      if (!target) return
      if (rootRef.value?.contains(target)) return
      overflowMenuOpen.value = false
    }

    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleWindowShortcutKeyDown)
      window.addEventListener("resize", handleWindowResize)
      document.addEventListener("mousedown", handleDocumentMouseDown)
      onUnmounted(() => {
        window.removeEventListener("keydown", handleWindowShortcutKeyDown)
        window.removeEventListener("resize", handleWindowResize)
        document.removeEventListener("mousedown", handleDocumentMouseDown)
      })
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

      const renderSectionActionButton = (
        section: FabButtonSection,
        index: number,
        options?: { closeOverflowMenuOnClick?: boolean; role?: "menuitem"; overflowItem?: boolean }
      ) => {
        const sectionShortcutHint = getSectionShortcutHint(section)
        return h(
          "button",
          {
            ...((() => {
              const sectionAsyncState = getSectionAsyncState(section)
              const sectionDisabled = isDisabled.value || section.disabled || sectionAsyncState === "loading"
              return {
                disabled: sectionDisabled,
                "aria-busy": sectionAsyncState === "loading" ? "true" : undefined,
                "data-async-state": sectionAsyncState !== "idle" ? sectionAsyncState : undefined
              }
            })()),
            key: section.key,
            type: "button",
            role: options?.role,
            class:
              props.unstyled
                ? section.className
                : getSectionClasses({
                    ...section,
                    disabled: isDisabled.value || section.disabled || getSectionAsyncState(section) === "loading",
                    interactive: true,
                    theme: resolvedTheme
                  }),
            style: section.style,
            tabIndex:
              toolbarMode.value
                ? index === activeIndex.value
                  ? 0
                  : -1
                : undefined,
            "aria-label": section.ariaLabel,
            "data-section": section.key,
            "data-section-index": index,
            "data-shortcut": toShortcutDataAttribute(section.shortcut),
            "data-shortcut-id": toShortcutIdDataAttribute(section.shortcutId),
            "data-shortcut-hint": sectionShortcutHint ?? undefined,
            "data-overflow-item": options?.overflowItem ? "true" : undefined,
            onFocus: () => {
              if (toolbarMode.value) activeIndex.value = index
            },
            onClick: (event: MouseEvent) => {
              if (options?.closeOverflowMenuOnClick) {
                overflowMenuOpen.value = false
              }

              const sectionAsyncState = getSectionAsyncState(section)
              if (sectionAsyncState === "loading") {
                event.preventDefault()
                event.stopPropagation()
                return
              }

              if (pendingConfirmBypassIndex.value === index) {
                pendingConfirmBypassIndex.value = null
                const confirmedResult = section.onClick?.(event)
                startAsyncSectionAction(section, confirmedResult)
                emit("section-click", section.key, event)
                return
              }

              const confirmPrompt = resolveSectionConfirmPrompt(section, {
                fallbackTitle: getSectionConfirmFallbackTitle(section)
              })
              if (confirmPrompt) {
                event.preventDefault()
                event.stopPropagation()
                overflowMenuOpen.value = false
                pendingConfirm.value = {
                  sectionIndex: index,
                  title: confirmPrompt.title,
                  description: confirmPrompt.description,
                  confirmText: confirmPrompt.confirmText,
                  cancelText: confirmPrompt.cancelText
                }
                return
              }

              const clickResult = section.onClick?.(event)
              startAsyncSectionAction(section, clickResult)
              emit("section-click", section.key, event)
            }
          },
          [
            resolveSectionContent(section.content),
            !props.unstyled && sectionShortcutHint
              ? h(
                  "span",
                  {
                    class: "fab-button__shortcut-hint",
                    "aria-hidden": "true"
                  },
                  sectionShortcutHint
                )
              : null
          ]
        )
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
          : [
              ...visibleSectionEntries.value.map(({ section, index }) =>
                renderSectionActionButton(section, index)
              ),
              ...(isOverflowActive.value && overflowSectionEntries.value.length
                ? [
                    h("div", { class: "fab-button__overflow" }, [
                      h(
                        "button",
                        {
                          type: "button",
                          class: props.unstyled
                            ? undefined
                            : getSectionClasses({
                                interactive: true,
                                theme: resolvedTheme
                              }),
                          "aria-haspopup": "menu",
                          "aria-expanded": overflowMenuOpen.value ? "true" : "false",
                          "data-overflow-trigger": "true",
                          onClick: () => {
                            overflowMenuOpen.value = !overflowMenuOpen.value
                          }
                        },
                        props.overflowMenuLabel
                      ),
                      h(
                        "div",
                        {
                          class: "fab-button__overflow-menu",
                          role: "menu",
                          hidden: !overflowMenuOpen.value,
                          "data-open": overflowMenuOpen.value ? "true" : "false"
                        },
                        overflowSectionEntries.value.map(({ section, index }) =>
                          renderSectionActionButton(section, index, {
                            closeOverflowMenuOnClick: true,
                            role: "menuitem",
                            overflowItem: true
                          })
                        )
                      )
                    ])
                  ]
                : [])
            ]

        const rootNode = h(
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

        if (!pendingConfirm.value) return rootNode

        const confirmDialogNode = h(
          "div",
          {
            class: "fab-button-confirm__backdrop",
            "data-theme": resolvedTheme,
            role: "presentation",
            onClick: closeConfirmDialog
          },
          h(
            "div",
            {
              class: "fab-button-confirm",
              role: "dialog",
              "aria-modal": "true",
              "aria-label": pendingConfirm.value.title,
              onClick: (event: MouseEvent) => {
                event.stopPropagation()
              }
            },
            [
              h("h3", { class: "fab-button-confirm__title" }, pendingConfirm.value.title),
              pendingConfirm.value.description
                ? h("p", { class: "fab-button-confirm__description" }, pendingConfirm.value.description)
                : null,
              h("div", { class: "fab-button-confirm__actions" }, [
                h(
                  "button",
                  {
                    type: "button",
                    class: "fab-button-confirm__button fab-button-confirm__button--cancel",
                    onClick: closeConfirmDialog
                  },
                  pendingConfirm.value.cancelText
                ),
                h(
                  "button",
                  {
                    type: "button",
                    class: "fab-button-confirm__button fab-button-confirm__button--confirm",
                    onClick: proceedConfirmedSectionAction
                  },
                  pendingConfirm.value.confirmText
                )
              ])
            ]
          )
        )

        return h(Fragment, [rootNode, confirmDialogNode])
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
        : normalizedSections.value.map((section) => {
            const sectionShortcutHint = getSectionShortcutHint(section)
            return h(
              "span",
              {
                key: section.key,
                class:
                  props.unstyled
                    ? section.className
                    : getSectionClasses({ ...section, theme: resolvedTheme }),
                style: section.style,
                "data-section": section.key,
                "data-shortcut": toShortcutDataAttribute(section.shortcut),
                "data-shortcut-id": toShortcutIdDataAttribute(section.shortcutId),
                "data-shortcut-hint": sectionShortcutHint ?? undefined,
                "aria-label": section.ariaLabel
              },
              [
                resolveSectionContent(section.content),
                !props.unstyled && sectionShortcutHint
                  ? h(
                      "span",
                      {
                        class: "fab-button__shortcut-hint",
                        "aria-hidden": "true"
                      },
                      sectionShortcutHint
                    )
                  : null
              ]
            )
          })

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
