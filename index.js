class VisualizerBase {
  constructor(config) {
    this.canvas = config.canvas;
    this.itemInfo = config.itemInfo;

    if (Object.prototype.hasOwnProperty.call(config, 'active')) {
      this.active = config.active;
    } else {
      this.active = true;
    }

    if (Object.prototype.hasOwnProperty.call(config, 'activator')) {
      this.activator = config.activator;
    } else {
      this.activator = () => this.toggleActivate();
    }

    this.events = this.getEvents();

    this.adjustSize();
    this.init();

    // Bind user defined events to canvas
    this.bindEvents();

    // Add on window size change behaviour, if defined
    if (typeof this.onWindowResize === 'function') {
      window.addEventListener('resize', this.onWindowResize.bind(this));
    }
  }

  /* eslint-disable class-methods-use-this */

  getEvents() {
    // abstract method
  }

  init() {
    // abstract method
  }

  draw() {
    // abstract method
  }

  getConfig() {
    // abstract method
  }

  /* eslint-disable no-unused-vars */

  setConfig(configs) {
    // abstract method
  }

  /* eslint-disable no-unused-vars */

  renderToolbar() {
    // abstract method
    // Should return a React component
  }

  canvasToPoint(p) {
    // abstract method
    return p;
  }

  pointToCanvas(p) {
    // abstract method
    return p;
  }

  validatePoints(p) {
    // abstract method
    return p;
  }

  emitUpdateEvent() {
    const event = new CustomEvent('visualizer-update');
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach((canvas) => canvas.dispatchEvent(event));
  }

  /* eslint-disable class-methods-use-this */

  createPoint(x, y) {
    const p = new DOMPoint();
    p.x = x;
    p.y = y;
    return p;
  }

  adjustSize() {
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  activate() {
    this.active = true;
  }

  deactivate() {
    this.active = false;
  }

  toggleActivate() {
    this.active = !this.active;
  }

  getMouseEventPosition(event) {
    const x = event.offsetX || (event.pageX - this.canvas.offsetLeft);
    const y = event.offsetY || (event.pageY - this.canvas.offsetTop);

    return this.pixelToCoords(this.createPoint(x, y));
  }

  pixelToCoords(p) {
    return this.createPoint(
      p.x / this.canvas.width,
      p.y / this.canvas.height,
    );
  }

  coordsToPixel(p) {
    return this.createPoint(
      p.x * this.canvas.width,
      p.y * this.canvas.height,
    );
  }

  bindEvents() {
    Object.keys(this.events).forEach((eventType) => {
      let listeners = this.events[eventType];

      if (!(Array.isArray(listeners))) {
        listeners = [listeners];
      }

      listeners.forEach((listener) => {
        this.canvas.addEventListener(eventType, listener, false);
      });
    });
  }

  unmount() {
    Object.keys(this.events).forEach((eventType) => {
      let listeners = this.events[eventType];

      if (!(Array.isArray(listeners))) {
        listeners = [listeners];
      }

      listeners.forEach((listener) => {
        this.canvas.removeEventListener(eventType, listener);
      });
    });
  }
}

export default VisualizerBase;
