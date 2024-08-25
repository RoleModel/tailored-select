import { classMap } from 'lit/directives/class-map.js'
import { LitElement, css, html } from 'lit'

export default class TailoredSelect extends LitElement {
  static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true }
  static formAssociated = true

  static properties = {
    hasFocus: { type: Boolean, state: true },
    name: { type: String, reflect: true },
    id: { type: String, reflect: true },
    placeholder: { type: String, reflect: true },
    autofocus: { type: Boolean, reflect: true },
  }

  constructor() {
    super()
    this.name = ''
    this.id = ''
    this.placeholder = ''
    this.autofocus = false
    this.internals_ = this.attachInternals()
    this.internals_.ariaRole = 'combobox'
  }

  // Lifecycle hooks

  connectedCallback() {
    super.connectedCallback()

    // Ensure focusable
    // this.tabIndex = 0
  }

  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties)

    // On load, everything starts in available. We need to move selected over.
    this.availableOptions.forEach((option) => {
      option.addEventListener('click', () => this.toggleOption(option))
      option.addEventListener('mouseover', () => this.handleOptionFocus(option))
      this.assignOptionSlot(option)
    })

    this.resetOptionFocus()
    this.updateFormValue()
  }

  // Input Behavior

  handleInputBlur() {
    this.hasFocus = false
    this.resetOptionFocus()
    // this.emit('ts-blur')
  }

  // handleChange() {
  //   this.emit('ts-change')
  // }

  handleInputFocus(_event) {
    this.hasFocus = true
    // this.emit('ts-focus')
  }

  handleInputKeyDown(event) {
    switch (event.key) {
      case 'ArrowDown':
        this.focusNextOption()
        break
      case 'ArrowUp':
        this.focusPreviousOption()
        break
      case 'Enter':
        this.toggleOption(this.focusedOption)
        break
      case 'Backspace':
        this.deleteSelection()
        break
    }
  }

  handleInputInput(event) {
    const value = event.target.value
    if (!value) {
      // Make all options visible
      this.availableOptions.forEach((opt) => (opt.hidden = false))
      return
    }

    const matcher = new RegExp(value, 'i')
    this.availableOptions.forEach((opt) => {
      opt.hidden = !Boolean(opt.value.match(matcher))
    })
  }

  deleteSelection() {
    const cursorSelection = this.getInputSelection()

    if (this.selectedOptions.length < 1 || cursorSelection.start !== 0 || cursorSelection.length !== 0) {
      return
    }

    const lastOption = this.selectedOptions[this.selectedOptions.length - 1]
    this.toggleOption(lastOption)
  }

  getInputSelection() {
    return {
      start: this.input.selectionStart || 0,
      length: (this.input.selectionEnd || 0) - (this.input.selectionStart || 0),
    }
  }

  // Listbox Behavior

  handleListboxMousedown(event) {
    // Prevent focus from being lost on the input
    event.preventDefault()
  }

  //  Option Behavior

  handleOptionFocus(option) {
    if (option.selected) {
      return
    }
    this.setActiveOption(option)
  }

  // Internal part Getters

  get noResultsMessage() {
    return this.shadowRoot.querySelector('.tailored-select__no-results')
  }

  get input() {
    return this.shadowRoot.querySelector('input')
  }

  get selectedOptions() {
    return this.shadowRoot.querySelector('slot[name="selected-options"]').assignedElements({ flatten: true })
  }

  get availableOptions() {
    return this.shadowRoot.querySelector('slot:not([name])').assignedElements({ flatten: true })
  }

  get listbox() {
    return this.shadowRoot.querySelector('div[role="listbox"]')
  }

  focusNextOption(option = this.focusedOption) {
    const index = this.availableOptions.indexOf(option)
    if (index == this.availableOptions.length - 1) return false

    const nextOption = this.availableOptions[index + 1]
    this.setActiveOption(nextOption)
    return true
  }

  focusPreviousOption() {
    const index = this.availableOptions.indexOf(this.focusedOption)
    if (index == 0) return false

    const nextOption = this.availableOptions[index - 1]
    this.setActiveOption(nextOption)
    return true
  }

  ensureOptionFocused(option) {
    if (this.focusNextOption(option)) return
    if (this.focusPreviousOption(option)) return

    this.clearOptionFocus()
  }

  setActiveOption(option) {
    this.clearOptionFocus()
    this.setHeight(option)
    option.classList.add('focused')
  }

  resetOptionFocus() {
    this.clearOptionFocus()

    const firstOption = this.availableOptions[0]
    if (firstOption) {
      this.setActiveOption(firstOption)
    }
  }

  clearOptionFocus() {
    this.removeFocus(this.focusedOption)
  }
  removeFocus(option) {
    option?.classList.remove('focused')
  }

  setHeight(option) {
    const listboxHeight = this.listbox.clientHeight
    const scrollTop = this.listbox.scrollTop || 0
    const y = option.getBoundingClientRect().top - this.listbox.getBoundingClientRect().top + scrollTop
    const heightItem = option.offsetHeight

    if (y + heightItem > listboxHeight + scrollTop) {
      this.listbox.scroll(0, y - listboxHeight + heightItem, { behavior: 'smooth' })
    } else if (y < scrollTop) {
      this.listbox.scroll(0, y, { behavior: 'smooth' })
    }
  }

  get focusedOption() {
    return this.availableOptions.find((opt) => opt.classList.contains('focused'))
  }

  // handleChange(event) {
  //   this.value = event.target.value
  //   // this.updateValidity(this.value)
  //   // this.internals_.setFormValue(this.value)
  // }

  // updateValidity(newValue) {
  //   if (newValue === 'RoleModel') {
  //     this.internals_.setValidity({ })
  //     return
  //   }

  //   this.internals_.setValidity({ patternMismatch: true }, 'value is not RoleModel', this.input)
  //   this.internals_.reportValidity()
  // }

  // Exposed Interface

  get form() {
    return this.internals_.form
  }

  focus(focusOptions = undefined) {
    this.input.focus(focusOptions)
  }

  blur() {
    this.input.blur()
  }

  toggleOption(option) {
    if (!option.selected) {
      // Only performed when toggling on
      this.ensureOptionFocused(option)
    }

    option.selected = !option.selected
    this.assignOptionSlot(option)
    this.updateFormValue()
    this.updateNoResultsMessage()
  }

  assignOptionSlot(option) {
    option.setAttribute('slot', option.selected ? 'selected-options' : '')
  }

  updateFormValue() {
    const newFormData = new FormData()

    newFormData.append(this.name, '') // Allow blank might be an option we can disable
    this.selectedOptions.forEach((option) => {
      newFormData.append(this.name, option.value)
    })

    this.internals_.setFormValue(newFormData)
  }

  updateNoResultsMessage() {
    const noResults = this.availableOptions.every((opt) => opt.hidden)
    this.noResultsMessage.classList.toggle('active', noResults)
  }

  render() {
    return html`
      <div
        part="base"
        class=${classMap({
          'tailored-select': true,
          'tailored-select--focused': this.hasFocus,
        })}
      >
        <div class="tailored-select__controls">
          <slot part="selected-options" name="selected-options"></slot>
          <input
            part="text-field"
            type="text"
            placeholder=${this.placeholder}
            ?autofocus=${this.autofocus}
            @input=${this.handleInputInput}
            @focus=${this.handleInputFocus}
            @blur=${this.handleInputBlur}
            @keydown=${this.handleInputKeyDown}
          />
          <span part="arrow"></span>
        </div>
        <div class="tailored-select__options-wrapper">
          <div
            part="listbox"
            role="listbox"
            class="tailored-select__options"
            tabindex="-1"
            @mousedown=${this.handleListboxMousedown}
          >
            <slot></slot>
            <span class="tailored-select__no-results" part="no-results-message">No Results</span>
          </div>
        </div>
      </div>
    `
  }

  static styles = css`
    :host {
      /* Token name: Context-Property-State */

      --border-color: hsl(214 4% 84%);
      --focus-inner-shadow-width: 2px;
      --focus-inner-shadow-color: hsl(214 94% 84%);
      --focus-outer-shadow-width: 4px;
      --focus-outer-shadow-color: hsl(214 94% 96%);

      /* Base */
      --font-size: 14px;
      --radius: 3px;

      --background-color: hsl(214 4% 98%);
      --text-color: hsl(214 4% 4%);

      --background-color-focus: hsl(214 94% 98%);
      --text-color-focus: hsl(214 94% 8%);

      --box-shadow: 0 0 0 1px var(--border-color);
      --box-shadow-focus: inset 0 0 0 var(--focus-inner-shadow-width) var(--focus-inner-shadow-color),
        0 0 0 var(--focus-outer-shadow-width) var(--focus-outer-shadow-color);

      --padding-block: 8px;
      --padding-inline: 8px;

      /* Input */
      --input-font-size: var(--font-size);

      /* Selected Options container */
      --selected-options-gap: 4px;

      /* Available Options */
      --available-options-box-shadow: inset 0 0 0 var(--focus-inner-shadow-width) var(--focus-inner-shadow-color),
        0 0 0 var(--focus-outer-shadow-width) var(--focus-outer-shadow-color);
      --available-options-max-height: 200px;
      --available-options-padding: 4px;

      /* Option */
      --option-padding-inline: 4px;
      --option-padding-block: 2px;

      /* Option Selected */
      --option-background-color-selected: hsl(214, 94%, 57%);
      --option-text-color-selected: hsl(0, 100%, 100%);
      --option-padding-selected: 4px;
      --option-font-size-selected: 12px;
      --option-font-weight-selected: 700;
      --option-border-radius-selected: 4px;

      /* Option Hover */
      --option-background-color-hover: hsl(214 4% 90%);
      --option-text-color-hover: hsl(214 4% 20%);
      --option-box-shadow-hover: inset calc(-1 * var(--focus-inner-shadow-width)) 0 0 0 var(--focus-inner-shadow-color),
        inset var(--focus-inner-shadow-width) 0 0 0 var(--focus-inner-shadow-color);

      display: block;
      z-index: 2;
      width: 100%;
      font-family: sans-serif;
    }

    :host([hidden]) {
      display: none;
    }

    .tailored-select {
      border-radius: var(--radius);
      box-shadow: var(--box-shadow);
      font-size: var(--font-size);
      background-color: var(--background-color);
      color: var(--text-color);
      position: relative;
    }

    .tailored-select__options-wrapper {
      display: none;
      position: absolute;
      width: 100%;
      box-sizing: border-box;
      margin-top: calc(-1 * var(--focus-inner-shadow-width));

      background-color: var(--background-color-focus);
      color: var(--text-color-focus);

      padding: var(--available-options-padding);

      contain: paint;
    }

    .tailored-select__options {
      margin: var(--focus-inner-shadow-width);
      margin-top: 0;
      max-height: var(--available-options-max-height);
      overflow-y: auto;
      scroll-behavior: smooth;
    }

    .tailored-select--focused {
      background-color: var(--background-color-focus);
      color: var(--text-color-focus);
      box-shadow: var(--box-shadow-focus);
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;

      .tailored-select__options-wrapper {
        display: block;
        box-shadow: var(--available-options-box-shadow);
        clip-path: inset(
          calc(var(--focus-outer-shadow-width) / 2) calc(-1 * var(--focus-outer-shadow-width))
            calc(-1 * var(--focus-outer-shadow-width)) calc(-1 * var(--focus-outer-shadow-width))
        );
        border-bottom-left-radius: var(--radius);
        border-bottom-right-radius: var(--radius);
      }
    }

    .tailored-select__no-results {
      display: none;

      &.active {
        display: block;
      }
    }

    input {
      flex-grow: 1;
      appearance: none;
      border: none;
      background: transparent;
      font-size: var(--input-font-size);
    }

    input:focus {
      outline: none;
    }

    .tailored-select__controls {
      display: flex;
      flex-wrap: wrap;
      gap: var(--selected-options-gap);

      padding-inline: var(--padding-inline);
      padding-block: var(--padding-block);
      z-index: 4;
    }

    ::slotted(option:checked) {
      display: inline-flex;

      background-color: var(--option-background-color-selected);
      color: var(--option-text-color-selected);

      padding: var(--option-padding-selected);
      font-size: var(--option-font-size-selected);
      font-weight: var(--option-font-weight-selected);
      border-radius: var(--option-border-radius-selected);
      cursor: pointer;
    }

    ::slotted(option:not(:checked)) {
      padding-block: var(--option-padding-block);
      padding-inline: var(--option-padding-inline);
      border-radius: var(--option-border-radius-selected);
    }

    ::slotted(option:not(:checked):hover) {
      cursor: pointer;
    }

    ::slotted(option.focused) {
      background-color: var(--option-background-color-hover);
      color: var(--option-text-color-hover);
    }
  `
}
