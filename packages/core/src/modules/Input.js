/**
 * @module Input
 * @version 1.0.1
 */

import * as InputSource from '../input/InputSource.js';
import * as InputContext from '../input/InputContext.js';
import * as Utils from './Utils.js';

var source = InputSource.createSource();
var context = InputContext.createContext().attach(source);

// Default setup...
Utils.onDOMLoaded(() => {
    if (!source.element)
    {
        let canvasElement = null;

        // Try resolve to <display-port> if exists...
        let displayElement = document.querySelector('display-port');
        if (displayElement)
        {
            canvasElement = displayElement.getCanvas();
        }
        // Otherwise, find a <canvas> element...
        else
        {
            canvasElement = document.querySelector('canvas');
        }

        if (canvasElement)
        {
            attachCanvas(canvasElement);
        }
    }
});

export function attachCanvas(canvasElement)
{
    if (source.element) source.detach();
    return source.attach(canvasElement);
}

export function createContext(priority = 0, active = true)
{
    return InputContext.createContext().setPriority(priority).toggle(active).attach(source);
}

export function createInput(adapter)
{
    return context.registerInput(getNextInputName(), adapter);
}

export function createAction(...eventKeyStrings)
{
    return context.registerAction(getNextInputName(), ...eventKeyStrings);
}

export function createRange(eventKeyString)
{
    return context.registerRange(getNextInputName(), eventKeyString);
}

export function createState(eventKeyMap)
{
    return context.registerState(getNextInputName(), eventKeyMap);
}

export function poll()
{
    return source.poll();
}

export function handleEvent(eventKeyString, value)
{
    return source.handleEvent(eventKeyString, value);
}

var nextInputNameId = 1;
function getNextInputName()
{
    return `__input#${nextInputNameId++}`;
}