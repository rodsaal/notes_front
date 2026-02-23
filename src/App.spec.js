import { describe, it, expect, vi, beforeEach } from "vitest"
import { mount, flushPromises } from "@vue/test-utils"
import App from "./App.vue"

// mock do module inteiro
vi.mock("./services/notesApi", () => ({
    listNotes: vi.fn(),
    createNote: vi.fn(),
}))

import { listNotes, createNote } from "./services/notesApi"

describe("App.vue", () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it("loads notes on mount and renders them", async () => {
        listNotes.mockResolvedValue([
            { id: 1, title: "New", content: null, created_at: new Date().toISOString() },
        ])

        const wrapper = mount(App)
        await flushPromises()

        expect(listNotes).toHaveBeenCalled()
        expect(wrapper.text()).toContain("New")
    })

    it("shows empty message when no notes", async () => {
        listNotes.mockResolvedValue([])

        const wrapper = mount(App)
        await flushPromises()

        expect(wrapper.text()).toContain("Nenhuma anotação ainda.")
    })

    it("submits form and shows success message", async () => {
        listNotes.mockResolvedValueOnce([]) // load inicial
        createNote.mockResolvedValue({ ok: true, note: { id: 1, title: "Meeting" } })
        listNotes.mockResolvedValueOnce([{ id: 1, title: "Meeting", created_at: new Date().toISOString() }]) // reload após salvar

        const wrapper = mount(App)
        await flushPromises()

        await wrapper.find('input[placeholder="Digite o título"]').setValue("Meeting")
        await wrapper.find("form").trigger("submit.prevent")
        await flushPromises()

        expect(createNote).toHaveBeenCalled()
        expect(wrapper.text()).toContain("Anotação salva!")
        expect(wrapper.text()).toContain("Meeting")
    })

    it("shows validation errors from API", async () => {
        listNotes.mockResolvedValue([])
        createNote.mockResolvedValue({ ok: false, errors: { title: ["can't be blank"] } })

        const wrapper = mount(App)
        await flushPromises()

        await wrapper.find("form").trigger("submit.prevent")
        await flushPromises()

        expect(wrapper.text()).toContain("Corrija os erros:")
        expect(wrapper.text()).toContain("title can't be blank")
    })
})