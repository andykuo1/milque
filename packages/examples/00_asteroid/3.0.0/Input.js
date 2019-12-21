import { Keyboard, Mouse } from './InputDevices.js';

export const KEYBOARD = new Keyboard().setEventHandler(handleEvent);
export const MOUSE = new Mouse().setEventHandler(handleEvent);

let contexts = [];

export function clear()
{
    contexts.length = 0;
}

export function poll()
{
    // TODO: Nothing as of yet...
}

export function createContext()
{
    return {
        inputs: [],
        createInput(...keys)
        {
            let result = { key: keys, value: false, prev: false, context: this };
            this.inputs.push(result);
            return result;
        },
        active: false,
        toggle(force = undefined)
        {
            if (typeof force === 'undefined') force = !this.active;
            if (this.active === force) return;

            this.active = force;

            if (this.active)
            {
                contexts.push(this);
            }
            else
            {
                contexts.splice(contexts.indexOf(this), 1);
            }
            return this;
        }
    };
}

export function handleEvent(eventKey, value)
{
    const key = eventKey.substring(eventKey.indexOf('[') + 1, eventKey.indexOf(']'));
    const mode = eventKey.substring(eventKey.indexOf('.') + 1);
    value = mode === 'down' || mode === 'repeat';

    for(let context of contexts)
    {
        if (context.active)
        {
            for(let input of context.inputs)
            {
                if (input.key.includes(key) || input.key.includes('*'))
                {
                    let prev = input.value;
                    if (prev !== value)
                    {
                        input.value = value;
                        input.prev = prev;
                    }
                }
            }
        }
    }
}
