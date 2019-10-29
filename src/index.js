import { html, LitElement } from '@polymer/lit-element';
import React from 'react';
import ReactDOM from 'react-dom';
import GraphDisplayer from './GraphDisplayer';



/**
 * The LitElement class is an ultra-light wrapper for the W3C HTMLElement class.
 * It is published by the Polymer team, and provides helpers for templating, binding and lifecycle functions.
 * refer: https://github.com/Polymer/lit-element
 *
 * For info on 'slot' tag, refer to:
 *  https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot#Browser_compatibility
 *  On browsers that do not natively support 'slot' elements, the webcomponentjs module will polyfill this.
 *
 *  This approach means that W3C standards can be used in consuming apps to pull in component apps,
 *  without any framework lockin.  The aim is that shared webcomponents can use whichever framework
 *  becomes popular over time, without consumers needing to know anything more than the webcomponent api.
 *
 */

class GraphDisplayerWebComponent extends LitElement {
  static get properties() {
      return {
          config: { type: Object },
      };
  }
  constructor() {
      super();
      this.raiseGraphClicked = this.raiseGraphClicked.bind(this);
  }
  raiseGraphClicked(detail) {
      this.dispatchEvent(new CustomEvent("graphClicked", {
          bubbles: true,
          cancelable: false,
          composed: true,
          detail
      }));
  }
  render() {
      const config = this.getAttribute('config');

      ReactDOM.render(<GraphDisplayer
          config={config}
          raiseGraphClicked={this.raiseGraphClicked}
      />, this);
      return html`
          <slot></slot>
      `;
  }
}

customElements.define('graph-displayer', GraphDisplayerWebComponent);