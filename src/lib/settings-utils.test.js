import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  clearCurrentSettings,
  getCurrentSettings,
  isBackendConfigured,
  saveCurrentSettings,
} from "@/lib/settings-utils"

const SETTINGS_STORAGE_KEY = "pyagenity-settings"

describe("settings-utils", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it("returns false when no backend URL is saved", () => {
    expect(isBackendConfigured()).toBe(false)
  })

  it("detects a configured backend URL", () => {
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ backendUrl: " https://example.com " })
    )

    expect(isBackendConfigured()).toBe(true)
  })

  it("returns default settings when nothing is saved", () => {
    expect(getCurrentSettings()).toEqual({
      name: "",
      backendUrl: "",
      authMode: "none",
      authToken: "",
      auth: null,
      credentials: "",
    })
  })

  it("returns saved settings with empty fallbacks", () => {
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({
        name: "Workspace",
        backendUrl: "https://example.com",
      })
    )

    expect(getCurrentSettings()).toEqual({
      name: "Workspace",
      backendUrl: "https://example.com",
      authMode: "none",
      authToken: "",
      auth: null,
      credentials: "",
    })
  })

  it("normalizes auth-rich settings before saving", () => {
    const saved = saveCurrentSettings({
      name: "Workspace",
      backendUrl: "https://example.com/",
      authMode: "header",
      auth: {
        type: "header",
        name: " X-API-Key ",
        value: " secret-key ",
        prefix: " Token ",
      },
      credentials: "include",
    })

    expect(saved).toEqual({
      name: "Workspace",
      backendUrl: "https://example.com/",
      authMode: "header",
      authToken: "",
      auth: {
        type: "header",
        name: "X-API-Key",
        value: "secret-key",
        prefix: "Token",
      },
      credentials: "include",
    })
    expect(localStorage.getItem("authToken")).toBeNull()
  })

  it("falls back to legacy storage keys", () => {
    localStorage.setItem("backendUrl", "https://example.com")
    localStorage.setItem("authToken", "legacy-token")

    expect(getCurrentSettings()).toEqual({
      name: "",
      backendUrl: "https://example.com",
      authMode: "bearer",
      authToken: "legacy-token",
      auth: {
        type: "bearer",
        token: "legacy-token",
      },
      credentials: "",
    })
  })

  it("handles parse failures safely", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined)

    localStorage.setItem(SETTINGS_STORAGE_KEY, "not-json")

    expect(isBackendConfigured()).toBe(false)
    expect(getCurrentSettings()).toEqual({
      name: "",
      backendUrl: "",
      authMode: "none",
      authToken: "",
      auth: null,
      credentials: "",
    })
    expect(consoleErrorSpy).toHaveBeenCalledTimes(2)
  })

  it("clears saved settings and legacy keys", () => {
    saveCurrentSettings({
      backendUrl: "https://example.com",
      authMode: "bearer",
      authToken: "secret-token",
    })

    clearCurrentSettings()

    expect(localStorage.getItem(SETTINGS_STORAGE_KEY)).toBeNull()
    expect(localStorage.getItem("backendUrl")).toBeNull()
    expect(localStorage.getItem("authToken")).toBeNull()
  })
})
