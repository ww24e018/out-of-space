import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import BreadcrumbToolbar from '../../../../src/renderer/src/components/BreadcrumbToolbar.vue'
import { useScanStore } from '../../../../src/renderer/src/stores/scan'
import { buildNavMaps, sortTreeBySize } from '../../../../src/renderer/src/utils/tree'
import type { FileNode } from '../../../../src/shared/types'

const mockApi = {
  selectFolder: vi.fn(),
  scanFolder: vi.fn(),
  showInFinder: vi.fn(),
  openInTerminal: vi.fn(),
  onScanProgress: vi.fn(),
  offScanProgress: vi.fn()
}

function makeTree(): FileNode {
  return {
    name: 'root',
    path: '/Users/test/project',
    size: 300,
    type: 'directory',
    children: [
      {
        name: 'src',
        path: '/Users/test/project/src',
        size: 200,
        type: 'directory',
        children: [
          {
            name: 'components',
            path: '/Users/test/project/src/components',
            size: 100,
            type: 'directory',
            children: [
              { name: 'App.vue', path: '/Users/test/project/src/components/App.vue', size: 100, type: 'file' }
            ]
          }
        ]
      }
    ]
  }
}

describe('BreadcrumbToolbar', () => {
  let tree: FileNode

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal('api', mockApi)
    tree = makeTree()
    sortTreeBySize(tree)
    const store = useScanStore()
    store._setNavMaps(buildNavMaps(tree))
  })

  it('shows "No selection" when selectedNode is null', () => {
    const wrapper = mount(BreadcrumbToolbar, {
      props: {
        selectedNode: null,
        viewRoot: tree,
        canSelectParent: false,
        canDrillIn: false,
        isSelectedDirectory: false
      }
    })
    expect(wrapper.find('.toolbar-empty').text()).toBe('No selection')
    expect(wrapper.findAll('.toolbar-pill')).toHaveLength(0)
  })

  it('shows prefix marker and pill segments for a deep selection', () => {
    const src = tree.children![0]
    const components = src.children![0]
    const file = components.children![0]

    const wrapper = mount(BreadcrumbToolbar, {
      props: {
        selectedNode: file,
        viewRoot: tree,
        canSelectParent: true,
        canDrillIn: false,
        isSelectedDirectory: false
      }
    })
    expect(wrapper.find('.toolbar-prefix').exists()).toBe(true)
    const pills = wrapper.findAll('.toolbar-pill')
    expect(pills).toHaveLength(3)
    expect(pills[0].text()).toBe('src')
    expect(pills[1].text()).toBe('components')
    expect(pills[2].text()).toBe('App.vue')
  })

  it('marks the last pill as current', () => {
    const src = tree.children![0]
    const wrapper = mount(BreadcrumbToolbar, {
      props: {
        selectedNode: src,
        viewRoot: tree,
        canSelectParent: true,
        canDrillIn: true,
        isSelectedDirectory: true
      }
    })
    const pills = wrapper.findAll('.toolbar-pill')
    expect(pills).toHaveLength(1)
    expect(pills[0].classes()).toContain('toolbar-pill--current')
  })

  it('emits select-node when a non-current pill is clicked', async () => {
    const src = tree.children![0]
    const components = src.children![0]

    const wrapper = mount(BreadcrumbToolbar, {
      props: {
        selectedNode: components,
        viewRoot: tree,
        canSelectParent: true,
        canDrillIn: true,
        isSelectedDirectory: true
      }
    })
    const pills = wrapper.findAll('.toolbar-pill')
    await pills[0].trigger('click') // click "src"
    expect(wrapper.emitted('select-node')).toHaveLength(1)
    expect(wrapper.emitted('select-node')![0][0]).toBe(src)
  })

  it('shows action buttons based on props', () => {
    const src = tree.children![0]
    const wrapper = mount(BreadcrumbToolbar, {
      props: {
        selectedNode: src,
        viewRoot: tree,
        canSelectParent: true,
        canDrillIn: true,
        isSelectedDirectory: true
      }
    })
    const buttons = wrapper.findAll('.toolbar-button')
    const labels = buttons.map((b) => b.text())
    expect(labels).toContain('Reveal')
    expect(labels).toContain('Terminal')
    expect(labels).toContain('Drill Into')
    expect(labels).toContain('Select Parent')
  })

  it('hides Terminal and Drill Into for file selections', () => {
    const file = tree.children![0].children![0].children![0]
    const wrapper = mount(BreadcrumbToolbar, {
      props: {
        selectedNode: file,
        viewRoot: tree,
        canSelectParent: true,
        canDrillIn: false,
        isSelectedDirectory: false
      }
    })
    const labels = wrapper.findAll('.toolbar-button').map((b) => b.text())
    expect(labels).toContain('Reveal')
    expect(labels).not.toContain('Terminal')
    expect(labels).not.toContain('Drill Into')
  })
})
