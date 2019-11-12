import {SimpleWebComponent} from './components/simple-web-component/simple-web-component.js'
import {GraphDisplayerWebComponent} from './components/graph-displayer/graph-displayer.js'
import {GraphChooserWebComponent} from './components/graph-chooser/graph-chooser.js'


window.customElements.define('simple-web-component', SimpleWebComponent);  
window.customElements.define('graph-displayer', GraphDisplayerWebComponent);  
window.customElements.define('graph-chooser', GraphChooserWebComponent);  
