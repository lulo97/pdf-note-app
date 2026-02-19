// services/noteService.ts

export interface Note {
  id?: number
  title: string
  content: string
}

const API_URL = "http://localhost:3000/notes"

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "API Error")
  }

  return response.json()
}

export const noteService = {
  // GET ALL
  async getAll(): Promise<Note[]> {
    const response = await fetch(API_URL)
    return handleResponse<Note[]>(response)
  },

  // GET by title
  async getByTitle(title: string): Promise<Note | null> {
    const response = await fetch(API_URL)
    const response_json = await handleResponse<Note[]>(response)

    const record = response_json.find((ele) => ele.title == title)
    return record || null
  },

  // GET BY ID
  async getById(id: number): Promise<Note> {
    const response = await fetch(`${API_URL}/${id}`)
    return handleResponse<Note>(response)
  },

  // CREATE
  async create(data: Note): Promise<{ id: number }> {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })

    return handleResponse<{ id: number }>(response)
  },

  // UPDATE
  async update(id: number, data: Note): Promise<{ updated: boolean }> {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })

    return handleResponse<{ updated: boolean }>(response)
  },

  // DELETE
  async delete(id: number): Promise<{ deleted: boolean }> {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    })

    return handleResponse<{ deleted: boolean }>(response)
  }
}
