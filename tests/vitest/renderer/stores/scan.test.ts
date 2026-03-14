import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useScanStore } from '@/stores/scan'
import type { FileNode } from '@shared/types'

const mockApi = {
  selectFolder: vi.fn(),
  scanFolder: vi.fn(),
  showInFinder: vi.fn(),
  openInTerminal: vi.fn(),
  onScanProgress: vi.fn(),
  offScanProgress: vi.fn()
}

describe('useScanStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal('api', mockApi)
    vi.resetAllMocks()
  })

  it('starts with null rootNode and no error', () => {
    const store = useScanStore()
    expect(store.rootNode).toBeNull()
    expect(store.isScanning).toBe(false)
    expect(store.error).toBeNull()
  })

  it('sets rootNode on successful scan', async () => {
    const fakeTree: FileNode = {
      name: 'project',
      path: '/tmp/project',
      size: 1024,
      type: 'directory',
      children: []
    }
    mockApi.scanFolder.mockResolvedValue(fakeTree)

    const store = useScanStore()
    await store.scan('/tmp/project')

    expect(store.rootNode).toEqual(fakeTree)
    expect(store.isScanning).toBe(false)
    expect(store.error).toBeNull()
    expect(mockApi.scanFolder).toHaveBeenCalledWith('/tmp/project')
  })

  it('sets isScanning during scan', async () => {
    let resolvePromise!: (value: FileNode) => void
    mockApi.scanFolder.mockReturnValue(
      new Promise<FileNode>((resolve) => {
        resolvePromise = resolve
      })
    )

    const store = useScanStore()
    const scanPromise = store.scan('/tmp/test')

    expect(store.isScanning).toBe(true)

    resolvePromise({
      name: 'test',
      path: '/tmp/test',
      size: 0,
      type: 'directory',
      children: []
    })
    await scanPromise

    expect(store.isScanning).toBe(false)
  })

  it('captures error on scan failure', async () => {
    mockApi.scanFolder.mockRejectedValue(new Error('Permission denied'))

    const store = useScanStore()
    await store.scan('/tmp/forbidden')

    expect(store.error).toBe('Permission denied')
    expect(store.rootNode).toBeNull()
    expect(store.isScanning).toBe(false)
  })

  it('captures non-Error thrown values as strings', async () => {
    mockApi.scanFolder.mockRejectedValue('raw string error')

    const store = useScanStore()
    await store.scan('/tmp/oops')

    expect(store.error).toBe('raw string error')
  })

  it('does nothing when user cancels folder selection', async () => {
    mockApi.selectFolder.mockResolvedValue(null)

    const store = useScanStore()
    await store.selectAndScan()

    expect(mockApi.scanFolder).not.toHaveBeenCalled()
    expect(store.rootNode).toBeNull()
  })

  it('scans selected folder when user confirms', async () => {
    mockApi.selectFolder.mockResolvedValue('/Users/test/folder')
    mockApi.scanFolder.mockResolvedValue({
      name: 'folder',
      path: '/Users/test/folder',
      size: 512,
      type: 'directory'
    })

    const store = useScanStore()
    await store.selectAndScan()

    expect(mockApi.scanFolder).toHaveBeenCalledWith('/Users/test/folder')
    expect(store.rootNode).not.toBeNull()
  })

  it('registers progress listener during scan and cleans up after', async () => {
    mockApi.scanFolder.mockResolvedValue({
      name: 'test',
      path: '/tmp/test',
      size: 0,
      type: 'directory',
      children: []
    })

    const store = useScanStore()
    await store.scan('/tmp/test')

    expect(mockApi.onScanProgress).toHaveBeenCalledTimes(1)
    expect(mockApi.offScanProgress).toHaveBeenCalledTimes(1)
  })

  it('updates scanProgress when progress callback is invoked', async () => {
    let resolvePromise!: (value: FileNode) => void
    mockApi.scanFolder.mockReturnValue(
      new Promise<FileNode>((resolve) => {
        resolvePromise = resolve
      })
    )
    mockApi.onScanProgress.mockImplementation((callback) => {
      // Simulate a progress update
      callback({ filesScanned: 42, currentPath: '/tmp/test/foo.txt' })
    })

    const store = useScanStore()
    const scanPromise = store.scan('/tmp/test')

    expect(store.scanProgress).toEqual({ filesScanned: 42, currentPath: '/tmp/test/foo.txt' })

    resolvePromise({
      name: 'test',
      path: '/tmp/test',
      size: 0,
      type: 'directory',
      children: []
    })
    await scanPromise

    // Cleared after scan completes
    expect(store.scanProgress).toBeNull()
  })

  it('cleans up progress listener on scan failure', async () => {
    mockApi.scanFolder.mockRejectedValue(new Error('fail'))

    const store = useScanStore()
    await store.scan('/tmp/test')

    expect(mockApi.offScanProgress).toHaveBeenCalledTimes(1)
    expect(store.scanProgress).toBeNull()
  })

  it('sets and clears selectedNode', () => {
    const store = useScanStore()
    const node: FileNode = { name: 'a.txt', path: '/a.txt', size: 100, type: 'file' }

    store.selectNode(node)
    expect(store.selectedNode).toEqual(node)

    store.selectNode(null)
    expect(store.selectedNode).toBeNull()
  })

  it('builds nav maps after scan so parentOf works', async () => {
    const child: FileNode = { name: 'file.txt', path: '/tmp/project/file.txt', size: 512, type: 'file' }
    const fakeTree: FileNode = {
      name: 'project',
      path: '/tmp/project',
      size: 512,
      type: 'directory',
      children: [child]
    }
    mockApi.scanFolder.mockResolvedValue(fakeTree)

    const store = useScanStore()
    await store.scan('/tmp/project')

    // The child object from the resolved tree should be in the nav maps
    const scannedChild = store.rootNode!.children![0]
    expect(store.parentOf(scannedChild)).toStrictEqual(store.rootNode)
  })

  it('parentOf returns null when no maps are built', () => {
    const store = useScanStore()
    const node: FileNode = { name: 'a.txt', path: '/a.txt', size: 100, type: 'file' }
    expect(store.parentOf(node)).toBeNull()
  })
})
