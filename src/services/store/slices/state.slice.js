import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

import { fetchStateSchema, fetchState, putState } from "@api/state.api"
import ct from "@constants/"

// list of messages
// message example
// { message_id: 1, content: "Hello, world!", role: "user"}
const initialState = {
  isLoading: false,
  isSaving: false,
  error: null,
  state: {
    context: [],
    context_summary: "",
    execution_meta: {
      current_node: "",
      step: 0,
      status: "idle",
      interrupted_node: [],
      interrupt_reason: "",
      interrupt_data: [],
      thread_id: "",
      internal_data: {},
    },
  },
}

export const fetchStateScheme = createAsyncThunk(
  "state/fetchStateScheme",
  async (_, { rejectWithValue }) => {
    try {
      const result = await fetchStateSchema()
      return result
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchThreadState = createAsyncThunk(
  "state/fetchThreadState",
  async (threadId, { rejectWithValue }) => {
    try {
      if (!threadId) {
        throw new Error("Thread ID is required")
      }
      const result = await fetchState(threadId)
      return result
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch thread state")
    }
  }
)

export const updateThreadState = createAsyncThunk(
  "state/updateThreadState",
  async ({ threadId, state, config }, { rejectWithValue }) => {
    try {
      if (!threadId) {
        throw new Error("Thread ID is required")
      }
      const result = await putState(threadId, { state, config })
      return result
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update thread state")
    }
  }
)

const stateSlice = createSlice({
  name: ct.store.STATE_STORE,
  initialState,
  reducers: {
    updateState: (state, action) => {
      const { context, contextSummary, execution_meta } = action.payload
      state.context = context || state.context
      state.contextSummary = contextSummary || state.contextSummary
      state.execution_meta = execution_meta || state.execution_meta
    },
    updateFullState: (state, action) => {
      state.state = { ...state.state, ...action.payload }
    },
    clearSettings: (state) => {
      state.context = []
      state.contextSummary = ""
      state.execution_meta = initialState.execution_meta
      state.isBackendConfigured = false
    },
    addNewMessage: (state, action) => {
      const { message } = action.payload
      state.context.push(message)
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch state schema
      .addCase(fetchStateScheme.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchStateScheme.fulfilled, (state, action) => {
        // this api will return current state schema, which we can use to update our state
        // state.state = action.payload
        const { data } = action.payload.data
        // reset state
        // state.state = initialState.state
        // if data has properties

        // get properties from data properties
        const properties = data.properties || {}
        // check except context, context_summary and execution_meta
        // what are available add those in the state
        Object.keys(properties).forEach((key) => {
          if (!["context", "context_summary", "execution_meta"].includes(key)) {
            state.state[key] = properties[key]
          }
        })
        state.isLoading = false
      })
      .addCase(fetchStateScheme.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || "Fetch failed"
      })
      // Fetch thread state
      .addCase(fetchThreadState.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchThreadState.fulfilled, (state, action) => {
        const { data } = action.payload
        if (data && typeof data === "object") {
          // Merge fetched state with existing state
          state.state = {
            ...state.state,
            ...data,
          }
        }
        state.isLoading = false
      })
      .addCase(fetchThreadState.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || "Failed to fetch thread state"
      })
      // Update thread state
      .addCase(updateThreadState.pending, (state) => {
        state.isSaving = true
        state.error = null
      })
      .addCase(updateThreadState.fulfilled, (state, action) => {
        state.isSaving = false
        // Optionally update local state with server response
        const { data } = action.payload
        if (data && typeof data === "object") {
          state.state = {
            ...state.state,
            ...data,
          }
        }
      })
      .addCase(updateThreadState.rejected, (state, action) => {
        state.isSaving = false
        state.error = action.payload || "Failed to update thread state"
      })
  },
})

export const { updateState, updateFullState, clearSettings, addNewMessage } =
  stateSlice.actions
export default stateSlice.reducer
