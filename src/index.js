import React from 'react';
import ReactDOM from 'react-dom';

import ToolbarContainer from './toolbarContainer';
import Toolbar from './toolbar';

const HISTORY_LENGTH = 100;
const MAX_TRIES_READY = 10000;
const CHECK_READY_DELAY = 100;
const MOVING = 'moving';


function hasAttr(obj, attr) {
  return Object.prototype.hasOwnProperty.call(obj, attr);
}


class VisualizerBase {
  constructor(config) {
    this.canvas = config.canvas;
    this.toolbar = config.toolbar;
    this.toolbarContainer = null;
    this.itemInfo = config.itemInfo;

    this.active = hasAttr(config, 'active') ? config.active : true;
    if (hasAttr(config, 'activator')) {
      this.activator = () => {
        this.activate();
        config.activator();
      };
    } else {
      this.activator = () => this.activate();
    }

    // State variables
    this.ready = false;
    this.configHistory = [];
    this.state = MOVING;
    this.states = {
      MOVING,
      ...this.getStates(),
    };

    // Bind user defined events to canvas
    this.events = this.getEvents();
    this.bindEvents();
    // Add on window size change behaviour, if defined
    if (typeof this.onWindowResize === 'function') {
      window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    this.renderToolbar(() => {
      this.adjustSize();
      this.init();
    });
  }

  /* eslint-disable class-methods-use-this */

  getStates() {
    // abstract method
    return {};
  }

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

  resetConfig() {
    // abstract method
  }

  /* eslint-disable no-unused-vars */

  setConfig(configs) {
    // abstract method
  }

  /* eslint-disable no-unused-vars */

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

  saveConfig() {
    this.configHistory.push(this.getConfig());
    if (this.configHistory.length > HISTORY_LENGTH) {
      this.configHistory.shift();
    }
  }

  restoreConfig() {
    if (this.configHistory.length > 0) {
      this.setConfig(this.configHistory.pop());
      this.draw();
      this.emitUpdateEvent();
    }
  }

  discardConfig() {
    if (this.configHistory.length > 0) {
      this.configHistory.pop();
    }
  }

  setState(state) {
    this.state = state;
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

  activate() {
    this.active = true;

    if (this.toolbarContainer.setState) {
      this.toolbarContainer.setState({ active: true });
    }
  }

  deactivate() {
    this.active = false;

    if (this.toolbarContainer.setState) {
      this.toolbarContainer.setState({ active: false });
    }
  }

  toggleActivate() {
    this.active = !this.active;

    if (this.toolbarContainer.setState) {
      this.toolbarContainer.setState((state) => ({ active: !state.active }));
    }
  }

  setActivator(activator) {
    this.activator = () => {
      activator();
      this.activate();
    };

    if (this.toolbarContainer.setState) {
      this.toolbarContainer.setState({ activator: this.activator });
    }
  }

  getToolbarComponent(props) {
    return <Toolbar {...props} />;
  }

  renderToolbar(callback) {
    ReactDOM.render(
      <ToolbarContainer
        ref={(ref) => { this.toolbarContainer = ref; }}
        component={(props) => this.getToolbarComponent(props)}
        active={this.active}
        state={this.state}
        states={this.states}
        setState={(state) => this.setState(state)}
        activator={() => this.activator()}
        resetConfig={() => this.resetConfig()}
        restoreConfig={() => this.restoreConfig()}
      />,
      this.toolbar,
      callback,
    );
  }

  getItemUrl() {
    return this.itemInfo.url;
  }

  waitUntilReady() {
    let tries = 0;

    return new Promise((resolve, reject) => {
      const checkIfReady = () => {
        // Will reject the promise after many tries.
        if (tries > MAX_TRIES_READY) {
          reject(new Error('Visualizer has taken to long to be ready'));
        }

        if (this.ready) {
          resolve();
        } else {
          tries += 1;
          setTimeout(checkIfReady, CHECK_READY_DELAY);
        }
      };

      checkIfReady();
    });
  }
}

export default VisualizerBase;
