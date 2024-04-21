const calculateX = (square: string, isFlipped: boolean) => {
  const squareSize = 64; /* Specify the width of each square */
  let columnIndex = square.charCodeAt(0) - 'a'.charCodeAt(0); // Convert column letter to index
  if (isFlipped) {
    columnIndex = 7 - columnIndex; // Reverse the column index if the board is flipped
  }

  return columnIndex * squareSize + squareSize / 2;
};

const calculateY = (square: string, isFlipped: boolean) => {
  const squareSize = 64; /* Specify the height of each square */
  let rowIndex = 8 - parseInt(square[1]); // Convert row number to index (assuming rank 1 is at the bottom)
  if (isFlipped) {
    rowIndex = 7 - rowIndex; // Reverse the row index if the board is flipped
  }
  return rowIndex * squareSize + squareSize / 2;
};
export const drawArrow = (
  ctx: CanvasRenderingContext2D,
  start: string,
  end: string,
  isFlipped: boolean,
) => {
  const startX = calculateX(start, isFlipped);
  const startY = calculateY(start, isFlipped);
  const endX = calculateX(end, isFlipped);
  const endY = calculateY(end, isFlipped);

  // Draw arrow
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.strokeStyle = '#EC923F';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw arrowhead
  const angle = Math.atan2(endY - startY, endX - startX);
  const arrowheadSize = 15; // Adjust arrowhead size as needed
  const arrowheadX1 = endX - arrowheadSize * Math.cos(angle - Math.PI / 6);
  const arrowheadY1 = endY - arrowheadSize * Math.sin(angle - Math.PI / 6);
  const arrowheadX2 = endX - arrowheadSize * Math.cos(angle + Math.PI / 6);
  const arrowheadY2 = endY - arrowheadSize * Math.sin(angle + Math.PI / 6);

  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(arrowheadX1, arrowheadY1);
  ctx.moveTo(endX, endY);
  ctx.lineTo(arrowheadX2, arrowheadY2);
  ctx.strokeStyle = '#EC923F';
  ctx.lineWidth = 2;
  ctx.stroke();
};
