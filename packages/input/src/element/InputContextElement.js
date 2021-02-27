import { attachShadowTemplate, properties } from '@milque/cuttle.macro';

import INNER_HTML from './InputContextElement.template.html';
import INNER_STYLE from './InputContextElement.module.css';

import { InputContext } from '../InputContext.js';
import { hasInputEventSource, InputSource } from '../source/InputSource';

function upgradeProperty(element, propertyName)
{
    if (Object.prototype.hasOwnProperty.call(element, propertyName))
    {
        let value = element[propertyName];
        delete element[propertyName];
        element[propertyName] = value;
    }
}

export class InputContextElement extends HTMLElement
{
    static get [properties]()
    {
        return {
            // src: A custom type,
            for: String,
            disabled: Boolean,
        };
    }

    /** @override */
    static get observedAttributes()
    {
        return [
            'src',
            // Listening for built-in attribs
            'id',
            'class',
        ];
    }

    constructor()
    {
        super();
        attachShadowTemplate(this, INNER_HTML, INNER_STYLE, { mode: 'open' });

        this._inputContext = new InputContext();

        this._mapElement = this.shadowRoot.querySelector('input-map');
        this._sourceElement = this.shadowRoot.querySelector('input-source');

        this.onInputMapLoad = this.onInputMapLoad.bind(this);
        this.onInputSourcePoll = this.onInputSourcePoll.bind(this);

        this._mapElement.addEventListener('load', this.onInputMapLoad);
        this._sourceElement.addEventListener('poll', this.onInputSourcePoll);
    }

    get context() { return this._inputContext; }
    get source() { return this._sourceElement; }
    get map() { return this._mapElement.map; }

    onInputMapLoad()
    {
        let source = this._sourceElement;
        let map = this._mapElement.map;
        if (source && map)
        {
            this._inputContext
                .setInputMap(map)
                .setInputSource(source)
                .attach();
            this._inputContext.disabled = this._disabled;
        }
    }

    onInputSourcePoll()
    {
        for(let [inputName, entries] of Object.entries(this._mapElement.mapElements))
        {
            let value = this._inputContext.getInputValue(inputName);
            let primary = entries[0];
            let outputElement = primary.querySelector('output');
            outputElement.innerText = Number(value).toFixed(2);
        }
    }
    
    /** @override */
    connectedCallback()
    {
        upgradeProperty(this, 'src');
    }

    /** @override */
    attributeChangedCallback(attribute, prev, value)
    {
        switch(attribute)
        {
            case 'for':
                {
                    // TODO: Need to revisit whether this is a good way to set autopoll.
                    let targetElement = document.getElementById(value);
                    // Enable autopoll if input source is unset.
                    let flag = hasInputEventSource(value ? targetElement : this._sourceElement);
                    if (!flag)
                    {
                        this._sourceElement.autopoll = true;
                    }

                    if (targetElement instanceof InputSource && targetElement._eventTarget)
                    {
                        this._sourceElement.setEventTarget(targetElement._eventTarget);
                        this._sourceElement.className = targetElement.className;
                        this._sourceElement.id = targetElement.id;
                    }
                    else
                    {
                        this._sourceElement.for = value;
                    }

                    let source = this._sourceElement;
                    let map = this._mapElement.map;
                    if (map)
                    {
                        this._inputContext
                            .setInputMap(map)
                            .setInputSource(source)
                            .attach();
                        this._inputContext.disabled = this._disabled;
                    }
                }
                break;
            case 'src':
                this._mapElement.src = value;
                break;
            case 'disabled':
                {
                    let source = this._sourceElement;
                    let map = this._mapElement.map;
                    if (source && map)
                    {
                        this._inputContext.disabled = this._disabled;
                    }
                }
                break;
            // For debug info
            case 'id':
                this._sourceElement.id = value;
                break;
            case 'class':
                this._sourceElement.className = value;
                break;
        }
    }

    get src() { return this._mapElement.src; }
    set src(value) { this._mapElement.src = value; }
}
window.customElements.define('input-context', InputContextElement);
