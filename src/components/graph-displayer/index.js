import { GraphDisplayerWebComponent } from './graph-displayer.js';
if (!customElements.get('graph-displayer')) {
  window.customElements.define('graph-displayer', GraphDisplayerWebComponent);  
}