import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtemp, rm, mkdir, writeFile, symlink, chmod } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { scanDirectory } from '../../../src/main/scanner'

const isWindows = process.platform === 'win32'

describe('scanDirectory', () => {
  let tmp: string

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), 'oos-test-'))
  })

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true })
  })

  it('scans a single file', async () => {
    const content = Buffer.alloc(100, 'x')
    await writeFile(join(tmp, 'a.txt'), content)

    const result = await scanDirectory(tmp)

    expect(result.type).toBe('directory')
    expect(result.size).toBe(100)
    expect(result.children).toHaveLength(1)
    expect(result.children![0]).toMatchObject({
      name: 'a.txt',
      type: 'file',
      size: 100
    })
  })

  it('scans nested directories with size bubbling up', async () => {
    await mkdir(join(tmp, 'sub', 'deep'), { recursive: true })
    await writeFile(join(tmp, 'sub', 'deep', 'file.txt'), Buffer.alloc(200, 'x'))

    const result = await scanDirectory(tmp)

    expect(result.size).toBe(200)
    const sub = result.children!.find((c) => c.name === 'sub')!
    expect(sub.size).toBe(200)
    expect(sub.type).toBe('directory')
    const deep = sub.children!.find((c) => c.name === 'deep')!
    expect(deep.size).toBe(200)
    expect(deep.children![0].name).toBe('file.txt')
  })

  it('handles empty directories', async () => {
    await mkdir(join(tmp, 'empty'))

    const result = await scanDirectory(tmp)

    const empty = result.children!.find((c) => c.name === 'empty')!
    expect(empty.type).toBe('directory')
    expect(empty.size).toBe(0)
    expect(empty.children).toEqual([])
  })

  it('aggregates sizes from multiple files', async () => {
    await writeFile(join(tmp, 'a.txt'), Buffer.alloc(50, 'x'))
    await writeFile(join(tmp, 'b.txt'), Buffer.alloc(30, 'x'))

    const result = await scanDirectory(tmp)

    expect(result.size).toBe(80)
    expect(result.children).toHaveLength(2)
  })

  it.skipIf(isWindows)('skips unreadable directories gracefully', async () => {
    await mkdir(join(tmp, 'secret'))
    await writeFile(join(tmp, 'secret', 'hidden.txt'), Buffer.alloc(10, 'x'))
    await chmod(join(tmp, 'secret'), 0o000)

    const result = await scanDirectory(tmp)

    const secret = result.children!.find((c) => c.name === 'secret')!
    expect(secret.type).toBe('directory')
    expect(secret.size).toBe(0)
    expect(secret.children).toEqual([])

    // Restore permissions so afterEach cleanup works
    await chmod(join(tmp, 'secret'), 0o755)
  })

  it.skipIf(isWindows)('skips symlinks', async () => {
    await writeFile(join(tmp, 'real.txt'), Buffer.alloc(40, 'x'))
    await symlink(join(tmp, 'real.txt'), join(tmp, 'link.txt'))

    const result = await scanDirectory(tmp)

    const names = result.children!.map((c) => c.name)
    expect(names).toContain('real.txt')
    expect(names).not.toContain('link.txt')
    expect(result.size).toBe(40)
  })
})
