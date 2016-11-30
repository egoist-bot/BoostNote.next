import React, { PropTypes } from 'react'
import markdown from 'lib/markdown'
import CodeMirror from 'codemirror'
import _ from 'lodash'

CodeMirror.modeURL = '../node_modules/codemirror/mode/%N/%N.js'

class MarkdownPreview extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
    }
  }

  componentDidMount () {
    this.mountContent()

    this.iframe.contentWindow.document.head.innerHTML = `
    <link href="../node_modules/github-markdown-css/github-markdown.css" rel="stylesheet">
    <link rel="stylesheet" type="text/css" href="../node_modules/codemirror/lib/codemirror.css">
    <style>
      .CodeMirror {
        height: inherit;
      }
    </style>
    `
    this.iframe.contentWindow.document.body.className = 'markdown-body'
  }

  componentWillUnmount () {
    this.unmountContent()
  }

  componentDidUpdate (prevProps) {
    this.unmountContent()
    this.mountContent()
  }

  mountContent () {
    const { content } = this.props

    // Render markdown
    this.iframe.contentWindow.document.body.innerHTML = markdown.parse(content)

    // Re-render codeblokcs by CodeMirror run mode
    let codeBlocks = this.iframe.contentWindow.document.body.querySelectorAll('pre code')
    _.forEach(codeBlocks, (block) => {
      let syntax = CodeMirror.findModeByName(block.className.substring(9))
      if (syntax == null) syntax = CodeMirror.findModeByName('Plain Text')
      CodeMirror.requireMode(syntax.mode, () => {
        let value = block.innerHTML
        block.innerHTML = ''
        block.parentNode.className = ` cm-s-default CodeMirror`
        CodeMirror.runMode(value, syntax.mime, block, {
          tabSize: 2
        })
      })
    })

    // Apply click handler for switching mode
    this.iframe.contentWindow.document.addEventListener('mouseup', this.handleContentMouseUp)
    this.iframe.contentWindow.document.addEventListener('mousedown', this.handleContentMouseDown)
  }

  unmountContent () {
    // Remove click handler before rewriting.
    this.iframe.contentWindow.document.removeEventListener('mouseup', this.handleContentMouseUp)
    this.iframe.contentWindow.document.removeEventListener('mousedown', this.handleContentMouseDown)
  }

  handleContentClick = e => {
    this.props.onClick != null && this.props.onClick()
  }

  handleContentMouseUp = e => {
    this.props.onMouseUp != null && this.props.onMouseUp()
  }

  handleContentMouseDown = e => {
    this.props.onMouseDown != null && this.props.onMouseDown()
  }

  render () {
    const { className, style } = this.props

    return (
      <iframe ref={c => (this.iframe = c)}
        className={'MarkdownPreview ' + className}
        style={style}
        sandbox='allow-scripts'
      />
    )
  }
}

MarkdownPreview.propTypes = {
  content: PropTypes.string
}

export default MarkdownPreview
