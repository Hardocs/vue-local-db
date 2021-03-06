<template>
  <div class="docs-translate-content">
    <div class="w-full bg-title">
      <h2 class="text-json">Translate by Setting File Types, then Choose Folder, then Convert the Files...</h2>
      <h2 class="text-json">Edit by setting From Type, then Choose Folder, then click on File...</h2>
    </div>
    <hr>
    <div class="flex w-full justify-around panel-file-choices">
      <div class="flex px-4 items-center text-white">
        <p class="text-lg">Translation File&nbsp;Types:</p>
      </div>
      <div class="flex px-4 items-center">
        <p class="px-2 text-white text-lg">From: </p>
        <VueSelect
          v-model="fromFiletype"
          :options="pandocFormats"
          :clearable="false"
        />
      </div>
      <div class="flex px-4 items-center">
        <h2 class="px-2 text-white text-lg">To: </h2>
        <VueSelect
          v-model="toFiletype"
          :options="pandocFormats"
          :clearable="false"
        />
      </div>
      <!--      </div>-->
    </div>
    <hr>
    <DocsTransOpsButtons
      v-on:openEditFiles="collectFolderFiles"
      v-on:showFile="showFile"
      v-on:translateFiles="translateFiles"
      v-on:saveToFile="saveToFile"
    />
    <div v-if="opsDisplay" class="bg-display text-white">
      {{ opsDisplay }}
    </div>
    <div v-if="filePath" class="text-json">
      <div class="bg-display text-white">
        <h3>Edited file is {{ filePath }}</h3>
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
              &nbsp;
              <button :class="{ 'is-active': isActive.bold() }" @click="commands.bold">
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
  </div>
</template>

<script>
import DocsTransOpsButtons from '@/components/DocsTransOpsButtons'
import VueSelect from 'vue-select'
import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
import { habitatLocal } from '@hardocs-project/habitat-client'
import {
  Image, Blockquote, CodeBlock, HardBreak, Heading, OrderedList, BulletList,
  ListItem, TodoItem, TodoList, Bold, Code, Italic, Link, Strike, Underline, History,
} from 'tiptap-extensions'

// we need this separated because it's used to initialize choice as well as choices
const pandocFormats = [
  { label: 'Markdown', fromExts: ['md'], inFormat: 'gfm',
    outFormat: 'gfm', outExt: 'md', optArgs: '--standalone'},
  { label: 'Word Docx', fromExts: ['docx'], inFormat: 'docx',
    outFormat: 'docx', outExt: 'docx', optArgs: '--standalone' },
  { label: 'Html', fromExts: ['html', 'htm'], inFormat: 'html',
    outFormat: 'html', outExt: 'html', optArgs: '--self-contained --standalone' },
]

export default {
  name: "DocsTrans",
  data: function () {
    return {
      editor: null,
      editFiles: [],
      editFolderPath: '',
      filePath: null,
      fileContent: null,
      pandocFormats: pandocFormats,
      fromFiletype: pandocFormats[1], // docx
      toFiletype:  pandocFormats[2], // html
      opsMsgs: [],
      opsDisplay: null,
    }
  },
  mounted() {
    this.editor = new Editor({
      extensions: [
        new Image(), new Blockquote(), new CodeBlock(), new HardBreak(),
        new Heading({ levels: [1, 2, 3, 4] }),   new History(),
        new BulletList(), new OrderedList(), new ListItem(), new TodoItem(), new TodoList(),
        new Bold(), new Code(), new Italic(), new Link(), new Strike(), new Underline(),
      ],
      content: `
          <h1>Hmm, Headlines!</h1>
          <p>All these <strong>few tags</strong> are working now.</p>
          <h2>But more can come.</h2>
        `,
      onDrop: (view, event, slice, moved) => {
        console.log(`New content was added by Drop from the user's clipboard!`)
        console.log(view, event, slice, moved)
      },
      onPaste: (view, event, slice, moved) => {
        console.log(`New content was added by Paste from the user's clipboard!`)
        console.log(view, event, slice, moved)
      },
    })
  },
  beforeDestroy() {
    this.editor.destroy()
  },
  watch: {
    // the first time ever I needed a watch variable, but suits here...
    opsMsgs: function () {
      this.opsDisplay  = this.opsMsgs.join(', ')
      // console.log('opsMsgs opsDisplay watch 2: ' + console.log(this.opsDisplay))
    }
  },
  methods: {
    showFile: function (fileData) {
      this.filePath = this.fileNameFromPath(fileData.path)
      this.editFiles.push(this.filePath)
      this.fileContent = fileData.content
      console.log('showFile:content: ' + this.fileContent)
      this.editor.setContent(this.fileContent)
    },
    fileName: function (filePath) {
      const parts = filePath.split('\\')
      return parts[parts.length - 1]
    },
    setEditable: function (filesInfo) {
      this.editFiles = filesInfo.files
      this.editFolderPath = filesInfo.folderPath
      if (this.editFiles.length > 0) {
        this.openFile(this.editFiles[0])
      }
      this.opsMsgs.push('Folder is: ' + this.editFolderPath)
    },
    collectFolderFiles: function () {
      this.clearPanels()
      this.editFiles = []
      habitatLocal.chooseFolderForUse(this.fromFiletype.fromExts)
      .then (folder => {
        return habitatLocal.loadFilePathsFromFolder(folder, this.fromFiletype.fromExts)
          .then(filesInfo => {
            this.setEditable(filesInfo)
          })
          .catch(err => {
            this.opsDisplay = err
          })
      })
    },
    openFile: function (filePath) {
      this.clearPanels()
      habitatLocal.loadContentFromFilePath(filePath)
        .then (fileData => {
          this.filePath = fileData.filePath
          this.fileContent = fileData.content
          this.editor.setContent(this.fileContent)
        })
        .catch (e => {
          this.opsDisplay = 'error opening file: ' + e
       })
    },
    translateFiles: function () {
      this.clearPanels()
      this.editFiles.forEach(fileName => {
        this.translateFile(fileName, this.editFolderPath)
      })
      this.setFromFileTypeMatchingToMenu()
      habitatLocal.loadFilePathsFromFolder(this.editFolderPath, this.fromFiletype.fromExts)
      .then (filesInfo => {
        this.setEditable (filesInfo)
      })
      .catch (err => {
        this.opsDisplay = err
      })
    },
    translateFile: function (fileName, cwd) {
      habitatLocal.shellProcess('pandoc',
        this.prepTranlateArgs(fileName), { cwd: cwd })
        .then (result => {
          const msg = 'translateFile: ' + fileName + ': ' + result
          // console.log(msg)
          this.opsMsgs.push(msg)
        })
        .catch (e => {
          const msg = 'translateFile:error: ' + fileName + ': ' + e
          console.log(msg)
          this.opsMsgs.push(msg)
        })
    },
    saveToFile: function () {
      const editHtmlView = this.editor.getHTML()
      habitatLocal.putContentToSelectedFolder(editHtmlView,
        this.filePath, this.fromFiletype.outFormat, this.fromFiletype.label)
        .then (result => {
          console.log ('saved file: ' + JSON.stringify(result))
        })
        .catch (e => {
          this.filePath = '(no path)',
          this.fileContent = { "error": e.toString() }
        })
    },
    prepTranlateArgs: function (fileName) {
      const fileParts = fileName.split('.')
      const optArgs = this.toFiletype.optArgs.split(' ')
      const args = []
      args.push('-f'); args.push(this.fromFiletype.inFormat);
      args.push('-t'); args.push(this.toFiletype.outFormat);
      optArgs.forEach(optArg => {
        args.push(optArg)
      })
      args.push(fileName)
      args.push('-o'); args.push(fileParts[0] + '.' + this.toFiletype.outExt)
      return args
    },
    fileNameFromPath: function (filePath) {
      const pathParts = filePath.split('\\')
      return pathParts[pathParts.length - 1]
    },
    setFromFileTypeMatchingToMenu () {
      const fileType = pandocFormats.find(format => {
        return format.label === this.toFiletype.label
      })
      this.fromFiletype = fileType
    },
    clearPanels: function () {
      this.editor.setContent('')
      this.opsMsgs = []
      this.opsDisplay = null
    },
  },
  components: {
    DocsTransOpsButtons,
    VueSelect,
    EditorContent,
    EditorMenuBar
  }
}
</script>

<style lang="scss">

  @import "vue-select/src/scss/vue-select.scss";

  .vs__selected {
    color: lightgoldenrodyellow;
  }

</style>

<style>
/*
  you'd think to style the TipTap editor here, but no, unless you want
  to use a lot of !important. Somehow main.css dominates, after it's
  zeroed everything in sight - it's the tailwind way...
 */
body {
  height: 100vh;
}

.master-item {
  cursor: pointer;
}

</style>
<style scoped>

.docs-translate-content {
  text-align: left;
}

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
  text-align: center;
}

.bg-display {
  background-color: teal;
  text-align: center;
}
.text-json {
  color: #1d3557;
}
.html-data {
  text-align: left;
  white-space: normal;
  margin: 20px;
}

.select-label {

}

.text-v-center{
  text-align: middle;
}

.panel-file-choices {
  background-color: #1197a9;
  color: lightgoldenrodyellow;
}

.comp-style {
  color: red;
}

</style>
