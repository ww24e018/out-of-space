import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { defineComponent, ref } from 'vue'
import { useScanStore } from '@/stores/scan'
import { useKeyboardNavigation } from '@/composables/useKeyboardNavigation'
import type { FileNode } from '@shared/types'

// Minimal wrapper component that activates the composable
function createWrapper(viewRootNode: FileNode | null) {
  const viewRoot = ref<FileNode | null>(viewRootNode)
  const Wrapper = defineComponent({
    setup() {
      useKeyboardNavigation(viewRoot)
      return () => null
    }
  })
  const wrapper = mount(Wrapper)
  return { wrapper, viewRoot }
}

function press(key: string): void {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
}

// Test tree:
//   root (dir, 300)
//   ├── big (dir, 200)
//   │   ├── big-child-a (file, 120)
//   │   └── big-child-b (file, 80)
//   ├── medium (file, 70)
//   └── small (file, 30)
function makeTree(): FileNode {
  return {
    name: 'root',
    path: '/root',
    size: 300,
    type: 'directory',
    children: [
      {
        name: 'big',
        path: '/root/big',
        size: 200,
        type: 'directory',
        children: [
          { name: 'big-child-a', path: '/root/big/big-child-a', size: 120, type: 'file' },
          { name: 'big-child-b', path: '/root/big/big-child-b', size: 80, type: 'file' }
        ]
      },
      { name: 'medium', path: '/root/medium', size: 70, type: 'file' },
      { name: 'small', path: '/root/small', size: 30, type: 'file' }
    ]
  }
}

describe('useKeyboardNavigation', () => {
  let tree: FileNode
  let store: ReturnType<typeof useScanStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useScanStore()
    tree = makeTree()
  })

  it('selects viewRoot when no selection and any arrow is pressed', () => {
    createWrapper(tree)
    expect(store.selectedNode).toBeNull()
    press('ArrowDown')
    expect(store.selectedNode?.path).toBe('/root')
  })

  it('selects viewRoot on ArrowUp when no selection', () => {
    createWrapper(tree)
    press('ArrowUp')
    expect(store.selectedNode?.path).toBe('/root')
  })

  it('selects viewRoot on ArrowLeft when no selection', () => {
    createWrapper(tree)
    press('ArrowLeft')
    expect(store.selectedNode?.path).toBe('/root')
  })

  it('selects viewRoot on ArrowRight when no selection', () => {
    createWrapper(tree)
    press('ArrowRight')
    expect(store.selectedNode?.path).toBe('/root')
  })

  describe('ArrowUp', () => {
    it('selects parent', () => {
      store.selectNode(tree.children![0].children![0]) // big-child-a
      createWrapper(tree)
      press('ArrowUp')
      expect(store.selectedNode?.path).toBe('/root/big')
    })

    it('is no-op at viewRoot', () => {
      store.selectNode(tree)
      createWrapper(tree)
      press('ArrowUp')
      expect(store.selectedNode?.path).toBe('/root')
    })
  })

  describe('ArrowDown', () => {
    it('selects largest child of directory', () => {
      store.selectNode(tree.children![0]) // big (children: 120, 80)
      createWrapper(tree)
      press('ArrowDown')
      expect(store.selectedNode?.path).toBe('/root/big/big-child-a') // 120 = largest
    })

    it('selects largest child from root', () => {
      store.selectNode(tree)
      createWrapper(tree)
      press('ArrowDown')
      expect(store.selectedNode?.path).toBe('/root/big') // 200 = largest
    })

    it('is no-op on file', () => {
      store.selectNode(tree.children![1]) // medium (file)
      createWrapper(tree)
      press('ArrowDown')
      expect(store.selectedNode?.path).toBe('/root/medium')
    })

    it('is no-op on empty directory', () => {
      const emptyDir: FileNode = {
        name: 'empty',
        path: '/root/empty',
        size: 0,
        type: 'directory',
        children: []
      }
      tree.children!.push(emptyDir)
      store.selectNode(emptyDir)
      createWrapper(tree)
      press('ArrowDown')
      expect(store.selectedNode?.path).toBe('/root/empty')
    })
  })

  describe('ArrowRight', () => {
    it('selects next sibling by size', () => {
      store.selectNode(tree.children![0]) // big (200)
      createWrapper(tree)
      press('ArrowRight')
      expect(store.selectedNode?.path).toBe('/root/medium') // 70 = next by size
    })

    it('wraps from last to first', () => {
      store.selectNode(tree.children![2]) // small (30) = last by size
      createWrapper(tree)
      press('ArrowRight')
      expect(store.selectedNode?.path).toBe('/root/big') // wraps to first (200)
    })

    it('is no-op at viewRoot', () => {
      store.selectNode(tree)
      createWrapper(tree)
      press('ArrowRight')
      expect(store.selectedNode?.path).toBe('/root')
    })
  })

  describe('ArrowLeft', () => {
    it('selects previous sibling by size', () => {
      store.selectNode(tree.children![1]) // medium (70)
      createWrapper(tree)
      press('ArrowLeft')
      expect(store.selectedNode?.path).toBe('/root/big') // 200 = previous by size
    })

    it('wraps from first to last', () => {
      store.selectNode(tree.children![0]) // big (200) = first by size
      createWrapper(tree)
      press('ArrowLeft')
      expect(store.selectedNode?.path).toBe('/root/small') // wraps to last (30)
    })
  })

  describe('guards', () => {
    it('does nothing when no viewRoot', () => {
      createWrapper(null)
      press('ArrowDown')
      expect(store.selectedNode).toBeNull()
    })

    it('ignores non-arrow keys', () => {
      store.selectNode(tree)
      createWrapper(tree)
      press('Enter')
      expect(store.selectedNode?.path).toBe('/root')
    })
  })

  describe('multi-level traversal', () => {
    it('navigates down then right then up across multiple levels', () => {
      store.selectNode(tree)
      createWrapper(tree)

      press('ArrowDown') // root → big (largest child)
      expect(store.selectedNode?.path).toBe('/root/big')

      press('ArrowDown') // big → big-child-a (largest child)
      expect(store.selectedNode?.path).toBe('/root/big/big-child-a')

      press('ArrowRight') // big-child-a → big-child-b (next sibling)
      expect(store.selectedNode?.path).toBe('/root/big/big-child-b')

      press('ArrowUp') // big-child-b → big (parent)
      expect(store.selectedNode?.path).toBe('/root/big')

      press('ArrowRight') // big → medium (next sibling of root)
      expect(store.selectedNode?.path).toBe('/root/medium')

      press('ArrowUp') // medium → root (parent)
      expect(store.selectedNode?.path).toBe('/root')
    })
  })
})
