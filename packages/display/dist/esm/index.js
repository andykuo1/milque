var INNER_HTML = "<div class=\"container\">\r\n    <label class=\"hidden\" id=\"title\">display-port</label>\r\n    <label class=\"hidden\" id=\"fps\">00</label>\r\n    <label class=\"hidden\" id=\"dimension\">0x0</label>\r\n    <canvas></canvas>\r\n    <slot></slot>\r\n</div>";

var INNER_STYLE = ":host{display:inline-block;color:#555}.container{display:flex;position:relative;width:100%;height:100%}canvas{background:#000;margin:auto;-ms-interpolation-mode:nearest-neighbor;image-rendering:-moz-crisp-edges;image-rendering:pixelated}label{font-family:monospace;color:currentColor;position:absolute}#title{left:.5rem;top:.5rem}#fps{right:.5rem;top:.5rem}#dimension{left:.5rem;bottom:.5rem}.hidden{display:none}:host([debug]) .container{outline:6px dashed rgba(0,0,0,.1);outline-offset:-4px;background-color:rgba(0,0,0,.1)}:host([mode=noscale]) canvas{margin:0;top:0;left:0}:host([mode=center]),:host([mode=fit]),:host([mode=stretch]){width:100%;height:100%}:host([full]){width:100vw!important;height:100vh!important}:host([disabled]){display:none}slot{display:flex;flex-direction:column;align-items:center;justify-content:center;position:absolute;width:100%;height:100%;top:0;left:0;pointer-events:none}::slotted(*){pointer-events:auto}";

const MODE_NOSCALE = 'noscale';
const MODE_FIT = 'fit';
const MODE_STRETCH = 'stretch';
const DEFAULT_WIDTH = 300;
const DEFAULT_HEIGHT = 150;
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

  static get properties() {
    return {
      width: Number,
      height: Number,
      disabled: Boolean,
      debug: Boolean,
      mode: {
        type: String,
        value: 'fit',
        observed: false
      }
    };
  }

  get mode() {
    return this.getAttribute("mode");
  }

  set mode(value) {
    this.setAttribute("mode", value);
  }

  get debug() {
    return this._debug;
  }

  set debug(value) {
    this.toggleAttribute("debug", value);
  }

  get disabled() {
    return this._disabled;
  }

  set disabled(value) {
    this.toggleAttribute("disabled", value);
  }

  get height() {
    return this._height;
  }

  set height(value) {
    this.setAttribute("height", String(value));
  }

  get width() {
    return this._width;
  }

  set width(value) {
    this.setAttribute("width", String(value));
  }

  static get customEvents() {
    return ['frame'];
  }
  /** @override */


  get onframe() {
    return this._onframe;
  }

  set onframe(value) {
    if (this._onframe) this.removeEventListener("frame", this._onframe);
    this._onframe = value;
    if (this._onframe) this.addEventListener("frame", value);
  }

  static get observedAttributes() {
    return ["onframe", "width", "height", "disabled", "debug", 'id', 'class'];
  }

  constructor() {
    super();
    this.attachShadow({
      mode: 'open'
    });
    this.shadowRoot.appendChild(this.constructor[Symbol.for("cuttleTemplate")].content.cloneNode(true));
    this.shadowRoot.appendChild(this.constructor[Symbol.for("cuttleStyle")].cloneNode(true));
    this._canvasElement = this.shadowRoot.querySelector('canvas');
    this._titleElement = this.shadowRoot.querySelector('#title');
    this._fpsElement = this.shadowRoot.querySelector('#fps');
    this._dimensionElement = this.shadowRoot.querySelector('#dimension');
    this._animationRequestHandle = 0;
    this._prevAnimationFrameTime = 0;
    this._width = DEFAULT_WIDTH;
    this._height = DEFAULT_HEIGHT;
    this._onframe = null;
    this.update = this.update.bind(this);
  }

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
      this.setAttribute("mode", 'fit');
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

  pause() {
    cancelAnimationFrame(this._animationRequestHandle);
  }

  resume() {
    this._animationRequestHandle = requestAnimationFrame(this.update);
  }

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

    if (canvas.clientWidth !== canvasWidth || canvas.clientHeight !== canvasHeight) {
      canvas.width = this._width;
      canvas.height = this._height;
      canvas.style = `width: ${canvasWidth}px; height: ${canvasHeight}px`;
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

export { DisplayPort };
