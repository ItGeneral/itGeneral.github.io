<template>
  <div ref="editorContainer" class="editor-core"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { basicSetup } from 'codemirror'
import { createMarkdownExtensions } from './SyntaxHighlight'
import { eventBus } from '../Common/EventBus'

const props = defineProps<{
  modelValue: string
  theme?: 'light' | 'dark'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
  'cursor': [position: { line: number; column: number }]
}>()

const editorContainer = ref<HTMLElement>()
let editorView: EditorView | null = null

onMounted(() => {
  const state = EditorState.create({
    doc: props.modelValue,
    extensions: [
      basicSetup,
      ...createMarkdownExtensions(props.theme === 'dark'),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const newValue = update.state.doc.toString()
          emit('update:modelValue', newValue)
          emit('change', newValue)
          eventBus.emit('content-changed', { content: newValue })
        }
        if (update.selectionSet) {
          const pos = update.state.selection.main.head
          const line = update.state.doc.lineAt(pos)
          emit('cursor', {
            line: line.number,
            column: pos - line.from + 1
          })
          eventBus.emit('cursor-moved', {
            line: line.number,
            column: pos - line.from + 1
          })
        }
      }),
      EditorView.theme({
        '&': { fontSize: '14px' },
        '.cm-scroller': { overflow: 'auto' },
        '.cm-content': { padding: '12px 0' }
      })
    ]
  })

  editorView = new EditorView({
    state,
    parent: editorContainer.value!
  })
})

onUnmounted(() => {
  if (editorView) {
    editorView.destroy()
    editorView = null
  }
})

watch(() => props.modelValue, (newValue) => {
  if (editorView && newValue !== editorView.state.doc.toString()) {
    editorView.dispatch({
      changes: {
        from: 0,
        to: editorView.state.doc.length,
        insert: newValue
      }
    })
  }
})

watch(() => props.theme, (newTheme) => {
  // Theme switching logic
})

defineExpose({
  focus: () => editorView?.focus(),
  insert: (text: string) => {
    if (editorView) {
      const transaction = editorView.state.update({
        changes: {
          from: editorView.state.selection.main.from,
          insert: text
        }
      })
      editorView.dispatch(transaction)
    }
  }
})
</script>

<style scoped>
.editor-core {
  height: 100%;
  overflow: auto;
}
</style>
