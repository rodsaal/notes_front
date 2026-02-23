<template>
  <main class="page">
    <h1>Sistema de Anotações</h1>

    <section class="card">
      <h2 class="card-title">Nova anotação</h2>

      <div v-if="errors.length" class="error-box">
        <strong>Corrija os erros:</strong>
        <ul class="error-list">
          <li v-for="(e, idx) in errors" :key="idx">{{ e }}</li>
        </ul>
      </div>

      <div v-if="requestError" class="error-box">
        <strong>Erro:</strong> {{ requestError }}
      </div>

      <form @submit.prevent="onSubmit" class="form">
        <label class="field">
          <span>Título *</span>
          <input
              v-model.trim="form.title"
              placeholder="Digite o título"
              class="input"
              autocomplete="off"
          />
        </label>

        <label class="field">
          <span>Conteúdo</span>
          <textarea
              v-model="form.content"
              placeholder="Digite o conteúdo..."
              rows="4"
              class="textarea"
          />
        </label>

        <div class="actions">
          <button type="submit" :disabled="loading" class="button">
            {{ loading ? "Salvando..." : "Salvar" }}
          </button>

          <span v-if="successMessage" class="success">{{ successMessage }}</span>
        </div>
      </form>
    </section>

    <section class="list">
      <h2>Anotações</h2>

      <p v-if="notesLoading">Carregando...</p>
      <p v-else-if="notes.length === 0">Nenhuma anotação ainda.</p>

      <ul v-else class="notes">
        <li v-for="note in notes" :key="note.id" class="note">
          <div class="note-header">
            <strong>{{ note.title }}</strong>
            <small class="muted">{{ formatDate(note.created_at) }}</small>
          </div>

          <p v-if="note.content" class="note-content">
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

const form = reactive({ title: "", content: "" })

const notes = ref([])
const loading = ref(false)
const notesLoading = ref(false)

const errors = ref([])
const requestError = ref("")
const successMessage = ref("")

function formatDate(iso) {
  if (!iso) return ""
  return new Date(iso).toLocaleString()
}

function normalizeErrors(errObj) {
  const out = []
  for (const [field, msgs] of Object.entries(errObj || {})) {
    for (const msg of msgs || []) out.push(`${field} ${msg}`)
  }
  return out
}

async function fetchNotes() {
  requestError.value = ""
  notesLoading.value = true

  try {
    notes.value = await listNotes()
  } catch (e) {
    requestError.value = e?.message || "Failed to load notes"
  } finally {
    notesLoading.value = false
  }
}

async function onSubmit() {
  successMessage.value = ""
  requestError.value = ""
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
  } catch (e) {
    requestError.value = e?.message || "Failed to save note"
  } finally {
    loading.value = false
  }
}

onMounted(fetchNotes)
</script>

<style scoped>
.page {
  max-width: 760px;
  margin: 40px auto;
  font-family: system-ui, sans-serif;
}

.card {
  margin-top: 24px;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.card-title {
  margin-top: 0;
}

.form {
  display: grid;
  gap: 10px;
}

.field {
  display: grid;
  gap: 6px;
}

.input,
.textarea {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.textarea {
  resize: vertical;
}

.actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.button {
  padding: 10px 14px;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}

.error-box {
  margin: 10px 0;
  color: #b00020;
}

.error-list {
  margin: 8px 0 0;
  padding-left: 18px;
}

.success {
  color: #0a7a2f;
}

.list {
  margin-top: 24px;
}

.notes {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 12px;
}

.note {
  padding: 14px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.note-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.note-content {
  margin: 10px 0 0;
  white-space: pre-wrap;
}

.muted {
  color: #666;
}
</style>