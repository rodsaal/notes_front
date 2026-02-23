const API_BASE = (import.meta.env.VITE_API_BASE || "http://localhost:3000").replace(/\/$/, "")
const API_V1 = `${API_BASE}/api/v1`

async function parseJsonSafe(res) {
    try {
        return await res.json()
    } catch {
        return null
    }
}

async function request(path, options = {}) {
    const res = await fetch(`${API_V1}${path}`, {
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        ...options,
    })

    const data = await parseJsonSafe(res)

    if (res.ok) return { ok: true, data }

    const errors = data?.errors || null

    return {
        ok: false,
        status: res.status,
        message: data?.message || "Request failed",
        errors,
        data,
    }
}

export async function listNotes() {
    const result = await request("/notes", { method: "GET" })
    if (!result.ok) throw new Error("Failed to load notes")
    return result.data
}

export async function createNote(payload) {
    return request("/notes", {
        method: "POST",
        body: JSON.stringify({ note: payload }),
    }).then((result) => {
        if (!result.ok) {
            return { ok: false, errors: result.errors || {} }
        }
        return { ok: true, note: result.data }
    })
}