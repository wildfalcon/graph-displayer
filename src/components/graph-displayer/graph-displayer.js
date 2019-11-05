
import React from 'react';
import ReactDOM from 'react-dom';
import GraphDisplayer from './react/GraphDisplayer';
import { html, LitElement } from 'lit-element';

export class GraphDisplayerWebComponent extends LitElement {
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

