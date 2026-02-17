const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api/v1"

export async function listNotes() {
    const res = await fetch(`${API_BASE}/notes`)
    if (!res.ok) throw new Error("Failed to load notes")
    return await res.json()
}

export async function createNote(payload) {
    const res = await fetch(`${API_BASE}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: payload }),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
        // Espera algo como { errors: { title: ["can't be blank"] } }
        const errors = data?.errors || {}
        return { ok: false, errors }
    }

    return { ok: true, note: data }
}
