function setup() {
  createCanvas(windowWidth,windowHeight);
  
  angleMode(DEGREES)
  rectMode(CENTER) 
}

let 크기 = 100;

function draw() {
  background(0, 0, 0);
  translate(width/2, height/2)
  noFill()
  stroke(255)
  
  for(i = 0; i<200; i++){
    push()
    
      let r = map(i,0,200,100,1)
      let g = map(cos(frameCount),-1,1,100,1)
      let b = map(sin(frameCount),1,-1,0,265)
      
      stroke(r,g,b)
    
      let m = map(cos(frameCount),1,-1,0,300)  
    
    rect(sin(frameCount+i*2)*100,cos(frameCount+i*5)*100, 600-i*2, 600-i*2, m)
    
      
    pop()
  }
  
}