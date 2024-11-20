let table;
let outflows = {}; // Oggetto per memorizzare sbocchi (seas) e i fiumi associati

function preload() {
  //file di riferimento .CSV
  table = loadTable('Rivers.csv', 'csv', 'header');
}

function setup() {
  // Imposta il canvas per adattarsi alle dimensioni della finestra
  createCanvas(windowWidth, windowHeight); // Canvas responsivo
  textFont('Gill Sans'); // Font per titolo e testi
  noLoop();

  // Organizza i fiumi in base al loro sbocco
  for (let i = 0; i < table.getRowCount(); i++) {
    let row = table.getRow(i);
    let riverName = row.getString('name'); // Nome del fiume
    let outflow = row.getString('outflow');
    
    // Crea un array per lo sbocco se non esiste
    if (!outflows[outflow]) {
      outflows[outflow] = [];
    }
    
    // Aggiunge il fiume alla lista dello sbocco
    outflows[outflow].push(riverName);
  }

  // Aggiorna dinamicamente l'altezza del canvas in base ai dati
  let totalElements = table.getRowCount(); // Numero totale di fiumi
  resizeCanvas(windowWidth, max(windowHeight, totalElements * 20 + 300)); // 300px per lo spazio del titolo
}

function draw() {
  // Aggiorna il colore di sfondo in base alla larghezza della finestra
  let bgColor = getResponsiveBackgroundColor(windowWidth);
  background(bgColor); // Colore di sfondo responsivo

  // Disegna il titolo
  drawTitle();

  // Parametri di layout per i dati (partendo dopo il titolo)
  let leftMargin = width * 0.25; // Margine sinistro per il nome dei fiumi
  let rightMargin = width * 0.75; // Posizione per i cerchi degli sbocchi
  let textOffset = 30; // Distanza tra cerchio e nome del mare
  let lineSpacing = (height - 200) / (table.getRowCount() + 2); // Spaziatura dinamica tra i fiumi
  let radius = 10; // Raggio dei cerchi degli sbocchi

  // Posizioni dinamiche degli sbocchi
  let outflowPositions = {}; // Posizioni verticali degli sbocchi
  let index = 0;

  // Posiziona i cerchi degli sbocchi uniformemente
  let outflowSpacing = (height - 200) / (Object.keys(outflows).length + 1);
  for (let outflow in outflows) {
    let yPos = outflowSpacing * (index + 3); // Spaziatura verticale dinamica
    outflowPositions[outflow] = yPos;

    // Colore in base al numero di fiumi associati
    let numRivers = outflows[outflow].length;
    let outflowColor = getOutflowColor(numRivers);

    // Disegna il cerchio dello sbocco senza bordo
    fill(outflowColor);
    noStroke();
    ellipse(rightMargin, yPos, radius * 4);

    // Aggiunge il nome dello sbocco (mare), spostato a destra del cerchio
    fill(255); // Testo bianco
    textSize(14);
    textAlign(LEFT, CENTER);
    text(outflow, rightMargin + textOffset, yPos);

    index++;
  }

  // Disegna i nomi dei fiumi e le linee
  for (let i = 0; i < table.getRowCount(); i++) {
    let row = table.getRow(i);
    let riverName = row.getString('name');  // Nome del fiume
    let outflow = row.getString('outflow');

    // Posizione verticale dinamica per i fiumi
    let yPos = lineSpacing * (i + 1) + 100;

    // Posizione corrispondente dello sbocco
    let outflowPosY = outflowPositions[outflow];

    // Calcola l'area del fiume
    let area = row.getNum('area');

    // Spessore della linea in base all'area del fiume (ridotto)
    let lineThickness = map(area, 1000, 3000000, 1, 8);

    // Colore del fiume (può restare basato sulla lunghezza se necessario)
    let length = row.getNum('length');
    let riverColor = getRiverColor(length);

    // Posizione iniziale della linea
    let startX = leftMargin + 80; // La linea inizia a 80px dalla sinistra
    drawCurvedLine(startX, yPos, rightMargin, outflowPosY, riverColor, lineThickness);

    // Allinea il nome del fiume a destra del margine sinistro
    fill(255);
    noStroke();
    textSize(12);
    textAlign(RIGHT, CENTER);
    text(riverName, startX - 10, yPos);
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
  text('Line thickness: the greater the river area, the thicker the line', legendX, legendY + riverColors.length * (boxHeight + 10) + 20);
  
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
