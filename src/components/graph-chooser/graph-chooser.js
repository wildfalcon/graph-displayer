import React from 'react';
import ReactDOM from 'react-dom';
import GraphChooser from './react/GraphChooser';
import { html, LitElement } from 'lit-element';

export class GraphChooserWebComponent extends LitElement {
  static get properties() {
      return {
          config: { type: Object },
      };
  }

  constructor() {
      super();
      this.raiseGraphChosen = this.raiseGraphChosen.bind(this);
  }

  raiseGraphChosen(detail) {
      this.dispatchEvent(new CustomEvent("graphChosen", {
          bubbles: true,
          cancelable: false,
          composed: true,
          detail
      }));
  }
  render() {
      const config = this.getAttribute('config');

      ReactDOM.render(<GraphChooser
          localStorage={localStorage}
          config={config}
          raiseGraphChosen={this.raiseGraphChosen}
      />, this);
      return html`
          <slot></slot>
      `;
  }
}