import ShadowElement, {html, css, booleanAttribute, template, adoptedStyleSheets, renderCallbackImmediate} from '@cfware/shadow-element';
import historyState from '@cfware/history-state';
import Symbols from '@cfware/symbols';
import {blockEvent} from '@cfware/event-blocker';

import '@cfware-app/icon';

const objectsEqual = (object1, object2) => {
    if (object1 === null || object2 === null) {
        return object1 === null && object2 === null;
    }

    const keys = Object.keys(object1);
    if (keys.length !== Object.keys(object2).length) {
        return false;
    }

    for (const key of keys) {
        if (!(key in object2)) {
            return false;
        }

        const value1 = object1[key];
        const value2 = object2[key];
        if (typeof value1 !== typeof value2) {
            return false;
        }

        if (typeof value1 === 'object') {
            if (!objectsEqual(value1, value2)) {
                return false;
            }
        } else if (value1 !== value2) {
            return false;
        }
    }

    return true;
};

export const [
    formCustomValidity,
    formAutoFocus,
    formOriginalData,
    formSubmitData,
    formSubmit,
    formLoad,
    formMainTemplate,
    formMainSpacerTemplate,
    formResetLabel,
    formResetCallback,
    formSubmitLabel,
    formIsDirty,
    formDirtySelector
] = Symbols;

export const inputTemplated = (label, icon, template, ...moreClass) => {
    const iconTemplate = icon ? html`<cfware-icon icon=${icon} />` : '';
    const className = ['field', ...moreClass].join(' ');

    return html`
        <label class=${className}>${label}
            <div>
                ${template}
                ${iconTemplate}
            </div>
        </label>
    `;
};

export const inputsTemplated = inputs => inputs.map(input => inputTemplated(...input));

export const checkbox = (name, checked, label, onchange) => {
    const span = {};
    const input = {};
    const keypress = event => {
        if (event.target === span.current && event.key === ' ') {
            input.current.click();
        }
    };

    return html`
        <span tabindex=0 onkeypress=${keypress} ref=${span}>
            <input
                ref=${input}
                name=${name}
                type=checkbox
                disabled
                checked=${booleanAttribute(checked)}
                tabindex=-1
                onchange=${() => onchange?.(input.current)}
                onclick=${() => span.current.focus()}
                onfocus=${() => span.current.focus()}
            />
            ${label}
        </span>
    `;
};

export const singleFileUploader = (name, accept, required, onchange) => {
    const fileInput = {};
    const readOnly = {};

    const click = () => {
        fileInput.current.click();
        setTimeout(() => readOnly.current.focus());
    };

    const clear = event => {
        blockEvent(event);
        fileInput.current.value = '';
        readOnly.current.value = '';
        setTimeout(() => readOnly.current.focus());
        onchange?.(fileInput.current.files);
    };

    const keyHandlers = {
        ' ': click,
        Backspace: clear,
        Delete: clear
    };

    const keyup = event => {
        keyHandlers[event.key]?.();
    };

    const change = () => {
        readOnly.current.value = fileInput.current.value;
        onchange?.(fileInput.current.files);
    };

    return html`
        <input ref=${fileInput} name=${name} type=file accept=${accept} disabled hidden onchange=${change} />
        <input ref=${readOnly} file required=${booleanAttribute(required)} onclick=${click} onkeyup=${keyup} onkeypress=${blockEvent} onpaste=${blockEvent} />
        <cfware-icon icon="\uF093" upload onclick=${click} />
        <cfware-icon icon="\uF00D" remove right onclick=${clear} />
    `;
};

export const validationErrorLabel = (value, reference) => {
    return html`
        <input
            error-label
            tabindex=-1
            value=${value}
            ref=${reference}
            onfocus=${event => event.target.blur()}
            onkeypress=${blockEvent}
            onpaste=${blockEvent}
        />
    `;
};

const inputTypeField = {
    number: 'valueAsNumber',
    checkbox: 'checked',
    file: 'files'
};

export const getElementValue = element => element[inputTypeField[element.type] ?? 'value'];

export const formSharedStyles = [
    css`
        form {
            display: grid;
            grid-template-rows: minmax(100px, auto) 1fr auto;
            overflow: hidden;
            padding: 1rem 0 0;
        }

        form > div.buttons {
            display: grid;
            grid-auto-flow: column;
            grid-template-columns: 1fr;
            padding: .5rem 1rem;
        }

        form > div:not(.space):not(.buttons) {
            padding: 0 1rem;
        }

        form > div.form {
            overflow: auto;
        }

        form div.form {
            display: grid;
            grid-gap: 1rem;
        }

        div.form.twocol {
            grid-template-columns: auto auto;
        }

        .field {
            color: #222;
            font-size: .875rem;
            user-select: none;
        }

        .spantwo {
            grid-column: span 2;
        }

        .field > div {
            margin: 1px 0;
            display: block;
            position: relative;
            font-size: 1.25rem;
        }

        .field > div > span {
            font-size: 1rem;
            padding-right: .2rem;
        }

        .field > div > span > input[type=checkbox] {
            vertical-align: top;
        }

        .field > div > [name]:not([type=checkbox]),
        .field > div > [file] {
            display: inline-block;
            position: relative;
            width: 100%;
            outline: 0;
            border-radius: .4rem;
            -webkit-appearance: none;
            box-sizing: border-box;
            margin-top: .1rem;
            padding: .75rem;
            padding-left: 2.5rem;
            border: 1px solid #005D9080;
            opacity: .8;
        }

        [no-icons] .field > div > [name]:not([type=checkbox]),
        [no-icons] .field > div > [file] {
            padding-left: 1rem;
        }

        .field > div > select {
            /* Font Awesome Free 5.15.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) */
            background-image: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z"/></svg>');
            background-repeat: no-repeat;
            background-position: right 1rem top 50%;
            background-size: .65em auto;
        }

        .field > div > cfware-icon[right] ~ input {
            padding-right: 2.5rem;
        }

        .field > div > input[hidden] {
            display: none!important;
        }

        .field > div > textarea {
            height: 11rem;
            resize: none;
        }

        .field > div > [name]:focus,
        .field > div > [file]:focus {
            opacity: 1;
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
            box-shadow: .3rem 0 0 0 #005D9066 inset;
        }

        .field > div > select[name]:focus {
            border-bottom-right-radius: 0;
        }

        .field > div > [name][disabled],
        .field > div > [file][disabled] {
            background-color: #888;
            color: #fff;
            filter: invert(75%);
            transition: all .2s ease-in;
        }

        .field > div > [name][readonly],
        .field > div > [file][readonly] {
            background-color: #888;
            color: #222;
        }

        .field > div > [name]:invalid,
        .field > div > [file]:invalid {
            box-shadow: .3rem 0em 0em 0em #FF5D9066 inset;
            border-color: #FF5D9080;
        }

        input[error-label]:valid {
            display: none;
        }

        input[error-label]:invalid {
            -webkit-appearance: none;
            color: #FF5D90;
            border: none!important;
            outline: 0;
            box-shadow: none;
            font-size: 1.25rem;
            background: transparent;
            width: 100%;
            user-select: none;
            cursor: default;
        }

        .field > div > cfware-icon {
            position: absolute;
            top: .75rem;
            left: .3rem;
            bottom: .75rem;
            width: 2.2rem;
            opacity: .5;
            text-align: center;
        }

        .field > div > cfware-icon[right] {
            left: unset;
            right: .3rem;
        }

        .field > div > input:invalid ~ cfware-icon {
            color: #FF5D90;
        }

        .field > div > input:focus ~ cfware-icon {
            opacity: 1;
        }

        input[type=submit] {
            display: none;
        }

        form button {
            border-radius: .4rem;
            font-size: 1rem;
            font-weight: 700;
            cursor: pointer;
            padding: .8rem 1.5rem;
            margin-left: .25rem;
        }

        form button[type=submit] {
            color: #fff;
            background-color: #6ecff5;
            border-color: #6ecff5;
        }

        form button[type=submit]:hover:not([disabled]) {
            background-color: #1AB8F3;
        }

        form button[disabled],
        form:invalid button[type=submit] {
            background-color: #888;
            color: #222;
            border-color: #888;
            cursor: default;
            transition: all .2s ease-in;
        }
    `
];

export default class FormWrapper extends ShadowElement {
    _form = {};

    [formDirtySelector] = 'button[type=submit]';
    [formMainSpacerTemplate] = html`<div class=space />`;
    [formResetCallback] = () => historyState.back();
    [formResetLabel] = 'CANCEL';
    [formSubmitLabel] = 'SAVE';

    async _actualSubmit(data) {
        try {
            this.disabled = true;
            await this[formSubmit](data);
            this._data = data;
        } catch {}

        this.disabled = false;
    }

    _submit(event) {
        blockEvent(event);

        /* istanbul ignore if */
        if (this.disabled || !this.checkValidity()) {
            return;
        }

        this._actualSubmit(this[formSubmitData]);
    }

    async _loadData() {
        try {
            this.disabled = true;
            this._data = await this[formLoad]();
            this[renderCallbackImmediate]();
            this.disabled = false;
        } catch (error) {
            console.error(error);
        }
    }

    get elements() {
        return this._form.current.elements;
    }

    get _blockButtons() {
        return this.disabled || !this._data || !this._internalValidity();
    }

    _internalValidity() {
        this[formCustomValidity]?.();
        return this._form.current.checkValidity();
    }

    _invalidTagger(valid) {
        const form = this._form.current;
        if (form) {
            for (const invalidTagger of form.querySelectorAll('[tag-invalid]')) {
                form
                    .querySelector(invalidTagger.getAttribute('tag-invalid'))
                    .toggleAttribute('invalid', !valid && invalidTagger.querySelector(':invalid'));
            }
        }
    }

    checkValidity() {
        const valid = this._internalValidity();
        this._updateDirty(!valid);
        this._invalidTagger(valid);

        return valid;
    }

    get [formOriginalData]() {
        return this._data;
    }

    get [formSubmitData]() {
        if (!this._form) {
            return;
        }

        const values = {};
        for (const element of this._form.current.querySelectorAll('[name]')) {
            if (element.hasAttribute('do-not-submit')) {
                continue;
            }

            if (element.type === 'radio' && !element.checked) {
                continue;
            }

            const nameParts = element.name.split('.');
            const lastPart = nameParts.pop();
            let container = values;
            for (const part of nameParts) {
                if (part in container === false) {
                    container[part] = {};
                }

                container = container[part];
            }

            container[lastPart] = getElementValue(element);
        }

        return values;
    }

    static [adoptedStyleSheets] = [
        css`
            :host {
                display: grid;
                overflow: hidden
            }
        `,
        ...formSharedStyles
    ];

    get [formMainTemplate]() {
        return html``;
    }

    get disabled() {
        return this.hasAttribute('disabled');
    }

    set disabled(value) {
        this.toggleAttribute('disabled', value);

        if (this._form.current) {
            for (const element of this._form.current.querySelectorAll('input, textarea')) {
                element.disabled = element.forceDisabled || value;
            }

            this._updateDirty(value);
        }
    }

    get isEdit() {
        return this.objectID !== undefined;
    }

    [formIsDirty](submitData, originalData) {
        return !objectsEqual(submitData, originalData);
    }

    _updateDirty(value = this._blockButtons) {
        const disable = value || !this._data || !this[formIsDirty](this[formSubmitData], this._data);
        for (const element of this._form.current.querySelectorAll(this[formDirtySelector])) {
            element.disabled = disable;
        }
    }

    get [template]() {
        if (this._data) {
            setTimeout(() => {
                this._updateDirty();
                this._invalidTagger();

                const autoFocus = this[formAutoFocus] && this._form.current.querySelector(this[formAutoFocus]);
                if (autoFocus) {
                    /* This is hideous */
                    let focusAttempts = 0;
                    const tryFocus = () => {
                        if (autoFocus.clientHeight) {
                            autoFocus.focus();
                            for (const element of this._form.current.querySelectorAll('input:not([autocomplete])')) {
                                element.autocomplete = 'off';
                            }
                        } else /* istanbul ignore else */ if (focusAttempts < 100) {
                            focusAttempts++;
                            setTimeout(() => tryFocus(), 20);
                        }
                    };

                    tryFocus();
                }
            });
        } else {
            if (this.disabled) {
                return html`An error occurred. <button onclick=${() => historyState.go(0)}>Refresh</button>`;
            }

            setTimeout(() => this._loadData());
        }

        const resetTemplate = this[formResetLabel] ? html`<button type=reset>${this[formResetLabel]}</button>` : '';
        return html`
            <form
                action=#
                method=post
                ref=${this._form}
                onkeyup=${() => this.checkValidity()}
                onchange=${() => this.checkValidity()}
                onsubmit=${event => this._submit(event)}
                onreset=${this[formResetCallback]}
            >
                <div class=form>
                    ${this[formMainTemplate]}
                </div>

                ${this[formMainSpacerTemplate]}

                <div class=buttons>
                    <span />
                    <button type=submit disabled>${this[formSubmitLabel]}</button>
                    ${resetTemplate}
                </div>
            </form>
        `;
    }
}
