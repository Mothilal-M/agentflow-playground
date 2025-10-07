import { useState, useEffect } from "react"

/**
 * Custom hook for form data management
 */
// eslint-disable-next-line max-lines-per-function
const useFormData = (stateData) => {
  const [formData, setFormData] = useState({
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
  })

  const getDefaultValue = (type) => {
    switch (type) {
      case "string":
        return ""
      case "number":
        return 0
      case "array":
        return []
      case "object":
        return {}
      case "boolean":
        return false
      default:
        return null
    }
  }

  useEffect(() => {
    if (stateData) {
      const newState = {}
      for (const key in stateData) {
        if (
          key === "context" ||
          key === "execution_meta" ||
          key === "context_summary"
        ) {
          continue
        }

        const value = stateData[key]
        newState[key] = value?.default || getDefaultValue(value?.type)
      }
      setFormData((previousData) => ({ ...previousData, ...newState }))
    }
  }, [stateData])

  const updateField = (path, value) => {
    setFormData((previousFormData) => {
      const newFormData = JSON.parse(JSON.stringify(previousFormData))
      const keys = path.split(".")
      let current = newFormData

      for (let keyIndex = 0; keyIndex < keys.length - 1; keyIndex++) {
        if (!current[keys[keyIndex]]) current[keys[keyIndex]] = {}
        current = current[keys[keyIndex]]
      }
      current[keys[keys.length - 1]] = value
      return newFormData
    })
  }

  const updateNumberField = (path, value) => {
    const numberValue = parseInt(value) || 0
    updateField(path, numberValue)
  }

  const updateArrayItem = (path, itemIndex, value) => {
    setFormData((previousFormData) => {
      const newFormData = JSON.parse(JSON.stringify(previousFormData))
      const keys = path.split(".")
      let current = newFormData

      for (let keyIndex = 0; keyIndex < keys.length - 1; keyIndex++) {
        current = current[keys[keyIndex]]
      }
      const arrayField = keys[keys.length - 1]
      current[arrayField][itemIndex] = value
      return newFormData
    })
  }

  const addArrayItem = (path, item = "") => {
    setFormData((previousFormData) => {
      const newFormData = JSON.parse(JSON.stringify(previousFormData))
      const keys = path.split(".")
      let current = newFormData

      for (let keyIndex = 0; keyIndex < keys.length - 1; keyIndex++) {
        if (!current[keys[keyIndex]]) current[keys[keyIndex]] = {}
        current = current[keys[keyIndex]]
      }
      const arrayField = keys[keys.length - 1]
      if (!current[arrayField]) current[arrayField] = []
      current[arrayField].push(item)
      return newFormData
    })
  }

  const removeArrayItem = (path, itemIndex) => {
    setFormData((previousFormData) => {
      const newFormData = JSON.parse(JSON.stringify(previousFormData))
      const keys = path.split(".")
      let current = newFormData

      for (let keyIndex = 0; keyIndex < keys.length - 1; keyIndex++) {
        current = current[keys[keyIndex]]
      }
      const arrayField = keys[keys.length - 1]
      current[arrayField].splice(itemIndex, 1)
      return newFormData
    })
  }

  return {
    formData,
    updateField,
    updateNumberField,
    updateArrayItem,
    addArrayItem,
    removeArrayItem,
  }
}

export default useFormData
