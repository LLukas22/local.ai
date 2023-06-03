import { useCallback, useState } from "react"

import { useInit } from "~features/inference-server/use-init"
import type {
  DirectoryState,
  FileInfo
} from "~features/model-downloader/model-file"

export const useThreadsDirectory = () => {
  const [threadsDirectory, setThreadsDirectory] = useState("")
  const [threads, setThreads] = useState<FileInfo[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  useInit(async () => {
    // get the models directory saved in config
    const { invoke } = await import("@tauri-apps/api/tauri")
    const resp = await invoke<DirectoryState>("initialize_threads_dir")
    if (!resp) {
      return
    }
    setThreadsDirectory(resp.path)
    setThreads(resp.files)
  })

  const updateThreadsDirectory = useCallback(
    async (dir = threadsDirectory) => {
      setIsRefreshing(true)
      const { invoke } = await import("@tauri-apps/api/tauri")
      const resp = await invoke<DirectoryState>("update_threads_dir", {
        dir
      })
      setThreadsDirectory(resp.path)
      setThreads(resp.files)
      setIsRefreshing(false)
      return resp
    },
    [threadsDirectory]
  )

  const removeThread = useCallback(async (thread: FileInfo) => {
    const { invoke } = await import("@tauri-apps/api/tauri")
    await invoke<DirectoryState>("delete_thread_file", {
      path: thread.path
    })
  }, [])

  const renameThread = useCallback(
    async (thread: FileInfo, newName: string) => {
      const { invoke } = await import("@tauri-apps/api/tauri")
      return invoke<string>("rename_thread_file", {
        path: thread.path,
        newName
      })
    },
    []
  )

  const createThread = useCallback(async () => {
    const { invoke } = await import("@tauri-apps/api/tauri")
    return invoke<string>("create_thread_file")
  }, [])

  return {
    threads,
    threadsDirectory,
    isRefreshing,
    updateThreadsDirectory,
    removeThread,
    createThread,
    renameThread
  }
}
