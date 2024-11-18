let table;
let outflows = {}; // Object to store seas (outflows) and associated rivers

function preload() {
  // Load the CSV file
  table = loadTable('Rivers.csv', 'csv', 'header');
}

function setup() {
  // Impostiamo il canvas per adattarsi alle dimensioni della finestra
  createCanvas(windowWidth, windowHeight); // Make the canvas responsive to window size
  textFont('Gill Sans'); // Font for title and texts
  noLoop();

  // Organize rivers based on their outflow
  for (let i = 0; i < table.getRowCount(); i++) {
    let row = table.getRow(i);
    let riverName = row.getString('name');  // River name from the "name" column
    let outflow = row.getString('outflow');
    
    // Create outflow array if it doesn't exist
    if (!outflows[outflow]) {
      outflows[outflow] = [];
    }
    
    // Add the river to the outflow's list
    outflows[outflow].push(riverName);
  }

  // Aggiorna dinamicamente l'altezza del canvas in base ai dati
  let totalElements = table.getRowCount(); // Total number of rivers
  resizeCanvas(windowWidth, max(windowHeight, totalElements * 20 + 300)); // 300px space for the title
}

function draw() {
  // Aggiorniamo il colore di sfondo in base alla larghezza della finestra
  let bgColor = getResponsiveBackgroundColor(windowWidth);
  background(bgColor); // Colore di sfondo responsivo

  // Draw title
  drawTitle();

  // Layout parameters for data (starting after the title)
  let leftMargin = width * 0.25; // Adjusted for responsive design
  let rightMargin = width * 0.75; // Left-aligned position for outflow circles (centered)
  let textOffset = 30; // Distance between circle and sea name
  let lineSpacing = (height - 200) / (table.getRowCount() + 2); // Dynamic space between rivers (adjust for title space)
  let radius = 10; // Radius of the outflow circles

  // Dynamic positions of outflows
  let outflowPositions = {}; // Store horizontal positions of seas
  let index = 0;

  // Position outflow circles evenly
  let outflowSpacing = (height - 200) / (Object.keys(outflows).length + 1); // Adjusted for title space
  for (let outflow in outflows) {
    let yPos = outflowSpacing * (index + 3); // Vertical dynamic space
    outflowPositions[outflow] = yPos;

    // Calculate color based on the number of rivers
    let numRivers = outflows[outflow].length;
    let outflowColor = getOutflowColor(numRivers); // Function to determine color based on rivers

    // Draw the outflow circle with no stroke
    fill(outflowColor);
    noStroke(); // Remove circle border
    ellipse(rightMargin, yPos, radius * 4);

    // Add the sea name (outflow), shifted to the right of the circle
    fill(255); // White color for text
    textSize(14);
    textAlign(LEFT, CENTER);
    text(outflow, rightMargin + textOffset, yPos); // Shifted right from the circle

    index++;
  }

  // Draw river names and lines below the title
  for (let i = 0; i < table.getRowCount(); i++) {
    let row = table.getRow(i);
    let riverName = row.getString('name');  // River name
    let outflow = row.getString('outflow');

    // Dynamic vertical position for rivers
    let yPos = lineSpacing * (i + 1) + 100; // Start below the title

    // Corresponding outflow position
    let outflowPosY = outflowPositions[outflow];

    // Calculate the river length
    let length = row.getNum('length');

    // Map the length to 5 intervals, from shortest to longest
    let riverColor = getRiverColor(length);

    // Calculate the line thickness based on river length
    let lineThickness = map(length, 1000, 7000, 2, 10); // Thickness ranging from 2 to 10px

    // Line start position: use a fixed position for all rivers
    let startX = leftMargin + 80; // Line starts 80px from the left (shifted further left)
    drawCurvedLine(startX, yPos, rightMargin, outflowPosY, riverColor, lineThickness); // Draw the line from the text

    // Align river name to the right of the left margin
    fill(255); // White color for text
    noStroke(); // Remove outline from text
    textSize(12); // Set a constant size for all river names
    textAlign(RIGHT, CENTER); // Align to the right of the left margin
    text(riverName, startX - 10, yPos); // Position closer to the start of the line (add space if needed)
  }

  // Draw the legend
  drawLegend();
}

// Function to get the river color based on length (5 color levels)
function getRiverColor(length) {
  let colorValue;
  
  // Map length to 5 intervals, from shortest to longest
  if (length < 1400) {
    colorValue = color(204, 255, 255); // Lighter color
  } else if (length < 2800) {
    colorValue = color(153, 204, 255); // Lighter but darker than the first
  } else if (length < 4200) {
    colorValue = color(102, 153, 255); // Intermediate color
  } else if (length < 5600) {
    colorValue = color(51, 102, 255); // Darker color
  } else {
    colorValue = color(0, 51, 255); // Very dark color
  }

  return colorValue;
}

// Function to get the outflow color based on the number of rivers associated
function getOutflowColor(numRivers) {
  let colorValue;

  // Map number of rivers to 5 color intervals (light to dark purple)
  if (numRivers <= 2) {
    colorValue = color(238, 174, 255); // Light purple
  } else if (numRivers <= 5) {
    colorValue = color(204, 129, 255); // Medium light purple
  } else if (numRivers <= 8) {
    colorValue = color(153, 51, 255); // Medium purple
  } else if (numRivers <= 12) {
    colorValue = color(102, 0, 204); // Dark purple
  } else {
    colorValue = color(51, 0, 102); // Very dark purple
  }

  return colorValue;
}

// Function to draw a curved line from the river name to the outflow circle
function drawCurvedLine(xStart, yStart, xEnd, yEnd, riverColor, lineThickness) {
  noFill();
  stroke(riverColor); // Use the calculated river color for the line
  strokeWeight(lineThickness); // Use the calculated line thickness

  // Draw a curved line
  let controlPointX1 = xStart + (xEnd - xStart) * 0.3; // Left control point
  let controlPointX2 = xStart + (xEnd - xStart) * 0.7; // Right control point
  bezier(xStart, yStart, controlPointX1, yStart, controlPointX2, yEnd, xEnd, yEnd);
}

// Function to draw the title
function drawTitle() {
  fill(255); // White color for title text
  textSize(48);
  textAlign(CENTER, CENTER);
  text('Rivers in the World', width / 2, 80); // Centered title at the top of the canvas
}

// Function to get the responsive background color based on window width
function getResponsiveBackgroundColor(windowWidth) {
  // Change background color to much darker shades
  let r = map(windowWidth, 300, 2000, 0, 20); // Darker red
  let g = map(windowWidth, 300, 2000, 0, 20); // Darker green
  let b = map(windowWidth, 300, 2000, 40, 80); // Darker blue

  return color(r, g, b); // Return dark color based on the window width
}

// Funzione per disegnare la legenda
function drawLegend() {
  let legendX = width * 0.02;
  let legendY = height * 0.78;
  let boxWidth = 50;
  let boxHeight = 20;
  let radius = 10; // Radius for rounded corners of rectangles
  
  fill(255); // White color for text
  textSize(14);
  textAlign(LEFT, CENTER);
  
  // Title for rivers
  textSize(16);
  textStyle(BOLD);
  text('Rivers', legendX, legendY - 30); // Position of the Rivers title
  textStyle(NORMAL);
  
  // Legend for river colors
  let riverColors = [color(204, 255, 255), color(153, 204, 255), color(102, 153, 255), color(51, 102, 255), color(0, 51, 255)];
  let riverLabels = ['< 1400 km', '1400 - 2800 km', '2800 - 4200 km', '4200 - 5600 km', '>= 5600 km'];

  for (let i = 0; i < riverColors.length; i++) {
    fill(riverColors[i]);
    rect(legendX, legendY + i * (boxHeight + 10), boxWidth, boxHeight, radius); 
    fill(255); // White text color
    textSize(12);
    text(riverLabels[i], legendX + boxWidth + 10, legendY + i * (boxHeight + 10) + boxHeight / 2);
  }

  // Line thickness description
  textSize(11);
  textAlign(LEFT, CENTER);
  text('Line thickness: the greater the river length, the thicker the line', legendX, legendY + riverColors.length * (boxHeight + 10) + 20);
  
  // Title for Outflows (moved higher)
  textSize(16);
  textStyle(BOLD);
  text('Outflows', legendX, legendY + (riverColors.length + 2) * (boxHeight + 10) + 10); // Moved higher
  textStyle(NORMAL);

  // Legend for outflow colors
  let outflowColors = [color(238, 174, 255), color(204, 129, 255), color(153, 51, 255), color(102, 0, 204), color(51, 0, 102)];
  let outflowLabels = ['1-2 rivers', '3-5 rivers', '6-8 rivers', '9-12 rivers', '> 12 rivers'];

  for (let i = 0; i < outflowColors.length; i++) {
    fill(outflowColors[i]);
    rect(legendX, legendY + (riverColors.length + i + 3) * (boxHeight + 10), boxWidth, boxHeight, radius); 
    fill(255); // White text color
    textSize(12);
    text(outflowLabels[i], legendX + boxWidth + 10, legendY + (riverColors.length + i + 3) * (boxHeight + 10) + boxHeight / 2);
  }
}
