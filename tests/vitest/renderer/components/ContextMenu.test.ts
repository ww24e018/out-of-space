import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ContextMenu from '../../../../src/renderer/src/components/ContextMenu.vue'
import type { FileNode } from '../../../../src/shared/types'

const fileNode: FileNode = {
  name: 'readme.md',
  path: '/project/readme.md',
  size: 1024,
  type: 'file'
}

const dirNode: FileNode = {
  name: 'src',
  path: '/project/src',
  size: 4096,
  type: 'directory',
  children: []
}

describe('ContextMenu', () => {
  it('shows only "Reveal in File Manager" for file nodes', () => {
    const wrapper = mount(ContextMenu, {
      props: { x: 100, y: 100, node: fileNode }
    })
    const items = wrapper.findAll('.context-item')
    expect(items).toHaveLength(1)
    expect(items[0].text()).toBe('Reveal in File Manager')
  })

  it('shows both actions for directory nodes', () => {
    const wrapper = mount(ContextMenu, {
      props: { x: 100, y: 100, node: dirNode }
    })
    const items = wrapper.findAll('.context-item')
    expect(items).toHaveLength(2)
    expect(items[0].text()).toBe('Reveal in File Manager')
    expect(items[1].text()).toBe('Open Terminal Here')
  })

  it('emits showInFinder when clicked', async () => {
    const wrapper = mount(ContextMenu, {
      props: { x: 100, y: 100, node: fileNode }
    })
    await wrapper.find('.context-item').trigger('click')
    expect(wrapper.emitted('showInFinder')).toHaveLength(1)
  })

  it('emits openInTerminal when clicked', async () => {
    const wrapper = mount(ContextMenu, {
      props: { x: 100, y: 100, node: dirNode }
    })
    const items = wrapper.findAll('.context-item')
    await items[1].trigger('click')
    expect(wrapper.emitted('openInTerminal')).toHaveLength(1)
  })

  it('emits close when backdrop is clicked', async () => {
    const wrapper = mount(ContextMenu, {
      props: { x: 100, y: 100, node: fileNode }
    })
    await wrapper.find('.context-backdrop').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
