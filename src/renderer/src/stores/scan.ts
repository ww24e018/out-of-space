import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { FileNode } from '@shared/types'

export const useScanStore = defineStore('scan', () => {
  const rootNode = ref<FileNode | null>(null)
  const isScanning = ref(false)
  const selectedNode = ref<FileNode | null>(null)
  const error = ref<string | null>(null)

  async function selectAndScan(): Promise<void> {
    const folderPath = await window.api.selectFolder()
    if (!folderPath) return
    await scan(folderPath)
  }

  async function scan(folderPath: string): Promise<void> {
    isScanning.value = true
    error.value = null
    try {
      rootNode.value = await window.api.scanFolder(folderPath)
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      isScanning.value = false
    }
  }

  function selectNode(node: FileNode | null): void {
    selectedNode.value = node
  }

  return { rootNode, isScanning, selectedNode, error, selectAndScan, scan, selectNode }
})
