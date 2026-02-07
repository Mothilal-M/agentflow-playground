# Thread Settings Integration

## Overview

The Thread Settings dialog has been fully integrated with the Redux store and API calls. All settings configured in the dialog are now properly passed to the invoke/stream API endpoints.

## Key Changes

### 1. **API Integration** (`src/services/api/graph.api.js`)

#### Invoke API
- Now properly passes `thread_id` and `thread_name` through the config parameter
- Returns the full response including `meta`, `context`, `state`, and `summary`
- Meta includes: `is_new_thread`, `thread_id`, `thread_name`

#### Stream API
- Passes `thread_id` and `thread_name` through config
- Yields metadata with each chunk for thread tracking
- Properly handles thread ID updates during streaming

### 2. **Redux Store Updates**

#### Thread Settings Slice (`src/services/store/slices/threadSettings.slice.js`)
Added:
- `setContextMetadata`: Updates context information (messages count and tokens)
- Context fields: `context_total_messages`, `context_total_tokens`

#### Chat Slice (`src/services/store/slices/chat.slice.js`)
Enhanced:
- `handleInvokeResponse`: Captures thread_id, thread_name, and context from API response
- `handleStreamDelta`: Captures metadata from streaming chunks
- Both functions now update thread settings automatically when meta data is received

### 3. **Thread Settings Dialog** (`src/components/layout/sheets/ThreadSettingsSheet.jsx`)

The dialog displays and manages:

#### Editable Fields (Passed to API)
1. **Thread ID**: Unique identifier for the thread
2. **Thread Title/Name**: Display name for the conversation
3. **Streaming Response**: Enable/disable streaming mode
4. **Response Granularity**: Control verbosity (full/partial/low)
5. **Include Raw**: Include raw data in responses
6. **Recursion Limit**: Maximum recursion depth (default: 25)
7. **Config**: JSON configuration object passed to API
8. **Initial State**: JSON state object to override main state

#### Read-Only Statistics
- **Context Details**: Messages and tokens in current context
- **Total Statistics**: Token count, tool calls, user messages, AI messages

## API Flow

### Initial Thread Creation

1. User creates a new thread (temporary client-side ID)
2. Thread settings start with:
   - `thread_id`: null or empty
   - `thread_title`: "New Chat"
   - Other defaults from slice

3. First API call (invoke/stream):
   ```javascript
   {
     messages: [...],
     initial_state: {},
     config: {},
     recursion_limit: 25,
     response_granularity: "low",
     thread_id: null,  // or empty string
     thread_name: null // or empty string
   }
   ```

4. API Response:
   ```json
   {
     "data": {
       "messages": [...],
       "state": null,
       "context": [...],
       "summary": null,
       "meta": {
         "is_new_thread": true,
         "thread_id": "30e60d5c-971b-4954-b2ff-dafb67f7799a",
         "thread_name": "MyCustomThreadName"
       }
     },
     "metadata": {
       "request_id": "...",
       "timestamp": "...",
       "message": "OK"
     }
   }
   ```

5. Redux automatically updates:
   - Thread ID from temporary to actual UUID
   - Thread title/name
   - Context metadata (messages count, tokens)

### Subsequent API Calls

For subsequent calls on the same thread:
```javascript
{
  messages: [...],
  initial_state: {},
  config: {},
  recursion_limit: 25,
  response_granularity: "low",
  thread_id: "30e60d5c-971b-4954-b2ff-dafb67f7799a",
  thread_name: "MyCustomThreadName"
}
```

The API will:
- Use the provided thread_id to maintain conversation continuity
- Return updated context and metadata
- Preserve thread_name across calls

## Usage Notes

### When to Set Thread ID/Name

1. **New Thread** (Recommended):
   - Leave `thread_id` empty/null
   - Optionally set `thread_name`
   - Backend generates UUID and returns it

2. **Existing Thread**:
   - Set `thread_id` to the UUID from previous responses
   - Keep `thread_name` consistent or update as needed

3. **Custom Thread Management**:
   - Set both `thread_id` (your UUID) and `thread_name`
   - Useful for resuming conversations or custom threading logic

### Config Field

The `config` field is a JSON object that can include:
- LLM configuration (temperature, max_tokens, etc.)
- Custom parameters for your agent
- `thread_id` and `thread_name` (automatically added)

Example:
```json
{
  "temperature": 0.7,
  "max_tokens": 1000,
  "custom_field": "value"
}
```

### Initial State Field

The `initial_state` field allows you to:
- Override the main agent state
- Control which node executes next
- Pass fresh data for specific state fields

**⚠️ Use with caution**: Only use when you need to control graph execution flow.

## Token Calculation

The UI estimates tokens using: **750 words ≈ 1K tokens**

This is a rough approximation. For accurate token counts, use the `include_raw` option to get actual usage data from the LLM provider.

## Automatic Updates

The system automatically:
1. ✅ Captures thread_id from API responses
2. ✅ Updates thread title from thread_name
3. ✅ Tracks context size (messages + tokens)
4. ✅ Passes settings to subsequent API calls
5. ✅ Handles thread ID transitions (temporary → UUID)

## Testing Checklist

- [x] Thread ID captured from invoke response
- [x] Thread ID captured from stream response
- [x] Thread name updates correctly
- [x] Context metadata displays properly
- [x] Settings persist across API calls
- [x] Initial state overrides work
- [x] Config merging works correctly
- [x] Response granularity affects output
- [x] Include raw data option works
- [x] Streaming toggle works
- [x] Recursion limit is respected

## Future Enhancements

1. Add token usage tracking from response metadata
2. Display per-message token counts
3. Add validation for config/initial_state JSON
4. Show API response time statistics
5. Add thread history/versioning
6. Export/import thread settings

## Related Files

- `src/services/api/graph.api.js` - API integration
- `src/services/store/slices/threadSettings.slice.js` - Settings state
- `src/services/store/slices/chat.slice.js` - Chat state and API calls
- `src/components/layout/sheets/ThreadSettingsSheet.jsx` - UI component
- `src/lib/agentflowClient.js` - AgentFlow client wrapper

