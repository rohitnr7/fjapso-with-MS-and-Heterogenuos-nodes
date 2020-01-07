const w = 100,
  h = 100,
  minCN = 8,
  maxCN = 12,
  vMin = -4,
  vMax = 4,
  N = 15,
  nodeCount = 100,
  percent = 0.25,
  alpha = 0.04,
  beta = 0.96,
  eElec = 50 * 0.000000001,
  Efs = 10*0.000000000001,
  Emp = 0.0013*0.000000000001,
  Eda = 5 * 0.000000001,
  dThreshold = 75, //Math.sqrt(Efs / Emp),
  packetLength = 215,
  advertisePacketLength = 25,
  iterations = 40,
  c1 = 2,
  c2 = 2;

let population = null;
let sinks = [];
let inertia = 0.94
let currentIteration = 0;
let pSize=50
let numberOfNodes = 100
let energy = null;
let dead = null;
let deadCount = 0;
let fitnessHistory = [];
let advanced=0.1;
let intermediate=0.2;
let normal=0.7;
let nodeType=[];


function setup() {
    createCanvas(400, 400);

    // On tips of rectangle
    // sinks.push({x: 100, y: 100})
    // sinks.push({x: 100, y: 200})
    //  sinks.push({x: 200, y: 100})
    //  sinks.push({x: 200, y: 200})


    //  sinks.push({x: 60, y: 60})
    // sinks.push({x: 60, y: 240})
    //  sinks.push({x: 240, y: 60})
    //  sinks.push({x: 240, y: 240})

    // sinks.push({x: 10, y: 25})
    // sinks.push({x: 275, y: 25})
    // sinks.push({x: 10, y: 275})
    // sinks.push({x: 275, y: 275})

    sinks.push({x: 150, y: 275})
    
    // energy = new Array(numberOfNodes).fill(2)
    energy = [];
    dead = [];
    for (let i = 0; i < numberOfNodes*advanced; i++) {
      nodeType.push("A");
      energy.push(3);
    }
    for (let i = 0; i < numberOfNodes*intermediate; i++) {
      nodeType.push("I");
      energy.push(2.5);
    }
    for (let i = 0; i < numberOfNodes*normal; i++) {
      nodeType.push("N")
      energy.push(2);
    }
    // console.log(energy)


    population = new Population(pSize);
    population.boot(numberOfNodes);
    // frameRate(5)
}

function draw () {
    background(0)
    //rectangle 
    noFill()
    strokeWeight(0.5)
    stroke(255)
    rect(100,100,w + 5,h + 5)
    // Display the sinks
    fill(0, 0, 255);
    noStroke()
    for (let i = 0; i < sinks.length; i++) {
        ellipse(sinks[i].x, sinks[i].y, 4, 4)
    }
    population.display();
    population.update();
    currentIteration++;
    if(currentIteration == iterations) {
      noLoop();
      // console.log(fitnessHistory)
      population.advertiseMessage();
      let lifeTime = 0;
      goOn = true;
      while(goOn) {
        lifeTime++;
        population.drainEnergy();
        energy.forEach((value) => {
          if (value <= 0) {
            goOn = false;
            console.log(lifeTime)
          }
        });
      }
    }
}



