const screens = document.querySelectorAll('.container')

const screen1 = document.querySelector('#screen1')
const screen2 = document.querySelector('#screen2')
const screen3 = document.querySelector("#screen3")

// First Screen
const usernameField = document.querySelector('#username')
const imageFile = document.querySelector('#image-file')
const userClassField = document.querySelector('#class_name')
const ipAddress = document.querySelector('#ip-address')
const connectBtn = document.querySelector('#submit')
const profilePix = document.querySelector('#profile')
const filename = document.querySelector("#filename")
const fileControl = document.querySelector(".file-control")


// Second Screen
const disconnectBtn = document.querySelectorAll(".disconnect-btn")

// Third screen
const questionContent = document.querySelector('.question-content')
const prevQuestionBtn = document.querySelector('#prev')
const nextQuestionBtn = document.querySelector('#next')
const quitQuizBtn = document.querySelector('#quit_quiz')
const quizModal = document.querySelector('#quit-quiz-modal')
const quitQuizModal = document.querySelector('#close_quit_modal')
const optionQuitYesBtn = document.querySelector('#quit_quiz_yes')
const optionQuitNoBtn = document.querySelector('#quit_quiz_no')

const clientName = document.querySelector('#client_name')
const clientClass = document.querySelector('#client_class')

// Variables for questions
let QuestionNum = 0
let correctOption
let numberOfSeconds

// Variables for clock
let numberofQuestions
let circle
let radius
let circumference
let mindiv
let secdiv

// Timer variables
let seconds 
let totalsecs
let threshold
let interval

// Question variables
let buttons
let chosenOption

// Client controller
let client

const { ipcRenderer } = require("electron")

const path = require("path")
const { removeAllListeners } = require("process")

let connection = false

class User {
    constructor(name, className) {
        this.name = name
        this.className = className
    }
}


// Add error
function addError(field, error_message) {
    field.parentElement.classList.add('error')
    field.nextElementSibling.innerText = error_message
}


// Remove error
function removeError(field) {
    field.parentElement.classList.remove('error')
    field.nextElementSibling.innerText = ''
}

// Add Name of File to Form
imageFile.addEventListener("change", () => {
    filename.innerHTML = imageFile.files[0].name
    imageFile.style.marginBottom = "10px"
    fileControl.style.marginBottom = "10px"
})


function validateForms() {
    if (usernameField.value === '') {
        addError(usernameField, 'Field cannot be empty')
        return false
    } else {
        removeError(usernameField)
    }

    if (userClassField.value === '') {
        addError(userClassField, 'Field cannot be empty')
        return false
    } else {
        removeError(userClassField)
    }

    if (ipAddress.value === '') {
        addError(ipAddress, 'Field cannot be empty')
        return false
    } else {
        removeError(ipAddress)
    }

    return true
}


// Handle questions and question animations
function questionTemplate(question, optionA, optionB, optionC, optionD, num) {
    return `
    <div class="question-display">
        <div class="question-top">
            <h2>Question ${QuestionNum}<span>/${numberofQuestions}</span></h2>
            <figure class="clock">
                <div class="mins ">0</div>
                <div>:</div>
                <div class="secs ">0${numberOfSeconds}</div>
                <!-- <audio src="http://soundbible.com/mp3/service-bell_daniel_simion.mp3"></audio> -->
                <svg class="progress-ring" height="60" width="60">
                    <circle class="progress-ring__circle" stroke-width="8" fill="transparent" r="29" cx="30" cy="30"/>
                </svg>
            </figure>
        </div>
        <div class="question-body">    
            <div class="question">
            <h3>
                ${question}
            </h3>
            </div>
            <div class="options">
                <button id="option-a" class="option" name="A">${optionA}</button>
                <button id="option-b" class="option" name="B">${optionB}</button>
                <button id="option-c" class="option" name="C">${optionC}</button>
                <button id="option-d" class="option" name="D">${optionD}</button>
            </div>
    </div>
    `
}


// Question Div properties
let imageProps = {
    marginTop: {
        0: 50,
        1: 32,
        2: 20,
        3: 8,
        4: -4,
    },
    width: {
        0: 74,
        1: 64,
        2: 56,
        3: 48,
        4: 40,
    }
}



// Adding the question box with options 
function addQuestionsToDom(numberofQuestions, question, optionA, optionB, optionC, optionD, questionNum) {
    // if(numberofQuestions > 5){numberofQuestions = 5}

    for(i=0; i<5; i++){
        if(i === 0){

            // Adding those div boxes
            let questionBox = document.createElement("div")
            questionBox.className = "question-slide"
            questionBox.style.marginTop = `${imageProps.marginTop[i]}px`
            questionBox.style.width = `${imageProps.width[i]}%`
            questionBox.innerHTML = questionTemplate(question, `A. ${optionA}`, `B. ${optionB}`, `C. ${optionC}`, `D. ${optionD}`, questionNum)
            
            // Adding the div boxes with questions to the screen
            questionContent.insertBefore(questionBox, questionContent.children[0])

            disbleButtons()
    
            circle = document.querySelector(`.progress-ring__circle`)
            radius = circle.r.baseVal.value;
            circumference = radius * 2 * Math.PI;
    
            circle.style.stroke = 'transparent'
    
            circle.style.strokeDasharray = circumference;
            circle.style.strokeDashoffset = circumference;    

            QuestionNum += 1
    
        }
    
        else{
    
            let questionBox = document.createElement("div")
    
            questionBox.className = "question-slide"
            questionBox.style.marginTop = `${imageProps.marginTop[i]}px`
            questionBox.style.width = `${imageProps.width[i]}%`
            questionContent.insertBefore(questionBox, questionContent.children[0])
        }
    }
}


function nextQuestion(question, optionA, optionB, optionC, optionD, questionNum ) {
    interval ? clearInterval(interval) : interval = null

    questionContent.lastChild.style.transform = "translateX(-200vw)"

    setTimeout(() => {
        questionContent.lastChild.remove()
        questionContent.children[3].style.marginTop = `${imageProps.marginTop[0]}px`
        questionContent.children[3].style.width = `${imageProps.width[0]}%`
        questionContent.children[3].className = "question-slide"
        
        setTimeout(() => {
        
            if(questionNum <= numberofQuestions){
                questionContent.lastChild.innerHTML = questionTemplate(question, `A. ${optionA}`, `B. ${optionB}`, `C. ${optionC}`, `D. ${optionD}`, questionNum)
                
                disbleButtons()

                // The Timer 
                circle = document.querySelector(`.progress-ring__circle`);
                radius = circle.r.baseVal.value;
                circumference = radius * 2 * Math.PI;

                mindiv = document.querySelector(`.mins`);
                secdiv = document.querySelector(`.secs`);

                seconds = numberOfSeconds

                mindiv.textContent = Math.floor(numberOfSeconds / 60);
                secdiv.textContent = seconds % 60 > 9 ? seconds % 60 : `0${seconds % 60}`;

                // Work on the timeer

                circle.style.strokeDasharray = circumference;
                circle.style.strokeDashoffset = circumference;

                // Increment the question number
                QuestionNum += 1

            }
            else{
                questionContent.lastChild.innerHTML = "Game Over"
                // next.disabled = "True"
            }
            
        }, 300);

        let questionBox = document.createElement("div")
        
        questionBox.className = "question-slide"
        questionBox.style.marginTop = `${imageProps.marginTop[1]}px`
        questionBox.style.width = `${imageProps.width[1]}%`
        
        // Insert the next box without any style
        questionContent.insertBefore(questionBox, questionContent.lastChild)
        
    }, 500);  
}

function disbleButtons(){
    let buttons = document.querySelectorAll(".option")
    // Disable buttons
    buttons.forEach((element) => {
        element.disabled = true
        element.style.backgroundColor = "rgb(17, 53, 30)"
    })

    //  Reduce opacity of buttons
    buttons.forEach((element) => {
        element.style.opacity = "0.7"
    })

}

function enableButtons(){
    buttons = document.querySelectorAll(".option")

    // Enable buttons
    buttons.forEach((element) => {
        element.disabled = false
        element.style.backgroundColor = "hsl(154, 59%, 51%)"
    })

    // Increase opacity of buttons
    buttons.forEach((element) => {
        element.style.opacity = "1"
    })

    // Add eventListeners
    // addEventListener(buttons)
    addEvent(buttons)
}


function addEvent(button){
    button.forEach(element => {
        element.addEventListener("click", sendClick)
    })

    window.addEventListener("keydown", btnClick) 
}

function removeEventListeners(button){
    button.forEach(element => {
        element.removeEventListener("click", sendClick)
    })

    window.removeEventListener("keydown", btnClick)
}

function btnClick(e){
    buttons.forEach(elem => {
        if(e.key.toUpperCase() ===  elem.name){
            keyDown(elem.name)
        }
    })
}

function keyDown(option){
    console.log(`You have pressed option ${option}`)

    chosenOption = option

    client.write(JSON.stringify({"[CHOSEN_OPTION]":option}))

    changeColor(option)

}

function sendClick(option){
    console.log(`You have pressed option ${option.target.name}`)

    chosenOption = option.target.name

    client.write(JSON.stringify({"[CHOSEN_OPTION]":option.target.name}))

    changeColor(option.target.name)

}

function changeColor(option){
    buttons.forEach(elem => {
        if(elem.name === option){
            elem.style.backgroundColor = "hsl(216, 50%, 44%)"
        }
    })

    removeEventListeners(buttons)

}


function setProgress(percent) {
    let offset = circumference - (percent / 100) * circumference;
    circle.style.strokeDashoffset = offset;

}


// Starting the Timer when activate is sent to Client
function startTime() {
    interval = setInterval(() => {
        mindiv.textContent = Math.floor(seconds / 60);
        secdiv.textContent = seconds % 60 > 9 ? seconds % 60 : `0${seconds % 60}`;
        
        perc = Math.ceil(((totalsecs - seconds) / totalsecs) * 100);
 
        setProgress(perc);    
 
        seconds--
    
        if (circle.classList.contains("danger")) {
            circle.classList.remove("danger");
        }
    
        if (seconds >= 0) {
            if (seconds < threshold) {
                circle.classList.add("danger");
            }
        } else {
            circle.classList.remove('danger')
            circle.classList.add('done')
            clearInterval(interval)
            resetTimer()
            validateAnswer(chosenOption)
        }
    }, 1000)    
}




// reset the timer
function resetTimer() {
    seconds = numberOfSeconds
    totalsecs = numberOfSeconds
    threshold = Math.ceil(seconds / 3)
    interval = null
}



function removeScreens() {
    screens.forEach(screen => {
        screen.classList.remove('current')
        screen.style.display = 'none'
    })
}

function validateAnswer(option){
    
}

connectBtn.addEventListener('click', (e) => {
    e.preventDefault()

    if (validateForms()) {
        let profilePath = imageFile.files[0].path
        let username = usernameField.value
        let userClass = userClassField.value
        let ipAddr = ipAddress.value
        let fileSize = Math.floor((imageFile.files[0].size)/1024)

        // Validate IP Address
        let result = ValidateIPaddress(ipAddr)

        // If the ipAddress is correct
        if(result){

            let re = /\\/g
            profilePath = profilePath.replace(re, "/")

            // Display the Connecting modal
            const connectingModal = document.querySelector('#connecting')
            connectingModal.style.display = 'flex'

            console.log(fileSize)

            // Try to Connect to the server
            connectToServer(ipAddr, username, userClass, profilePath, fileSize)
            .then((clientController) => {

                client = clientController

                // Recieve anything from server
                clientController.on("data", (data) => {

                    if(data.toString() === "[QUIZ_FULL]"){
                         // Display connected successfully
                        connection = true
                        console.log("Successfull")
                        let text = `<h3> Server has reached its limit ⚠⚠<h3>`
                        document.querySelector("#connecting-delay").innerHTML = text
                        document.querySelector("#connecting-delay").style.width = "30%"
                        document.querySelector("#connecting-delay").style.alignItem = "center";
                        document.querySelector("#connecting-delay").style.justifyContent = "center";
                        document.querySelector("#connecting-delay").style.textAlign = "center";

                        setTimeout(() => {
                            location.reload()
                        }, 1000);

                    }

                    else{

                        connection = true
                        console.log("Successfull")
                        let text = `<h3> Connected Successfully<h3>`
                        document.querySelector("#connecting-delay").innerHTML = text

                        // Disconnecting from server
                        if(data.toString("utf-8").trim() === "[SERVER DISCONNECT]"){
                            clientController.destroy()
                            location.reload()
                        }

                            // Recieving Activation request for buttons and timer

                        else if(data.toString() === "[START_TIMER]"){
                            circle.style.stroke = '#fff'
                            enableButtons()
                            startTime()
                        }

                        else{

                            let info = JSON.parse(data.toString("utf-8"))

                            // Recieving Start Quiz, numSecs and numQuests
                            if(data.toString("utf-8").slice(4, 23) === "[NUMBER_OF_SECONDS]"){
                                console.log("I have recieved the seconds and questions")
                                info = JSON.parse(info)
                                console.log(typeof info)

                                // console.log(numberofQuestions)
                                numberofQuestions = (info["[NUMBER_OF_QUESTIONS]"])
                                
                                numberOfSeconds = (info["[NUMBER_OF_SECONDS]"])
                                seconds = numberOfSeconds 
                                totalsecs = numberOfSeconds
                                threshold = Math.ceil(seconds / 3)                

                            }

                            // Recieving first question 
                            else if(info["QUESTION_NUMBER"] == 1){
                                
                                removeScreens()

                                screen3.classList.add("current")
                                screen3.style.display = "flex"

                                displayQuestion(info)

                                // Set the values already
                                                            
                                mindiv = document.querySelector(`.mins`);
                                secdiv = document.querySelector(`.secs`);

                                mindiv.innerHTML = Math.floor(seconds / 60);
                                secdiv.innerHTML = seconds % 60 > 9 ? seconds % 60 : `0${seconds % 60}`;

                                

                            }


                            // Recieving other questions
                            else if(info["QUESTION_NUMBER"]){
                                displayQuestion(info)
                                // Remove eventListeners
                                removeEventListeners(buttons)
                            }


                        }
                    }
                    
                })

                // Change screen to waiting page
                setTimeout(() => {
                    connectingModal.style.display = 'none'
                    
                    removeScreens()
        
                    screen2.classList.add('current')
                    screen2.style.display = 'flex'
                
                    // Insert the image and Username to the waiting page
                    clientName.innerText = username
                    clientClass.innerText = userClass.toUpperCase()
                    profilePix.setAttribute('src', profilePath)
                    profilePix.className = "image"

                    // Add Event Listener to the home and disconnect button
                    
                    for(i=0; i<disconnectBtn.length; i++){
                        disconnectBtn[i].addEventListener("click", () => {

                            disconnectClient()
                            
                            const disconnectingModal = document.querySelector("#disconnecting")
                            disconnectingModal.style.display = "flex"
                            
                            setTimeout(() => {
                                disconnectingModal.style.display = "none"
                                location.reload()
                            }, 1500);
                        
                        })
                    }
                    
                }, 1000);

            })

            .catch((err) => {
                
                let text = `<h3> Invalid IP<h3>`
                document.querySelector("#connecting-delay").innerHTML = text

                connectingModal.addEventListener("click", (e) => {
                    connectingModal.style.display = "none"
                    location.reload()
                })

            })

            // if(!client){
            //     ipcRenderer.send("Network")
            //     console.log(client)
            // }
            // else{

            // }


        }

        else{
            // ipcRenderer.send("ipAdress")
            const connectingModal = document.querySelector('#invalidIP')
            connectingModal.style.display = 'flex'
            connectingModal.addEventListener("click", (e) => {
                connectingModal.style.display = "none"
            })
        }


    }

    // setTimeout(() => {
    //     toastModal.style.display = 'flex'
    // }, 1000)

    // setTimeout(() => {
    //     toastModal.style.display = 'none'
    // }, 3000)
})


function displayQuestion(info){
    let question = info["QUESTION"]
    let optionA = info["OPTION_A"]
    let optionB = info["OPTION_B"]
    let optionC = info["OPTION_C"]
    let optionD = info["OPTION_D"]
    correctOption = info["CORRECT_OPTION"]
    QuestionNum = info["QUESTION_NUMBER"]

    console.log(question, optionA, optionB, optionC, optionD, correctOption, QuestionNum)

    if(QuestionNum === 1){
        addQuestionsToDom(numberofQuestions, question, optionA, optionB, optionC, optionD, QuestionNum)
    }
    else{
        nextQuestion(question, optionA, optionB, optionC, optionD, QuestionNum)
    }

}


function ValidateIPaddress(inputText){
    var ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if(inputText.match(ipformat)){
        return true;
    }
    else
    {
        console.error("You have entered an invalid IP address!");
        return false;
    }
}

