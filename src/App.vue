<template>
  <main style="max-width: 760px; margin: 40px auto; font-family: system-ui, sans-serif;">
    <h1>Sistema de Anotações</h1>

    <section style="margin-top: 24px; padding: 16px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="margin-top: 0;">Nova anotação</h2>

      <div v-if="errors.length" style="margin: 10px 0; color: #b00020;">
        <strong>Corrija os erros:</strong>
        <ul style="margin: 8px 0 0; padding-left: 18px;">
          <li v-for="(e, idx) in errors" :key="idx">{{ e }}</li>
        </ul>
      </div>

      <form @submit.prevent="onSubmit" style="display: grid; gap: 10px;">
        <label style="display: grid; gap: 6px;">
          <span>Título *</span>
          <input
              v-model.trim="form.title"
              placeholder="Digite o título"
              style="padding: 10px; border: 1px solid #ccc; border-radius: 6px;"
          />
        </label>

        <label style="display: grid; gap: 6px;">
          <span>Conteúdo</span>
          <textarea
              v-model="form.content"
              placeholder="Digite o conteúdo..."
              rows="4"
              style="padding: 10px; border: 1px solid #ccc; border-radius: 6px; resize: vertical;"
          ></textarea>
        </label>

        <div style="display: flex; gap: 10px; align-items: center;">
          <button
              type="submit"
              :disabled="loading"
              style="padding: 10px 14px; border: 0; border-radius: 6px; cursor: pointer;"
          >
            {{ loading ? "Salvando..." : "Salvar" }}
          </button>

          <span v-if="successMessage" style="color: #0a7a2f;">{{ successMessage }}</span>
        </div>
      </form>
    </section>

    <section style="margin-top: 24px;">
      <h2>Anotações</h2>

      <p v-if="notesLoading">Carregando...</p>
      <p v-else-if="notes.length === 0">Nenhuma anotação ainda.</p>

      <ul v-else style="list-style: none; padding: 0; display: grid; gap: 12px;">
        <li
            v-for="note in notes"
            :key="note.id"
            style="padding: 14px; border: 1px solid #eee; border-radius: 8px;"
        >
          <div style="display:flex; justify-content: space-between; gap: 12px;">
            <strong>{{ note.title }}</strong>
            <small style="color:#666;">{{ formatDate(note.created_at) }}</small>
          </div>

          <p v-if="note.content" style="margin: 10px 0 0; white-space: pre-wrap;">
            {{ note.content }}
          </p>
        </li>
      </ul>
    </section>
  </main>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue"
import { createNote, listNotes } from "./services/notesApi"

const form = reactive({
  title: "",
  content: "",
})

const notes = ref([])
const loading = ref(false)
const notesLoading = ref(false)

const errors = ref([])
const successMessage = ref("")

function formatDate(iso) {
  if (!iso) return ""
  const d = new Date(iso)
  return d.toLocaleString()
}

function normalizeErrors(errObj) {
  // { title: ["can't be blank"], other: ["..."] } -> ["title can't be blank", "other ..."]
  const out = []
  for (const [field, msgs] of Object.entries(errObj || {})) {
    for (const msg of msgs) out.push(`${field} ${msg}`)
  }
  return out
}

async function fetchNotes() {
  notesLoading.value = true
  try {
    notes.value = await listNotes()
  } finally {
    notesLoading.value = false
  }
}

async function onSubmit() {
  successMessage.value = ""
  errors.value = []
  loading.value = true

  try {
    const result = await createNote({ title: form.title, content: form.content })

    if (!result.ok) {
      errors.value = normalizeErrors(result.errors)
      return
    }

    form.title = ""
    form.content = ""
    successMessage.value = "Anotação salva!"

    await fetchNotes()
  } finally {
    loading.value = false
  }
}

onMounted(fetchNotes)
</script>
