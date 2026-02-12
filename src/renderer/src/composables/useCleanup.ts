import { type Ref, ref, onUnmounted } from 'vue'
import type { CleanItem, CleanStatus } from '../types'

export interface UseCleanupReturn {
  cleanItems: Ref<CleanItem[]>
  isRunning: Ref<boolean>
  isComplete: Ref<boolean>
  logs: Ref<string[]>
  freedSpace: Ref<string>
  startCleanup: () => void
}

const CLEAN_ITEMS_DATA: Omit<CleanItem, 'status'>[] = [
  { id: 1, label: '用户临时文件', icon: '📁', detail: '%TEMP%' },
  { id: 2, label: '系统临时文件', icon: '🗂️', detail: 'Windows\\Temp' },
  { id: 3, label: '预读取缓存', icon: '⚡', detail: 'Prefetch' },
  { id: 4, label: '回收站', icon: '🗑️', detail: 'Recycle Bin' },
  { id: 5, label: 'Windows 更新缓存', icon: '🔄', detail: 'SoftwareDistribution' },
  { id: 6, label: '缩略图缓存', icon: '🖼️', detail: 'Thumbcache' },
  { id: 7, label: 'Windows 日志', icon: '📋', detail: 'CBS/DISM Logs' },
  { id: 8, label: 'Windows 错误报告', icon: '⚠️', detail: 'WER Reports' },
  { id: 9, label: '字体缓存', icon: '🔤', detail: 'FontCache' },
  { id: 10, label: 'Edge 浏览器缓存', icon: '🌐', detail: 'Edge Cache' },
  { id: 11, label: 'Windows.old', icon: '💾', detail: '旧系统文件' },
  { id: 12, label: 'DNS 缓存', icon: '🔗', detail: 'DNS Resolver' }
]

const ITEM_KEYWORDS: Record<number, string[]> = {
  1: ['用户临时文件', 'TEMP'],
  2: ['系统临时文件', 'Windows\\Temp'],
  3: ['预读取缓存', 'Prefetch'],
  4: ['回收站'],
  5: ['Windows 更新缓存', '更新缓存'],
  6: ['缩略图缓存'],
  7: ['Windows 日志', '日志文件'],
  8: ['Windows 错误报告', '错误报告'],
  9: ['字体缓存'],
  10: ['Edge 浏览器缓存', 'Edge'],
  11: ['Windows.old'],
  12: ['DNS 缓存', 'DNS']
}

export function useCleanup(): UseCleanupReturn {
  const cleanItems = ref<CleanItem[]>(
    CLEAN_ITEMS_DATA.map((item) => ({ ...item, status: 'pending' as CleanStatus }))
  )
  const isRunning = ref(false)
  const isComplete = ref(false)
  const logs = ref<string[]>([])
  const freedSpace = ref('')

  let removeOutputListener: (() => void) | null = null
  let removeCompleteListener: (() => void) | null = null

  function cleanupListeners(): void {
    removeOutputListener?.()
    removeCompleteListener?.()
    removeOutputListener = null
    removeCompleteListener = null
  }

  function updateItemStatus(text: string, status: CleanStatus): void {
    for (const [id, kws] of Object.entries(ITEM_KEYWORDS)) {
      if (kws.some((kw) => text.includes(kw))) {
        const item = cleanItems.value.find((i) => i.id === Number(id))
        if (item) item.status = status
        break
      }
    }
  }

  function parseOutput(line: string): void {
    logs.value.push(line)

    const okMatch = line.match(/\[OK\]\s+(.+?)(?:\s+-|$)/)
    const skipMatch = line.match(/\[--\]\s+(.+?)(?:\s+-|$)/)
    const warnMatch = line.match(/\[!!\]\s+(.+?)(?:\s+-|$)/)

    if (okMatch) {
      updateItemStatus(okMatch[1], 'success')
    } else if (skipMatch) {
      updateItemStatus(skipMatch[1], 'skipped')
    } else if (warnMatch) {
      updateItemStatus(warnMatch[1], 'warning')
    }

    const freedMatch = line.match(/共释放约\s+([\d.]+)\s+MB/)
    if (freedMatch) {
      freedSpace.value = freedMatch[1] + ' MB'
    }
  }

  function startCleanup(): void {
    if (isRunning.value) return

    cleanupListeners()

    isRunning.value = true
    isComplete.value = false
    freedSpace.value = ''
    logs.value = []
    cleanItems.value.forEach((item) => (item.status = 'running'))

    removeOutputListener = window.api.onCleanupOutput((_event: unknown, line: string) => {
      parseOutput(line)
    })

    removeCompleteListener = window.api.onCleanupComplete(
      (_event: unknown, data: { code: number }) => {
        cleanupListeners()
        isRunning.value = false
        isComplete.value = true
        cleanItems.value.forEach((item) => {
          if (item.status === 'running') item.status = 'success'
        })
        if (data.code !== 0) {
          logs.value.push(`\n[进程退出码: ${data.code}]`)
        }
      }
    )

    window.api.startCleanup()
  }

  onUnmounted(() => {
    cleanupListeners()
  })

  return {
    cleanItems,
    isRunning,
    isComplete,
    logs,
    freedSpace,
    startCleanup
  }
}
