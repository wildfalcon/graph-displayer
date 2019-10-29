// Convert part of a Canvas into a dataURL
export function getImageDataAsDataUrl(canvas, x, y, width, height) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(x, y, width, height);

  const canvas2 = document.createElement('canvas');
  canvas2.width = width;// * 2;
  canvas2.height = height;// * 2;
  // canvas2.scale = 1;
  const ctx2 = canvas2.getContext('2d');

  ctx2.putImageData(imageData, 0, 0);
  const dataUrl = ctx2.canvas.toDataURL();
  return dataUrl;
}
