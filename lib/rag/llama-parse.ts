const API_URL = "https://api.cloud.llamaindex.ai/api/parsing"

type JobStatus = {
  id: string
  detail?: string
  status: "PENDING" | "SUCCESS"
}

export const upload = async (file: Blob): Promise<string> => {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${API_URL}/upload`, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${process.env.LLAMA_CLOUD_API_KEY}`
    }
  })

  if (response.ok) {
    const json = (await response.json()) as JobStatus

    if (!json.id) {
      throw new Error(json.detail || "Failed to upload file")
    }

    return json.id
  }

  throw new Error("Failed to parse file")
}

export const check = async (id: string): Promise<string> => {
  const response = await fetch(`${API_URL}/job/${id}`, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.LLAMA_CLOUD_API_KEY}`
    }
  })

  if (response.ok) {
    const json = (await response.json()) as JobStatus

    return json.status
  }

  throw new Error("Failed to check job status")
}

export const result = async (
  id: string,
  format: "text" | "markdown" = "markdown"
): Promise<string> => {
  const response = await fetch(`${API_URL}/job/${id}/result/${format}`, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.LLAMA_CLOUD_API_KEY}`
    }
  })

  if (response.ok) {
    const json = await response.json()

    return json[format]
  }

  throw new Error("Failed to get job result")
}
