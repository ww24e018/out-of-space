import { defineStore } from 'pinia'
import { ref, toRaw } from 'vue'
import type { FileNode, ScanProgress } from '@shared/types'
import { sortTreeBySize, buildNavMaps } from '@/utils/tree'
import type { NavMaps } from '@/utils/tree'

let navMaps: NavMaps | null = null

export const useScanStore = defineStore('scan', () => {
  const rootNode = ref<FileNode | null>(null)
  const isScanning = ref(false)
  const selectedNode = ref<FileNode | null>(null)
  const error = ref<string | null>(null)
  const scanProgress = ref<ScanProgress | null>(null)

  async function selectAndScan(): Promise<void> {
    const folderPath = await window.api.selectFolder()
    if (!folderPath) return
    await scan(folderPath)
  }

  async function scan(folderPath: string): Promise<void> {
    isScanning.value = true
    error.value = null
    selectedNode.value = null
    scanProgress.value = null

    window.api.onScanProgress((progress) => {
      scanProgress.value = progress
    })

    try {
      const tree = await window.api.scanFolder(folderPath)
      sortTreeBySize(tree)
      navMaps = buildNavMaps(tree)
      rootNode.value = tree
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      window.api.offScanProgress()
      scanProgress.value = null
      isScanning.value = false
    }
  }

  function selectNode(node: FileNode | null): void {
    selectedNode.value = node
  }

  function parentOf(node: FileNode): FileNode | null {
    return navMaps?.parent.get(toRaw(node)) ?? null
  }

  function nextSiblingOf(node: FileNode): FileNode | null {
    return navMaps?.nextSibling.get(toRaw(node)) ?? null
  }

  function prevSiblingOf(node: FileNode): FileNode | null {
    return navMaps?.prevSibling.get(toRaw(node)) ?? null
  }

  /** @internal Test helper — inject nav maps for trees not created via scan() */
  function _setNavMaps(maps: NavMaps | null): void {
    navMaps = maps
  }

  return {
    rootNode,
    isScanning,
    selectedNode,
    error,
    scanProgress,
    selectAndScan,
    scan,
    selectNode,
    parentOf,
    nextSiblingOf,
    prevSiblingOf,
    _setNavMaps
  }
})
