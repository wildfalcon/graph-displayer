Graph Displayer is a WebComponent that displays a graph extracted from a PDF file inside an `<img>` tag

(Actually it can display any rectangular extract from a PDF file, however it's intended use is for 
displaying graphs)

# Usage

## Install

Install the WebComponent loader, On the command line run:

``npm i @webcomponents/webcomponentsjs ``


Install Graph Displayer from npm. On the command line run:

``npm i @wildfalcon/graph-displayer``

## Import

Use ``<scipt>`` tags to import both into your html:

```
<script src="node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js" defer></script> 
<script src='node_modules/@wildfalcon/graph-displayer/dist/index.js'></script>
```

## HTML

You can then use ``<graph-displayer>`` as if it were a html tag:

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

## Events

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



## Configure

`coords`: x and y cordinate from the top left of the PDF, height and width of rectangle to extract

`pdfUrl`: URL of the PDF to display 

`pageIndex`: which page of the PDF to extact from 

`pdfScale`: Zoom scale of the PDF

`width`: display width of the component (currently ignored)

`height`: display height of the component (currently ignored)

# Development

Graph Displayer is a React Component wrapped inside a WebComponent. The WebComponent is contructed using the [Lit-Element](https://lit-element.polymer-project.org/) library

The WebComponent is defined in `src/components/graph-diplayer/graph-displayer.js` and the React component is in `src/components/graph-displayer/react/GraphDisplayer.js`

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