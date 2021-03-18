'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var INNER_HTML = "<div class=\"container\">\n    <label class=\"hidden\" id=\"title\">display-port</label>\n    <label class=\"hidden\" id=\"fps\">00</label>\n    <label class=\"hidden\" id=\"dimension\">0x0</label>\n    <div class=\"content\">\n        <canvas></canvas>\n        <slot id=\"inner\"></slot>\n    </div>\n    <slot name=\"frame\"></slot>\n</div>";

var INNER_STYLE = ":host{display:inline-block;color:#555}.container{display:flex;position:relative;width:100%;height:100%}.content{position:relative;margin:auto}.content>*{width:100%;height:100%}canvas{background:#000;-ms-interpolation-mode:nearest-neighbor;image-rendering:-moz-crisp-edges;image-rendering:pixelated}label{font-family:monospace;color:currentColor}#inner,label{position:absolute}#inner{display:flex;flex-direction:column;align-items:center;justify-content:center;top:0;left:0;pointer-events:none}#title{left:.5rem;top:.5rem}#fps{right:.5rem;top:.5rem}#dimension{left:.5rem;bottom:.5rem}.hidden{display:none}:host([debug]) .container{outline:6px dashed rgba(0,0,0,.1);outline-offset:-4px;background-color:rgba(0,0,0,.1)}:host([mode=noscale]) canvas{margin:0;top:0;left:0}:host([mode=center]),:host([mode=fit]),:host([mode=stretch]){width:100%;height:100%}:host([full]){width:100vw!important;height:100vh!important}:host([disabled]){display:none}slot{display:flex;flex-direction:column;align-items:center;justify-content:center;position:absolute;width:100%;height:100%;top:0;left:0;pointer-events:none}::slotted(*){pointer-events:auto}";

/**
 * No scaling is applied. The canvas size maintains a 1:1 pixel ratio to the defined
 * display dimensions.
 */

const MODE_NOSCALE = 'noscale';
/**
 * Scales the canvas to fill the entire viewport and maintains the same aspect ratio
 * with respect to the defined display dimensions. In effect, this will upscale and
 * downscale the pixel size depending on the viewport resolution and aspect ratio. This
 * is the default scaling mode.
 */

const MODE_FIT = 'fit';
/**
 * Scales the canvas to fill the entire viewport. This does not maintain the aspect
 * ratio. If you care about aspect ratio, consider using 'fit' mode instead.
 */

const MODE_STRETCH = 'stretch'; // The default display dimensions. This is the same as the canvas element default.

const DEFAULT_WIDTH = 300;
const DEFAULT_HEIGHT = 150; // The default display scaling mode.

const DEFAULT_MODE = MODE_FIT;
/**
 * @typedef {CustomEvent} FrameEvent
 * @property {number} detail.now The current time in milliseconds.
 * @property {number} detail.prevTime The previous frame time in milliseconds.
 * @property {number} detail.deltaTime The time taken between the current and previous frame in milliseconds.
 * @property {HTMLCanvasElement} detail.canvas The canvas element.
 */

/**
 * A canvas that can scale and stretch with respect to the aspect ratio to fill
 * the viewport size.
 * 
 * To start drawing, you should get the canvas context like so:
 * 
 * For Canvas2D:
 * ```
 * const display = document.querySelector('display-port');
 * const ctx = display.canvas.getContext('2d');
 * ctx.drawText(0, 0, 'Hello World!');
 * ```
 * 
 * For WebGL:
 * ```
 * const display = document.querySelector('display-port');
 * const gl = display.canvas.getContext('webgl');
 * gl.clear(gl.COLOR_BUFFER_BIT);
 * ```
 * 
 * Usually, you would want to set the `width` and `height` attributes to define
 * the canvas size and aspect ratio in pixels. You can also change the scaling
 * behavior by setting the `mode` attribute.
 * 
 * And for convenience, this element also dispatches a `frame` event every animation
 * frame (60 fps). This is basically the same as calling `requestAnimationFrame()`.
 * 
 * NOTE: The viewport size is usually the parent container size. However, in the
 * rare case the element must be nested in a child container, you can define the
 * boolean attribute `full` to force the dimensions to be the actual window size.
 */

class DisplayPort extends HTMLElement {
  /** Generated by cuttle.js */
  static get [Symbol.for("cuttleTemplate")]() {
    let t = document.createElement("template");
    t.innerHTML = INNER_HTML;
    Object.defineProperty(this, Symbol.for("cuttleTemplate"), {
      value: t
    });
    return t;
  }

  /** Generated by cuttle.js */
  static get [Symbol.for("cuttleStyle")]() {
    let s = document.createElement("style");
    s.innerHTML = INNER_STYLE;
    Object.defineProperty(this, Symbol.for("cuttleStyle"), {
      value: s
    });
    return s;
  }

  /** @override */
  static get observedAttributes() {
    return ["onframe", "width", "height", "disabled", "debug", 'id', 'class'];
  }

  static get properties() {
    return {
      /** The canvas width in pixels. This determines the aspect ratio and canvas buffer size. */
      width: Number,

      /** The canvas height in pixels. This determines the aspect ratio and canvas buffer size. */
      height: Number,

      /** If disabled, animation frames will not fire. */
      disabled: Boolean,

      /** Enable for debug information. */
      debug: Boolean,

      /**
       * The scaling mode.
       * - `noscale`: Does not perform scaling. This is effectively the same as a regular
       * canvas.
       * - `center`: Does not perform pixel scaling but stretches the display to fill the
       * entire viewport. The unscaled canvas is centered.
       * - `fit`: Performs scaling to fill the entire viewport and maintains the aspect
       * ratio. This is the default behavior.
       * - `stretch`: Performs scaling to fill the entire viewport but does not maintain
       * aspect ratio.
       */
      mode: {
        type: String,
        value: DEFAULT_MODE,
        observed: false
      }
    };
  }

  /**
               * The scaling mode.
               * - `noscale`: Does not perform scaling. This is effectively the same as a regular
               * canvas.
               * - `center`: Does not perform pixel scaling but stretches the display to fill the
               * entire viewport. The unscaled canvas is centered.
               * - `fit`: Performs scaling to fill the entire viewport and maintains the aspect
               * ratio. This is the default behavior.
               * - `stretch`: Performs scaling to fill the entire viewport but does not maintain
               * aspect ratio.
               */
  get mode() {
    return this.getAttribute("mode");
  }

  set mode(value) {
    this.setAttribute("mode", value);
  }

  /** Enable for debug information. */
  get debug() {
    return this._debug;
  }

  set debug(value) {
    this.toggleAttribute("debug", value);
  }

  /** If disabled, animation frames will not fire. */
  get disabled() {
    return this._disabled;
  }

  set disabled(value) {
    this.toggleAttribute("disabled", value);
  }

  /** The canvas height in pixels. This determines the aspect ratio and canvas buffer size. */
  get height() {
    return this._height;
  }

  set height(value) {
    this.setAttribute("height", String(value));
  }

  /** The canvas width in pixels. This determines the aspect ratio and canvas buffer size. */
  get width() {
    return this._width;
  }

  set width(value) {
    this.setAttribute("width", String(value));
  }

  static get customEvents() {
    return [
    /** Fired every animation frame. */
    'frame'];
  }

  /** Fired every animation frame. */
  get onframe() {
    return this._onframe;
  }

  set onframe(value) {
    if (this._onframe) this.removeEventListener("frame", this._onframe);
    this._onframe = value;
    if (this._onframe) this.addEventListener("frame", value);
  }

  constructor() {
    super();
    this.attachShadow({
      mode: 'open'
    });
    this.shadowRoot.appendChild(this.constructor[Symbol.for("cuttleTemplate")].content.cloneNode(true));
    this.shadowRoot.appendChild(this.constructor[Symbol.for("cuttleStyle")].cloneNode(true));
    /** @private */

    this._canvasElement = this.shadowRoot.querySelector('canvas');
    /** @private */

    this._contentElement = this.shadowRoot.querySelector('.content');
    /** @private */

    this._innerElement = this.shadowRoot.querySelector('#inner');
    /** @private */

    this._titleElement = this.shadowRoot.querySelector('#title');
    /** @private */

    this._fpsElement = this.shadowRoot.querySelector('#fps');
    /** @private */

    this._dimensionElement = this.shadowRoot.querySelector('#dimension');
    /** @private */

    this._animationRequestHandle = 0;
    /** @private */

    this._prevAnimationFrameTime = 0;
    /** @private */

    this._width = DEFAULT_WIDTH;
    /** @private */

    this._height = DEFAULT_HEIGHT;
    /** @private */

    this.update = this.update.bind(this);
  }
  /** Get the canvas element. */


  get canvas() {
    return this._canvasElement;
  }
  /** @override */


  connectedCallback() {
    if (Object.prototype.hasOwnProperty.call(this, "onframe")) {
      let value = this.onframe;
      delete this.onframe;
      this.onframe = value;
    }

    if (Object.prototype.hasOwnProperty.call(this, "width")) {
      let value = this.width;
      delete this.width;
      this.width = value;
    }

    if (Object.prototype.hasOwnProperty.call(this, "height")) {
      let value = this.height;
      delete this.height;
      this.height = value;
    }

    if (Object.prototype.hasOwnProperty.call(this, "disabled")) {
      let value = this.disabled;
      delete this.disabled;
      this.disabled = value;
    }

    if (Object.prototype.hasOwnProperty.call(this, "debug")) {
      let value = this.debug;
      delete this.debug;
      this.debug = value;
    }

    if (Object.prototype.hasOwnProperty.call(this, "mode")) {
      let value = this.mode;
      delete this.mode;
      this.mode = value;
    }

    if (!this.hasAttribute("mode")) {
      this.setAttribute("mode", DEFAULT_MODE);
    }

    // Allows this element to be focusable
    if (!this.hasAttribute('tabindex')) this.setAttribute('tabindex', 0);
    this.updateCanvasSize();
    this.resume();
  }

  /** @override */
  disconnectedCallback() {
    this.pause();
  }
  /** @override */


  attributeChangedCallback(attribute, prev, value) {
    /** Generated by cuttle.js */
    switch (attribute) {
      case "width":
        {
          this._width = Number(value);
        }
        break;

      case "height":
        {
          this._height = Number(value);
        }
        break;

      case "disabled":
        {
          this._disabled = value !== null;
        }
        break;

      case "debug":
        {
          this._debug = value !== null;
        }
        break;

      case "onframe":
        {
          this.onframe = new Function('event', 'with(document){with(this){' + value + '}}').bind(this);
        }
        break;
    }

    ((attribute, prev, value) => {
      switch (attribute) {
        case 'disabled':
          if (value) {
            this.update(0);
            this.pause();
          } else {
            this.resume();
          }

          break;
        // NOTE: For debugging purposes...

        case 'id':
        case 'class':
          this._titleElement.innerHTML = `display-port${this.className ? '.' + this.className : ''}${this.hasAttribute('id') ? '#' + this.getAttribute('id') : ''}`;
          break;

        case 'debug':
          this._titleElement.classList.toggle('hidden', value);

          this._fpsElement.classList.toggle('hidden', value);

          this._dimensionElement.classList.toggle('hidden', value);

          break;
      }
    })(attribute, prev, value);
  }
  /** Pause animation of the display frames. */


  pause() {
    cancelAnimationFrame(this._animationRequestHandle);
  }
  /** Resume animation of the display frames. */


  resume() {
    this._animationRequestHandle = requestAnimationFrame(this.update);
  }
  /** @private */


  update(now) {
    this._animationRequestHandle = requestAnimationFrame(this.update);
    this.updateCanvasSize();
    const deltaTime = now - this._prevAnimationFrameTime;
    this._prevAnimationFrameTime = now; // NOTE: For debugging purposes...

    if (this.debug) {
      // Update FPS...
      const frames = deltaTime <= 0 ? '--' : String(Math.round(1000 / deltaTime)).padStart(2, '0');

      if (this._fpsElement.innerText !== frames) {
        this._fpsElement.innerText = frames;
      } // Update dimensions...


      if (this.mode === MODE_NOSCALE) {
        let result = `${this._width}x${this._height}`;

        if (this._dimensionElement.innerText !== result) {
          this._dimensionElement.innerText = result;
        }
      } else {
        let result = `${this._width}x${this._height}|${this.shadowRoot.host.clientWidth}x${this.shadowRoot.host.clientHeight}`;

        if (this._dimensionElement.innerText !== result) {
          this._dimensionElement.innerText = result;
        }
      }
    }

    this.dispatchEvent(new CustomEvent('frame', {
      detail: {
        now,
        prevTime: this._prevAnimationFrameTime,
        deltaTime: deltaTime,
        canvas: this._canvasElement
      },
      bubbles: false,
      composed: true
    }));
  }
  /** @private */


  updateCanvasSize() {
    let clientRect = this.shadowRoot.host.getBoundingClientRect();
    const clientWidth = clientRect.width;
    const clientHeight = clientRect.height;
    let canvas = this._canvasElement;
    let canvasWidth = this._width;
    let canvasHeight = this._height;
    const mode = this.mode;

    if (mode === MODE_STRETCH) {
      canvasWidth = clientWidth;
      canvasHeight = clientHeight;
    } else if (mode !== MODE_NOSCALE) {
      let flag = clientWidth < canvasWidth || clientHeight < canvasHeight || mode === MODE_FIT;

      if (flag) {
        let ratioX = clientWidth / canvasWidth;
        let ratioY = clientHeight / canvasHeight;

        if (ratioX < ratioY) {
          canvasWidth = clientWidth;
          canvasHeight = canvasHeight * ratioX;
        } else {
          canvasWidth = canvasWidth * ratioY;
          canvasHeight = clientHeight;
        }
      }
    }

    canvasWidth = Math.floor(canvasWidth);
    canvasHeight = Math.floor(canvasHeight);
    let fontSize = Math.min(canvasWidth / this._width, canvasHeight / this._height) * 0.5; // NOTE: Update the inner container for the default slotted children.
    // To anchor children outside the canvas, use the slot named 'frame'.

    this._innerElement.style = `font-size: ${fontSize}em`;

    if (canvas.clientWidth !== canvasWidth || canvas.clientHeight !== canvasHeight) {
      canvas.width = this._width;
      canvas.height = this._height;
      this._contentElement.style = `width: ${canvasWidth}px; height: ${canvasHeight}px`;
      this.dispatchEvent(new CustomEvent('resize', {
        detail: {
          width: canvasWidth,
          height: canvasHeight
        },
        bubbles: false,
        composed: true
      }));
    }
  }

}
window.customElements.define('display-port', DisplayPort);

exports.DisplayPort = DisplayPort;
