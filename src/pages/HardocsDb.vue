<template>
  <span>
    <div class="w-full bg-title">
    <h2 class="text-json">Buttons With Actions -- try one...</h2>
    </div>
    <hr>
    <HardocsDbOpsButtons
      :htmlString="fileContent"
      :htmlEditor="editor"
      v-on:openEditFiles="openDir"
      v-on:showFile="showFile"
      v-on:savedFile="savedFile"
    />
    <div v-if="filePath" class="text-json">
      <div class="bg-display text-white">
        <h3>File is {{ filePath }}</h3>
      </div>
      <!--
        n.b. _Never_ use v-html as follows, if you aren't absolutely certain
        that the content is safe...as for example raw web content never can be.
        *todo* We will assure that safety later within the Habitat protocol...
        ...as we do throughout CombatCovid
      -->
      <div class="flex mb-4 h-full">
        <div class="w-1/2 bg-gray-400 h-12 px-2">
          <div v-for="(file, index) in editFiles" :key="index">
            <h2 class="master-item" @click="openFile(file)">{{ fileName(file) }}</h2>
            <hr>
          </div>
        </div>
        <div class="w-1/2 bg-gray-500 h-12 px-2 border-l-2 border-gray-600 h-full">
          <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
            <div>
              <button :class="{ 'is-active': isActive.italic() }" @click="commands.italic()">
                Italic
              </button>
              &nbsp;        <button :class="{ 'is-active': isActive.bold() }" @click="commands.bold">
                Bold
              </button>
              &nbsp;
              <button :class="{ 'is-active': isActive.heading({ level: 1 }) }" @click="commands.heading({ level: 1 })">
                H1
              </button>
              &nbsp;
              <button :class="{ 'is-active': isActive.heading({ level: 2 }) }" @click="commands.heading({ level: 2 })">
                H2
              </button>
            </div>
          </editor-menu-bar>
          <hr>
          <editor-content :editor="editor" />
        </div>
      </div>
    </div>
  </span>
</template>

<script>
import HardocsDbOpsButtons from '@/components/HardocsDbOpsButtons'
import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
import { getHtmlFromPath, getFilesFromDir } from '@/modules/habitat-requests';
import {
  Blockquote,
  CodeBlock,
  HardBreak,
  Heading,
  OrderedList,
  BulletList,
  ListItem,
  TodoItem,
  TodoList,
  Bold,
  Code,
  Italic,
  Link,
  Strike,
  Underline,
  History,
} from 'tiptap-extensions'

export default {
  name: "HardocsDb",
  data: function () {
    return {
      editor: null,
      editFiles: [],
      filePath: null,
      fileContent: null,
      fileJsonObject: null,
      fileJsonView: null
    }
  },
  mounted() {
    this.editor = new Editor({
      extensions: [
        new Blockquote(),
        new CodeBlock(),
        new HardBreak(),
        new Heading({ levels: [1, 2, 3] }),
        new BulletList(),
        new OrderedList(),
        new ListItem(),
        new TodoItem(),
        new TodoList(),
        new Bold(),
        new Code(),
        new Italic(),
        new Link(),
        new Strike(),
        new Underline(),
        new History(),
      ],
      content: `
          <h1>Hmm, Headlines!</h1>
          <p>All these <strong>few tags</strong> are working now.</p>
          <h2>But more can come.</h2>
        `,
    })
  },
  beforeDestroy() {
    this.editor.destroy()
  },
  methods: {
    showFile: function (fileData) {
      this.filePath = fileData.path
      this.editFiles.push(this.filePath)
      this.fileContent = fileData.content
      this.editor.setContent(this.fileContent)
    },
    savedFile: function (fileData) {
      this.filePath = fileData.path
      this.fileContent = fileData.content
    },
    fileName: function (filePath) {
      const parts = filePath.split('\\')
      return parts[parts.length - 1]
    },
    openDir: function () {
      this.editFiles = []
      getFilesFromDir('.html') // mind the dot; it's required
      .then (result => {
        this.editFiles = result.files
        if (this.editFiles.length > 0) {
          this.openFile(this.editFiles[0])
        }
      })
      .catch (err => this.editFiles[0] = err) // we can do a lot better, but not today - parent ops result pane...
    },
    openFile: function (filePath) {
      getHtmlFromPath (filePath)
        .then (fileData => {
          this.filePath = fileData.path
          this.fileContent = fileData.content
          // part of the incoherent mess - we have already this file on list, etc..
          // this.editFiles.push(this.filePath)
          this.editor.setContent(this.fileContent)
        })
        .catch (e => {
          this.editor.setContent('error opening file: ' + e)
       })
    },
  },
  components: {
    HardocsDbOpsButtons,
    EditorContent,
    EditorMenuBar
  }
}
</script>

<style>

h1 {
  font-size: larger;
  font-weight: bold;
  margin-bottom: 1.5em;
}

h2 {
  font-size: large;
  font-weight: bold;
  margin-bottom: 1em;
}

body {
  height: 100vh;
}

.master-item {
  cursor: pointer;
}

</style>
<style scoped>

.left-colx {
  width: 44%;
  padding: 0 2%;
}

.right-colx {
  width: 50%;
  padding: 0 2%;

}
.bg-title {
  background-color: #d6b668;
}
.bg-display {
  background-color: teal;
}
.text-json {
  color: #1d3557;
}
.html-data {
  text-align: left;
  white-space: normal;
  margin: 20px;
}
</style>