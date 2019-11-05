import { html, LitElement } from '@polymer/lit-element';

export class SimpleWebComponent extends LitElement {
  render(){
    return html`<p>Hello, I'm a simple web component</p>`;
  }
}