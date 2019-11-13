This package contains two WebComponnents useful when identifying Graphs in a PDF file, and displaying them as images:

  * **Graph Chooser** is WebComponent that displays a PDF and allows the user to identify graphs associated with "outcomes"

  * **Graph Displayer** is a WebComponent that displays a graph extracted from a PDF file inside an `<img>` tag

These packages are intended to identify and extract graphs from PDFs, but there is no reason they cannot be used to identify and display any rectangular area in a PDF


# Setup Instructions

## Install

Install the WebComponent loader, On the command line run:

``npm i @webcomponents/webcomponentsjs ``


Install Graph Displayer from npm. On the command line run:

``npm i @wildfalcon/graph-displayer``

## Import

Use ``<scipt>`` tags to import the webcomponent libs and the graph-displayer compoennts into your html:

```
<script src="node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js"></script> 
<script src='node_modules/@wildfalcon/graph-displayer/dist/index.js'></script>
```

# Usage Instructions


## The \<graph-chooser> component
 
### HTML

You can  use ``<graph-chooser>`` as if it were a html tag:

```
<graph-chooser id="graph-chooser" config='{
  "fileUrl": "/public/Curto-Reyes_2010.pdf",
  "outcomes": [
    {"id": "guid1", "label":"Outcome 1"},
    {"id": "guid2", "label":"Outcome 2"},
    {"id": "guid3", "label":"Outcome 3"}
  ]
}'></graph-chooser>
```

### Events

`graphChosen`: This event is emitted after the user has associated one or more graphs with outcomes, and then clicked the button at the top right of the component, entitled "use selected graphs". The event can be subscribed to as shown below:


```
<script>
  window.addEventListener('load', async loadEvent => {
    const graph_chooser = document.getElementById('graph-chooser');    
    graph_chooser.addEventListener('graphChosen', event => {
      console.log('graphChosen recieved:', event);
    })      
  });
</script>
```



### Configuration 

`fileUrl`: URL of the PDF to display 

`outcomes`: An array of objects, each containing an `id` and a `label` property. Describes the IDs and Labels of the outcomes the user is expected to identify graphs for.


## The \<graph-displayer> component
 
### HTML

You can  use ``<graph-displayer>`` as if it were a html tag:

```
<graph-displayer id="graph-displayer" config='{
      "coords": {"x": 100, "y":70, "w":200, "h": 200},
      "pdfUrl": "http://localhost:8080/path-to/file.pdf",
      "width": 200,
      "height": 200,
      "pageIndex": 5,
      "pdfScale" : 1
    }'></graph-displayer>
```

### Events

`graphClicked`: This event is emitted by any click action on the graph. The event can be subscribed to as shown below:

```
<script>
  window.addEventListener('load', async loadEvent => {
    const graph_displayer = document.getElementById('graph-displayer');
    graph_displayer.addEventListener('graphClicked', event => {
      console.log('graphClick recieved:', event);
    })
  });
</script>
  ```

### Configuration 

`coords`: x and y cordinate from the top left of the PDF, height and width of rectangle to extract

`pdfUrl`: URL of the PDF to display 

`pageIndex`: which page of the PDF to extact from 

`pdfScale`: Zoom scale of the PDF

`width`: display width of the component (currently ignored)

`height`: display height of the component (currently ignored)

# Development

GraphChooser and GraphDisplayer are both React Component wrapped inside a WebComponent. The WebComponents are contructed using the [Lit-Element](https://lit-element.polymer-project.org/) library.

The WebComponent is defined in `src/components/graph-diplayer/graph-displayer.js` and the React component is in `src/components/graph-displayer/react/GraphDisplayer.js`

Conventions:

`Web Components` are hypehnated. eg \<graph-displayer> or \<graph-chooser>. They are defined in `index.html` with the ``customElements.define()`` javascript method.

`Web Component Classes` have the same name as component with the `WebComponent` suffix. They are defined in CamelCase e.g. ``GraphChooserWebComponent``. They are defined in ``src/components/\<component-name>/\<component-name>.js``

`React Components` have the same name as the component in Camel Case e.g. ``GraphChooser``. They are defined in ``src/components/\<component-name>/react\<ComponentName>.js``

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `dist` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.