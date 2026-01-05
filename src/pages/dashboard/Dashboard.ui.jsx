/* eslint-disable max-lines-per-function */
import { useCallback, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useSearchParams } from "react-router-dom"

import {
  createThread,
  sendMessage as sendMessageThunk,
  setActiveThread,
} from "@/services/store/slices/chat.slice"
import {
  setSettings,
  testPingEndpoint,
  testGraphEndpoint,
} from "@/services/store/slices/settings.slice"
import { fetchStateScheme } from "@/services/store/slices/state.slice"
import ct from "@constants"

import EmptyChatUI from "../chat/component/empty"
import MessageView from "../chat/component/full/MessageView"

const DashboardUI = () => {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const store = useSelector((st) => st[ct.store.SETTINGS_STORE])
  const { threads, activeThreadId } = useSelector(
    (state) => state[ct.store.CHAT_STORE]
  )

  const { verification, backendUrl } = store
  const isVerified = verification?.isVerified ?? false

  // Get backendUrl and threadId from URL query parameters
  const urlBackendUrl = searchParams.get("backendUrl")
  const urlThreadId = searchParams.get("threadId")

  // Auto-verify when backendUrl is provided via URL
  useEffect(() => {
    if (urlBackendUrl && urlBackendUrl !== backendUrl) {
      // Set the backend URL from URL parameter
      dispatch(
        setSettings({
          name: "",
          backendUrl: urlBackendUrl,
          authToken: "",
        })
      )

      // Auto-verify the backend URL
      dispatch(testPingEndpoint())
      dispatch(testGraphEndpoint())
      dispatch(fetchStateScheme())

      // Remove only backendUrl from query parameters, keep threadId if present
      const newParams = new URLSearchParams(searchParams)
      newParams.delete("backendUrl")
      setSearchParams(newParams, { replace: true })
    }
  }, [urlBackendUrl, backendUrl, dispatch, setSearchParams, searchParams])

  // Handle threadId from URL parameter
  useEffect(() => {
    if (urlThreadId && urlThreadId !== activeThreadId) {
      const thread = threads.find((t) => t.id === urlThreadId)
      if (thread) {
        dispatch(setActiveThread(urlThreadId))
        // Remove threadId from URL after setting it
        const newParams = new URLSearchParams(searchParams)
        newParams.delete("threadId")
        setSearchParams(newParams, { replace: true })
      }
    }
  }, [urlThreadId, activeThreadId, threads, dispatch, setSearchParams, searchParams])

  // Find the active thread - prioritize activeThreadId, then URL threadId
  const activeThread = activeThreadId
    ? threads.find((t) => t.id === activeThreadId)
    : urlThreadId
      ? threads.find((t) => t.id === urlThreadId)
      : null

  const handleNewChat = useCallback(() => {
    const id = Date.now().toString()
    dispatch(createThread({ id, title: "New Chat" }))
    dispatch(setActiveThread(id))
  }, [dispatch])

  const handleSendMessage = useCallback(
    async (message) => {
      // If no active thread, create one then send
      if (!activeThread) {
        const newId = Date.now().toString()
        dispatch(
          createThread({ id: newId, title: `${message.slice(0, 50)}...` })
        )
        dispatch(setActiveThread(newId))
        await dispatch(sendMessageThunk(newId, message))
      } else {
        await dispatch(sendMessageThunk(activeThread.id, message))
      }
    },
    [dispatch, activeThread]
  )

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex flex-col h-full">
        {activeThread ? (
          <MessageView thread={activeThread} disabled={!isVerified} />
        ) : (
          <EmptyChatUI
            onNewChat={handleNewChat}
            onSendMessage={handleSendMessage}
            disabled={!isVerified}
          />
        )}
      </div>
    </div>
  )
}

export default DashboardUI
