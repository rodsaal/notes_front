import { describe, it, expect, vi, beforeEach } from "vitest"
import { listNotes, createNote } from "./notesApi"

function mockFetchOnce({ ok = true, status = 200, jsonData = null, jsonThrows = false } = {}) {
    global.fetch = vi.fn().mockResolvedValue({
        ok,
        status,
        json: jsonThrows
            ? vi.fn().mockRejectedValue(new Error("Invalid JSON"))
            : vi.fn().mockResolvedValue(jsonData),
    })
}

describe("notesApi", () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it("listNotes returns notes", async () => {
        const notes = [{ id: 1, title: "New", created_at: new Date().toISOString() }]
        mockFetchOnce({ ok: true, jsonData: notes })

        const result = await listNotes()
        expect(result).toEqual(notes)
        expect(global.fetch).toHaveBeenCalled()
    })

    it("listNotes throws on non-ok", async () => {
        mockFetchOnce({ ok: false, status: 500, jsonData: { message: "boom" } })

        await expect(listNotes()).rejects.toThrow("Failed to load notes")
    })

    it("createNote returns ok:true on success", async () => {
        const created = { id: 1, title: "Meeting", content: "Next steps" }
        mockFetchOnce({ ok: true, status: 201, jsonData: created })

        const result = await createNote({ title: "Meeting", content: "Next steps" })
        expect(result.ok).toBe(true)
        expect(result.note).toEqual(created)
    })

    it("createNote returns ok:false and errors on 422", async () => {
        mockFetchOnce({
            ok: false,
            status: 422,
            jsonData: { errors: { title: ["can't be blank"] } },
        })

        const result = await createNote({ title: "", content: "" })
        expect(result.ok).toBe(false)
        expect(result.errors.title).toContain("can't be blank")
    })

    it("createNote handles invalid json gracefully", async () => {
        mockFetchOnce({ ok: false, status: 500, jsonThrows: true })

        const result = await createNote({ title: "x" })
        expect(result.ok).toBe(false)
        expect(result.errors).toEqual({})
    })
})