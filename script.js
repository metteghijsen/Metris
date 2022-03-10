document.addEventListener('DOMContentLoaded', () => {
    const music = new Audio('Tetris.mp3');
    const grid = document.querySelector('.grid') //maakt variabele van de grid
    let squares = Array.from(document.querySelectorAll('.grid div')) //maakt array van alle div's (vierkantjes)
    const scoreDisplay = document.querySelector('#score')
    const startBtn = document.querySelector('#start-button')
    const muteBtn = document.querySelector('#mute-button')
    const width = 10 //in onze grid passen maximaal 10 pixels op een rijtje, omdat deze 200 breed is en de pixels 20x20 zijn.
    let nextRandom = 0;
    let timerId
    let score = 0;
    const colors = [
        '#f8f875',
        '#ff6363',
        '#B28DFF',
        '#41b34a',
        '#6EB5FF'
    ]

    if (typeof music.loop == 'boolean')
    {
        music.loop = true;
    }
    else
    {
        music.addEventListener('ended', function() {
            this.currentTime = 0;
            this.play();
        }, false);
    }

    //de tetrisvormpjes (tetromino)
    const lTetromino = [ //L vormpje
        [1, width+1, width*2+1, 2], //rotatie 1
        [width, width+1, width+2, width*2+2], //rotatie 2
        [1, width+1, width*2+1, width*2], //rotatie 3
        [width, width*2, width*2+1, width*2+2] //rotatie 4
    ]

    const zTetromino = [ //Z vormpje
        [0,width,width+1,width*2+1], //rotatie 1
        [width+1, width+2,width*2,width*2+1], //rotatie 2
        [0,width,width+1,width*2+1], //rotatie 3
        [width+1, width+2,width*2,width*2+1] //rotatie 4
    ]

    const tTetromino = [ //T vormpje
        [1,width,width+1,width+2], //rotatie 1
        [1,width+1,width+2,width*2+1], //rotatie 2
        [width,width+1,width+2,width*2+1], //rotatie 3
        [1,width,width+1,width*2+1] //rotatie 4
    ]

    const oTetromino = [  //O vormpje (vierkant)
        [0,1,width,width+1], //rotatie 1
        [0,1,width,width+1], //rotatie 2
        [0,1,width,width+1], //rotatie 3
        [0,1,width,width+1] //rotatie 4
    ]

    const iTetromino = [ //i-vormpje
        [1,width+1,width*2+1,width*3+1], //rotatie 1
        [width,width+1,width+2,width+3], //rotatie 2
        [1,width+1,width*2+1,width*3+1], //rotatie 3
        [width,width+1,width+2,width+3] //rotatie 4
    ]

    const theTetrominoes = [lTetromino,zTetromino,tTetromino,oTetromino,iTetromino]
    let currentPosition = 4
    let currentRotation = 0

    //random tetromino en eerste rotatie
    let random = Math.floor(Math.random()*theTetrominoes.length)
    let current = theTetrominoes[random][currentRotation] //eerste rotatie eerste vorm

    //teken tetromino
    function draw(){
        current.forEach(index=> {
            squares[currentPosition + index].classList.add('tetromino')
            squares[currentPosition + index].style.backgroundColor = colors[random]
        })
    }

    //haal tetromino weg
    function undraw(){
        current.forEach(index =>{
            squares[currentPosition + index].classList.remove('tetromino')
            squares[currentPosition + index].style.backgroundColor = ''
        })
    }

    //functies toevoegen aan toetsen
    function control(e){
        if(e.keyCode === 65 || e.keyCode === 37){ //A en linkerpijl
            moveLeft()
        }
        else if(e.keyCode === 68 || e.keyCode === 39){ //D en rechterpijl
            moveRight()
        }
        else if(e.keyCode === 83 || e.keyCode === 40){ //S en pijl naar beneden
            moveDown()
        }
        else if(e.keyCode === 87 || e.keyCode === 38){ //W en pijl naar boven
            rotate()
        }
    }
    document.addEventListener('keydown',control)

    //beweeg tetromino naar beneden functie
    function moveDown(){
        undraw()
        currentPosition += width
        draw()
        freeze()
    }

    //freeze functie zodat tetrominoes bovenop elkaar vallen en niet uit de grid kunnen
    function freeze(){
        if(current.some(index => squares[currentPosition + index + width].classList.contains('taken'))){
            current.forEach(index=>squares[currentPosition + index].classList.add('taken'))
            //nieuwe tetromino valt
            random = nextRandom
            nextRandom = Math.floor(Math.random()* theTetrominoes.length)
            current = theTetrominoes[random][currentRotation]
            currentPosition = 4
            addScore()
            draw()
            displayShape()
            gameOver()
        }
    }

    //tetromino mag naar links, tenzij hij de rand raakt van de grid of er een blokkade is
    function moveLeft() {
        undraw()
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)
        if(!isAtLeftEdge) currentPosition -=1
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition +=1
        }
        draw()
    }

    //tetromino mag naar rechts, tenzij hij de rand raakt van de grid of er een blokkade is
    function moveRight() {
        undraw()
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width -1)
        if(!isAtRightEdge) currentPosition +=1
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -=1
        }
        draw()
    }

    //draai de tetromino
    function rotate(){
        undraw()
        currentRotation++
        if(currentRotation === current.length){ //als de rotatie 4 is, wordt deze weer 0 (omdat er maximaal 4 rotaties zijn)
            currentRotation = 0
        }
        current = theTetrominoes[random][currentRotation]
        draw()
    }

    //laat volgende tetromino zien in mini-grid
    const displaySquares = document.querySelectorAll('.mini-grid div')
    const displayWidth = 4
    let displayIndex = 0

    //tetrominos zonder rotaties
    const upNextTetrominoes = [
        [1, displayWidth+1, displayWidth*2+1, 2], //lTetromino
        [0, displayWidth, displayWidth+1, displayWidth*2+1], //zTetromino
        [1, displayWidth, displayWidth+1, displayWidth+2], //tTetromino
        [0, 1, displayWidth, displayWidth+1], //oTetromino
        [1, displayWidth+1, displayWidth*2+1, displayWidth*3+1] //iTetromino
    ]

    //laat tetromino zien in de mini-grid display
    function displayShape(){

        displaySquares.forEach(square=>{
            square.classList.remove('tetromino')
            square.style.backgroundColor = ''
        })
        upNextTetrominoes[nextRandom].forEach(index => {

            displaySquares[displayIndex + index].classList.add('tetromino')
            displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom]
        })
    }

    //functie toevoegen aan de start/pauze knop
    startBtn.addEventListener('click',() =>{
        if(timerId){
            clearInterval(timerId)
            timerId = null
        } else{
            draw()
            timerId = setInterval(moveDown, 1000)
            // nextRandom = Math.floor(Math.random()*theTetrominoes.length)
            // displayShape()
        }
    })

    muteBtn.addEventListener('click', () =>{
        if(music.paused){
            music.play()
        }
        else{
            music.pause()
        }
    })

    //score toevoegen
    function addScore(){
        for(let i=0; i < 199; i+=width){
            const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]

            if(row.every(index => squares[index].classList.contains('taken'))){ //als een rij vol is
                score += 10 //telt score op
                scoreDisplay.innerHTML = score //laat score zien
                row.forEach(index => {
                    squares[index].classList.remove('taken')
                    squares[index].classList.remove('tetromino')
                    squares[index].style.backgroundColor = ''
                })
                const squaresRemoved = squares.splice(i,width) //laat rij verdwijnen
                squares = squaresRemoved.concat(squares)
                squares.forEach(cell => grid.appendChild(cell))
            }
        }
    }

    //game over
    function gameOver(){
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))){
            scoreDisplay.innerHTML = 'end'
            clearInterval(timerId)
        }
    }
})