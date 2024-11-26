let table;
let outflows = {}; // Oggetto per memorizzare gli outflows e i fiumi associati

function preload() {
  //file di riferimento .CSV
  table = loadTable('Rivers.csv', 'csv', 'header');
}

function setup() {
  createCanvas(windowWidth, windowHeight); //  responsive
  textFont('Gill Sans'); 
  noLoop();

  //fiumi in base al loro outflows
  for (let i = 0; i < table.getRowCount(); i++) {
    let row = table.getRow(i);
    let riverName = row.getString('name'); 
    let outflow = row.getString('outflow');
    
    //controlla se esite un outflows del fiumee
    if (!outflows[outflow]) {
      outflows[outflow] = [];
    }
    
    // Aggiunge il nome fiume alla lista 
    outflows[outflow].push(riverName);
  }

  //l'altezza del canvas in base ai dati
  let totalElements = table.getRowCount(); 
  resizeCanvas(windowWidth, max(windowHeight, totalElements * 20 + 300)); 
}

function draw() {
  //colore dello sfondo
  let bgColor = getResponsiveBackgroundColor(windowWidth);
  background(bgColor); 
  // titolo
  drawTitle();

  //layout per i dati 
  let leftMargin = width * 0.25; 
  let rightMargin = width * 0.75; 
  let textOffset = 30; 
  let lineSpacing = (height - 200) / (table.getRowCount() + 2); // Spaziatura dinamica tra i fiumi
  let radius = 10; // Raggio dei cerchi 

  // Posizioni dinamiche degli sbocchi
  let outflowPositions = {}; 
  let index = 0;

  // Posiziona i cerchi degli sbocchi uniformemente
  let outflowSpacing = (height - 200) / (Object.keys(outflows).length + 1);
  for (let outflow in outflows) {
    let yPos = outflowSpacing * (index + 3); 
    outflowPositions[outflow] = yPos;

    
    let numRivers = outflows[outflow].length;
    let outflowColor = getOutflowColor(numRivers);
    fill(outflowColor);
    noStroke();
    ellipse(rightMargin, yPos, radius * 4);

    //il nome dello sbocco, spostato a destra del cerchio
    fill(255);
    textSize(14);
    textAlign(LEFT, CENTER);
    text(outflow, rightMargin + textOffset, yPos);

    index++;
  }

  //nomi dei fiumi e le linee
  for (let i = 0; i < table.getRowCount(); i++) {
    let row = table.getRow(i);
    let riverName = row.getString('name');  
    let outflow = row.getString('outflow');

  
    let yPos = lineSpacing * (i + 1) + 100;
    // Posizione corrispondente ai mari
    let outflowPosY = outflowPositions[outflow];
    //considera 'area' dati
    let area = row.getNum('area');

    // Spessore della linea in base all'area 
    let lineThickness = map(area, 1000, 3000000, 1, 8);
    //colore in base a 'length'
    let length = row.getNum('length');
    let riverColor = getRiverColor(length);

    // Posizione iniziale della linea
    let startX = leftMargin + 80; 
    drawCurvedLine(startX, yPos, rightMargin, outflowPosY, riverColor, lineThickness);

    // Allinea il nome del fiume a destra 
    fill(255);
    noStroke();
    textSize(12);
    textAlign(RIGHT, CENTER);
    text(riverName, startX - 10, yPos);
  }

    // legenda
  drawLegend();
}

// il colore del fiume in base alla lunghezza (5 livelli di colore)
function getRiverColor(length) {
  let colorValue;
  
  //dal più corto al più lungo 
  if (length < 1400) {
    colorValue = color(204, 255, 255); 
  } else if (length < 2800) {
    colorValue = color(153, 204, 255); 
  } else if (length < 4200) {
    colorValue = color(102, 153, 255); 
  } else if (length < 5600) {
    colorValue = color(51, 102, 255); 
  } else {
    colorValue = color(0, 51, 255); 
  }

  return colorValue;
}

//Funzione per ottenere il colore del outflows in base al numero di fiumi associati
function getOutflowColor(numRivers) {
  let colorValue;

 
  if (numRivers <= 2) {
    colorValue = color(238, 174, 255);
  } else if (numRivers <= 5) {
    colorValue = color(204, 129, 255); 
  } else if (numRivers <= 8) {
    colorValue = color(153, 51, 255); 
  } else if (numRivers <= 12) {
    colorValue = color(102, 0, 204); 
  } else {
    colorValue = color(51, 0, 102); 
  }

  return colorValue;
}

//per disegnare una linea curva dal nome del fiume al cerchio di outflows
function drawCurvedLine(xStart, yStart, xEnd, yEnd, riverColor, lineThickness) {
  noFill();
  stroke(riverColor); 
  strokeWeight(lineThickness); 

  //punti di controllo per la curva
  let controlPointX1 = xStart + (xEnd - xStart) * 0.3; 
  let controlPointX2 = xStart + (xEnd - xStart) * 0.7; 
  bezier(xStart, yStart, controlPointX1, yStart, controlPointX2, yEnd, xEnd, yEnd);
}

//titolo legensa
function drawTitle() {
  fill(255); 
  textSize(48);
  textAlign(CENTER, CENTER);
  text('Rivers in the World', width / 2, 80); 
}

// per rendere responsive lo sfondo 
function getResponsiveBackgroundColor(windowWidth) {
  let r = map(windowWidth, 300, 2000, 0, 20); 
  let g = map(windowWidth, 300, 2000, 0, 20); 
  let b = map(windowWidth, 300, 2000, 40, 80); 

  return color(r, g, b); 
}

// Funzione per disegnare la legenda
function drawLegend() {
  let legendX = width * 0.02;
  let legendY = height * 0.78;
  let boxWidth = 50;
  let boxHeight = 20;
  let radius = 10; 
  
  fill(255); 
  textSize(14);
  textAlign(LEFT, CENTER);
  
  //titolo dei fiumi
  textSize(16);
  textStyle(BOLD);
  text('Rivers', legendX, legendY - 30); 
  textStyle(NORMAL);
  
  
  let riverColors = [color(204, 255, 255), color(153, 204, 255), color(102, 153, 255), color(51, 102, 255), color(0, 51, 255)];
  let riverLabels = ['< 1400 km', '1400 - 2800 km', '2800 - 4200 km', '4200 - 5600 km', '>= 5600 km'];

  for (let i = 0; i < riverColors.length; i++) {
    fill(riverColors[i]);
    rect(legendX, legendY + i * (boxHeight + 10), boxWidth, boxHeight, radius); 
    fill(255); 
    textSize(12);
    text(riverLabels[i], legendX + boxWidth + 10, legendY + i * (boxHeight + 10) + boxHeight / 2);
  }


  textSize(11);
  textAlign(LEFT, CENTER);
  text('Line thickness: the greater the river area, the thicker the line', legendX, legendY + riverColors.length * (boxHeight + 10) + 20);
  
  //titolo degli outflow
  textSize(16);
  textStyle(BOLD);
  text('Outflows', legendX, legendY + (riverColors.length + 2) * (boxHeight + 10) + 10); // Moved higher
  textStyle(NORMAL);

  
  let outflowColors = [color(238, 174, 255), color(204, 129, 255), color(153, 51, 255), color(102, 0, 204), color(51, 0, 102)];
  let outflowLabels = ['1-2 rivers', '3-5 rivers', '6-8 rivers', '9-12 rivers', '> 12 rivers'];

  for (let i = 0; i < outflowColors.length; i++) {
    fill(outflowColors[i]);
    rect(legendX, legendY + (riverColors.length + i + 3) * (boxHeight + 10), boxWidth, boxHeight, radius); 
    fill(255); 
    textSize(12);
    text(outflowLabels[i], legendX + boxWidth + 10, legendY + (riverColors.length + i + 3) * (boxHeight + 10) + boxHeight / 2);
  }
}