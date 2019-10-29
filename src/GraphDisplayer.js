import React from 'react';
// import pdfjsLib from "pdfjs-dist";

// import './style.scss';
// import { isEmptyObject, px, getImageDataAsDataUrl } from '../../../Utils';

// pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

const GraphDisplayer = props => {
  const getConfig = () => {
    return JSON.parse(props.config);
  };

  const { raiseGraphClicked } = props;
  const graphClicked = ev => {
    raiseGraphClicked({
      message: "Graph Clicked",
    })
  }

  const config = getConfig();
  const {name} = config; 

    return (
        <div className='graph-displayer' onClick={graphClicked}>
            <p>Hello {name}</p>
        </div>
    )
}

export default GraphDisplayer;