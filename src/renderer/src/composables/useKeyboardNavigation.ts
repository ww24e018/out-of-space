import { onMounted, onUnmounted, type Ref } from 'vue'
import { useScanStore } from '@/stores/scan'
import type { FileNode } from '@shared/types'

export interface KeyboardNavigationOptions {
  viewRoot: Ref<FileNode | null>
  onDrillDown?: () => void
  onDrillUp?: () => void
}

export function useKeyboardNavigation(options: KeyboardNavigationOptions): void {
  const scanStore = useScanStore()

  function onKeydown(e: KeyboardEvent): void {
    const tag = document.activeElement?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
    if ((document.activeElement as HTMLElement)?.isContentEditable) return

    if (!options.viewRoot.value) return

    const isArrow =
      e.key === 'ArrowUp' ||
      e.key === 'ArrowDown' ||
      e.key === 'ArrowLeft' ||
      e.key === 'ArrowRight'

    if (!isArrow) return

    e.preventDefault()

    const modifier = e.metaKey || e.ctrlKey

    if (modifier && e.key === 'ArrowUp') {
      options.onDrillUp?.()
      return
    }
    if (modifier && e.key === 'ArrowDown') {
      options.onDrillDown?.()
      return
    }

    if (modifier) return

    if (!scanStore.selectedNode) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        const children = options.viewRoot.value.children
        scanStore.selectNode(children?.length ? children[0] : options.viewRoot.value)
      } else {
        scanStore.selectNode(options.viewRoot.value)
      }
      return
    }

    switch (e.key) {
      case 'ArrowUp':
        navigateUp()
        break
      case 'ArrowDown':
        navigateDown()
        break
      case 'ArrowLeft':
        navigateSibling(-1)
        break
      case 'ArrowRight':
        navigateSibling(1)
        break
    }
  }

  function navigateUp(): void {
    const selected = scanStore.selectedNode!
    if (selected.path === options.viewRoot.value!.path) return
    const parent = scanStore.parentOf(selected)
    if (parent) scanStore.selectNode(parent)
  }

  function navigateDown(): void {
    const selected = scanStore.selectedNode!
    const children = selected.children
    if (children?.length) {
      scanStore.selectNode(children[0])
    }
  }

  function navigateSibling(direction: -1 | 1): void {
    const selected = scanStore.selectedNode!
    if (selected.path === options.viewRoot.value!.path) return
    const sibling =
      direction === 1 ? scanStore.nextSiblingOf(selected) : scanStore.prevSiblingOf(selected)
    if (sibling && sibling !== selected) scanStore.selectNode(sibling)
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onUnmounted(() => window.removeEventListener('keydown', onKeydown))
}
