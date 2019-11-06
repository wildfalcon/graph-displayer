import { html, LitElement } from 'lit-element';

export class SimpleWebComponent extends LitElement {
  render(){
    return html`<p>Hello, I'm a simple web component</p>`;
  }
}