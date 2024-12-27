export const outputHistogram = ({histogram, numEntries, height = 100}) => {
    const numBins = histogram.length;
    const max = Math.max(...histogram);
    const scale = Math.max(1 / max, 0.2 * numBins / numEntries);
   
    const canvas = document.createElement('canvas');
    canvas.width = numBins;
    canvas.height = height;
    document.body.appendChild(canvas);
    canvas.style.background = '#000';
    const ctx = canvas.getContext('2d');
   
    ctx.fillStyle = '#fff';
   
    for (let x = 0; x < numBins; ++x) {
      const v = histogram[x] * scale * height;
      ctx.fillRect(x, height - v, 1, v);
    }
  
}