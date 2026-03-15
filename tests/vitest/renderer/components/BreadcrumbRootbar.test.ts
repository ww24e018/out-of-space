import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import BreadcrumbRootbar from '../../../../src/renderer/src/components/BreadcrumbRootbar.vue'
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

describe('BreadcrumbRootbar', () => {
  let tree: FileNode

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal('api', mockApi)
    tree = makeTree()
    sortTreeBySize(tree)
    const store = useScanStore()
    store._setNavMaps(buildNavMaps(tree))
  })

  it('shows only the root path when not drilled in', () => {
    const wrapper = mount(BreadcrumbRootbar, {
      props: { viewRoot: tree, rootNode: tree, isScanning: false, isDrilledIn: false }
    })
    expect(wrapper.find('.rootbar-prefix').text()).toBe('/Users/test/project')
    expect(wrapper.findAll('.rootbar-segment')).toHaveLength(0)
  })

  it('shows clickable segments when drilled in', () => {
    const src = tree.children![0]
    const components = src.children![0]
    const wrapper = mount(BreadcrumbRootbar, {
      props: { viewRoot: components, rootNode: tree, isScanning: false, isDrilledIn: true }
    })
    expect(wrapper.find('.rootbar-prefix').text()).toBe('/Users/test/project')
    const segments = wrapper.findAll('.rootbar-segment')
    expect(segments).toHaveLength(2)
    expect(segments[0].text()).toBe('src')
    expect(segments[1].text()).toBe('components')
  })

  it('marks the last segment as current (bold, not clickable)', () => {
    const src = tree.children![0]
    const wrapper = mount(BreadcrumbRootbar, {
      props: { viewRoot: src, rootNode: tree, isScanning: false, isDrilledIn: true }
    })
    const segments = wrapper.findAll('.rootbar-segment')
    expect(segments).toHaveLength(1)
    expect(segments[0].classes()).toContain('rootbar-segment--current')
  })

  it('emits navigate with the correct node when a segment is clicked', async () => {
    const src = tree.children![0]
    const components = src.children![0]
    const wrapper = mount(BreadcrumbRootbar, {
      props: { viewRoot: components, rootNode: tree, isScanning: false, isDrilledIn: true }
    })
    const segments = wrapper.findAll('.rootbar-segment')
    await segments[0].trigger('click') // click "src"
    expect(wrapper.emitted('navigate')).toHaveLength(1)
    expect(wrapper.emitted('navigate')![0][0]).toBe(src)
  })

  it('emits scan-other when Open button is clicked', async () => {
    const wrapper = mount(BreadcrumbRootbar, {
      props: { viewRoot: tree, rootNode: tree, isScanning: false, isDrilledIn: false }
    })
    const buttons = wrapper.findAll('.toolbar-button')
    const openBtn = buttons.find((b) => b.text() === 'Open')!
    await openBtn.trigger('click')
    expect(wrapper.emitted('scan-other')).toHaveLength(1)
  })

  it('emits rescan when Rescan button is clicked', async () => {
    const wrapper = mount(BreadcrumbRootbar, {
      props: { viewRoot: tree, rootNode: tree, isScanning: false, isDrilledIn: false }
    })
    const buttons = wrapper.findAll('.toolbar-button')
    const rescanBtn = buttons.find((b) => b.text() === 'Rescan')!
    await rescanBtn.trigger('click')
    expect(wrapper.emitted('rescan')).toHaveLength(1)
  })

  it('shows Up button only when drilled in', () => {
    const notDrilled = mount(BreadcrumbRootbar, {
      props: { viewRoot: tree, rootNode: tree, isScanning: false, isDrilledIn: false }
    })
    expect(notDrilled.findAll('.toolbar-button').map((b) => b.text())).not.toContain('Up')

    const drilled = mount(BreadcrumbRootbar, {
      props: { viewRoot: tree.children![0], rootNode: tree, isScanning: false, isDrilledIn: true }
    })
    expect(drilled.findAll('.toolbar-button').map((b) => b.text())).toContain('Up')
  })
})
