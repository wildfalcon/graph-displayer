import React, { useEffect, useState, useRef } from 'react';
import pdfjsLib from "@bundled-es-modules/pdfjs-dist/build/pdf";
import { isEmptyObject, px, getImageDataAsDataUrl } from '../../../Utils';


pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

const GraphDisplayer = props => {
  const getConfig = () => {
    return JSON.parse(props.config);
  };
  
  const { raiseGraphClicked } = props;
  const config = getConfig();
  const {
    coords,
    pdfUrl,
    width,
    height,
    pageIndex,
    pdfScale
  } = config;

  const noConfig = isEmptyObject(config);
  
  const [pdf, setPdf] = useState(null);
  const [page, setPage] = useState(null);
  const [dataUrl, setDataUrl] = useState(null);
  
  const refImage = useRef(null);
  
  const graphClicked = ev => {
    raiseGraphClicked({
      message: 'Graph clicked',
      coords,
      dataUrl
    });
  };
  
  useEffect(() => {
    const loadPdf = async () => {
      const pdf = await pdfjsLib.getDocument({
        url: pdfUrl
      }).promise;
      
      setPdf(pdf);
    };

    loadPdf(pdfUrl);
  }, [pdfUrl]);
  
  useEffect(() => {
    const loadPage = async pdf => {
      const page = await pdf.getPage(pageIndex + 1);
      setPage(page);
    };
    if (pdf) {
      loadPage(pdf);
    }
  }, [pdf, pageIndex]);
  
  useEffect(() => {
    const renderPage = async page => {
      const viewport = page.getViewport({ scale: pdfScale });
      const canvas = document.createElement('canvas');
      const canvasContext = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      await page.render({
        canvasContext,
        viewport
      }).promise;
      
      setDataUrl(getImageDataAsDataUrl(
        canvas, coords.x, coords.y, coords.w, coords.h
        ));
      };
      if (page) {
        renderPage(page);
      }
    }, [page, coords, pdfScale]);
    
  useEffect(() => {
    refImage.current.src = dataUrl;
  }, [dataUrl]);

  const imageStyle = {
    width: px(width),
    height: px(height),
    display: noConfig ? 'none' : 'block'
}
  
  return (
    <div className='graph-displayer' onClick={graphClicked}>
      <img ref={refImage} style={imageStyle} alt='' />
    </div>
  )
}
  
export default GraphDisplayer;