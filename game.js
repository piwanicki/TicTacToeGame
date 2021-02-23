//import { dupa } from "./add"; // babel; instalacja paczki, pozniej rozdziel plioki na klasy++

DOMStrings = {
  fields: document.querySelectorAll(".field"),
  newGameBtn: document.querySelector(".btn"),
  circle: '<i class="ion-android-radio-button-off"></i>',
  cross: '<i class="ion-close-round"></i>',
  symbolMenu: document.querySelector(".symbolMenu"),
  symbolList: document.querySelectorAll(".symbolList li"),
  info: document.querySelector(".turn"),
  sendBtn: document.querySelector(".SubmitButton"),
  mailDialog: document.querySelector(".MailDialog"),
  openMailer: document.querySelector(".ContactIcon"),
  closeMailer: document.querySelector(".CancelIcon"),
  backdrop: document.querySelector(".Backdrop"),
  mailFormDiv: document.querySelector(".mailFormDiv"),
  mailStatus: document.querySelector(".StatusMail"),
  mailStatusP: document.querySelector(".StatusMail p"),
  loadingSpinner: document.querySelector(".Loader"),
  emailAddressInput: document.getElementById("emailInput"),
  messageInput: document.getElementById("msgInput"),
  nameInput: document.getElementById("nameInput")
};

var gamePlaying, activePlayer, blockBoard;

board = [
  "",
  "",
  "", // 0, 1, 2
  "",
  "",
  "", // 3, 4, 5
  "",
  "",
  "" // 6, 7, 8
];

winCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // columns
  [0, 4, 8],
  [2, 4, 6] // diagonals
];

// Player class //
class Player {
  moves = [];

  constructor() {
    this.name = "Gracz";
  }

  move = () => {};
}

// Computer class //
class Computer {
  moves = [];
  s;
  indexes;
  minimaxC = 0;

  constructor() {
    this.name = "Komputer";
  }

  move = () => {
    blockBoard = true;
    DOMStrings.info.classList.toggle("loading");

    let time;
    const length = this.getPossibleMoves(board).length;

    // time for make move
    length > 5 ? (time = 1000) : (time = 500);

    setTimeout(() => {
      if (length == 9) {
        // First random item on the board full empty board
        const indexes = board
          .map((field, index) => (field === "" ? index : ""))
          .filter(String);
        this.fieldID = indexes[Math.floor(Math.random() * indexes.length)]; // Random item
        this.s = `#_${this.fieldID}`;
      } else {
        const field = this.minimax(board, comp);
        this.fieldID = field.index;
        this.s = `#_${this.fieldID}`;
      }

      if (length > 0) {
        board[this.fieldID] = this.name;
        this.moves.push(this.fieldID);
        document.querySelector(this.s).innerHTML = this.symbol;
        Controller.whoWin(this.moves);
      }
      this.minimaxC = 0;

      DOMStrings.info.classList.toggle("loading");
      blockBoard = false;
      Controller.switchPlayer();
    }, time);
  };

  nextMovePossible = array => {
    return array.filter(field => field === "").length > 0;
  };

  getPossibleMoves = array => {
    return array.map((cur, index) => (cur === "" ? index : "")).filter(String);
  };

  getBoardForMove = (e, currentPlayer, array) => {
    const copiedBoard = [...array];
    copiedBoard[e] = currentPlayer.name;
    return copiedBoard;
  };

  getFieldIndexes = (array, currentPlayer) => {
    return array
      .map((field, index) => (field === currentPlayer.name ? index : ""))
      .filter(String);
  };

  checkIfWin = (array, player) => {
    let board;
    board = this.getFieldIndexes(array, player);
    for (let i = 0; i < winCombinations.length; i++) {
      var combination = winCombinations[i];
      if (combination.every(index => board.indexOf(index) > -1)) {
        return true;
      } else {
        continue;
      }
    }
  };

  // the main minimax function
  minimax = (newBoard, actPlayer) => {
    this.minimaxC++;
    const possibleMoves = this.getPossibleMoves(newBoard);

    if (this.checkIfWin(newBoard, player)) {
      return { score: -10 };
    } else if (this.checkIfWin(newBoard, comp)) {
      return { score: 10 };
    } else if (possibleMoves.length === 0) {
      return { score: 0 };
    }

    // for collecting all moves
    var minimoves = [];

    for (let el of possibleMoves) {
      // create a move object to store move (index, score)
      var move = {};

      move.index = el;

      //set index of newboard to actPlayer
      newBoard[el] = actPlayer.name;
      if (actPlayer == comp) {
        var result = this.minimax(newBoard, player);
        move.score = result.score;
      } else {
        var result = this.minimax(newBoard, comp);
        move.score = result.score;
      }

      //reset the spot to empty
      newBoard[el] = "";
      minimoves.push(move);
    }

    var bestMove;
    // Get a high score move
    if (actPlayer === comp) {
      var bestScore = -100; // For checking if score is higher than this
      for (var i = 0; i < minimoves.length; i++) {
        if (minimoves[i].score > bestScore) {
          bestScore = minimoves[i].score;
          bestMove = i;
        }
      }
    } else {
      var bestScore = 100;
      for (var i = 0; i < minimoves.length; i++) {
        if (minimoves[i].score < bestScore) {
          bestScore = minimoves[i].score;
          bestMove = i;
        }
      }
    }
    return minimoves[bestMove];
  };
}

// Create objects (players)
comp = new Computer();
player = new Player();

class Controller {
  pickedSym;
  IDSplit;
  fieldID;

  static switchPlayer = () => {
    if (gamePlaying) {
      activePlayer === player ? (activePlayer = comp) : (activePlayer = player);
      DOMStrings.info.innerHTML = `Tura ${activePlayer.name}a`;
    }
    return activePlayer;
  };

  makeMove = () => {
    DOMStrings.fields.forEach(el =>
      el.addEventListener("click", function() {
        if (gamePlaying && !blockBoard) {
          if (el.innerHTML === "") {
            el.innerHTML = activePlayer.symbol;
            this.IDSplit = el.getAttribute("id");
            this.fieldID = parseInt(this.IDSplit[1]);
            activePlayer.moves.push(this.fieldID);
            board[this.fieldID] = activePlayer.name;
            Controller.whoWin(activePlayer.moves);
            Controller.switchPlayer();
            comp.move();
          }
        }
      })
    );
  };

  clearMailInputs = () => {
    DOMStrings.emailAddressInput.value = "";
    DOMStrings.nameInput.value = "";
    DOMStrings.messageInput.value = "";
  };

  // Setup events
  setup = () => {
    DOMStrings.newGameBtn.addEventListener("click", function() {
      DOMStrings.symbolMenu.classList.toggle("hidden");
    });
    DOMStrings.symbolList.forEach(el =>
      el.addEventListener("click", function() {
        this.pickedSym = el.innerHTML;
        console.log(`Gracz wybral ${this.pickedSym}`);
        if (this.pickedSym === DOMStrings.cross) {
          activePlayer = player;
          player.symbol = this.pickedSym;
          comp.symbol = DOMStrings.circle;
          console.log(`Rozpoczyna ${activePlayer.name}`);
        } else {
          activePlayer = comp;
          comp.symbol = DOMStrings.cross;
          player.symbol = DOMStrings.circle;
          console.log(`Rozpoczyna ${activePlayer.name}`);
        }

        // Clear fields
        Controller.newGame();
        if (activePlayer === comp) {
          comp.move();
        }
      })
    );

    // DOMStrings.openMailer.addEventListener("click", () => {
    //   if (DOMStrings.mailDialog.className.includes("Close")) {
    //     DOMStrings.mailDialog.classList.remove("Close");
    //     DOMStrings.mailDialog.classList.add("Open");
    //     DOMStrings.backdrop.classList.toggle("hidden");
    //   } else {
    //     DOMStrings.mailDialog.classList.remove("Open");
    //     DOMStrings.mailDialog.classList.add("Close");
    //   }
    // });

    // DOMStrings.closeMailer.addEventListener("click", () => {
    //   DOMStrings.mailDialog.classList.remove("Open");
    //   DOMStrings.mailDialog.classList.add("Close");
    //   DOMStrings.backdrop.classList.toggle("hidden");
    // });

    // // DOMStrings.sendBtn.addEventListener('click', this.sendHandler())
    // DOMStrings.sendBtn.addEventListener("click", () => {
    //   this.sendHandler();
    // });

    // DOMStrings.backdrop.addEventListener("click", () => {
    //   DOMStrings.mailDialog.classList.remove("Open");
    //   DOMStrings.mailDialog.classList.add("Close");
    //   DOMStrings.backdrop.classList.toggle("hidden");
    // });
  };

  // sendHandler = () => {
  //   //paste to senFeedback (template , ...)
  //   const templateId = "template_uMFom1rL";

  //   const emailAddress = DOMStrings.emailAddressInput.value;
  //   const message = DOMStrings.messageInput.value;
  //   const name = DOMStrings.nameInput.value;

  //   if (emailAddress !== "" && message !== "" && name !== "") {
  //     this.sendFeedback(templateId, {
  //       message_html: message,
  //       from_name: name,
  //       from_email: emailAddress
  //     });
  //   }
  // };

  // sendFeedback(templateId, variables) {
  //   DOMStrings.mailFormDiv.classList.toggle("hidden");
  //   DOMStrings.loadingSpinner.classList.toggle("hidden");
  //   window.emailjs
  //     .send("gmail", templateId, variables)
  //     .then(res => {
  //       DOMStrings.loadingSpinner.classList.toggle("hidden");
  //       if (res.text === "OK") {
  //         DOMStrings.mailStatusP.innerHTML = "Email send successfully!";
  //         DOMStrings.mailStatus.classList.add("Green");
  //         this.clearMailInputs();
  //       }
  //     })
  //     .catch(error => {
  //       console.log(error);
  //       DOMStrings.mailStatusP.innerHTML =
  //         "Something went wrong with sending email. Please try again... ;(";
  //       DOMStrings.mailStatus.classList.add("Red");
  //     });
  //   DOMStrings.mailStatus.classList.toggle("hidden");
  //   setTimeout(() => {
  //     DOMStrings.mailFormDiv.classList.toggle("hidden");
  //     DOMStrings.mailStatus.classList.toggle("hidden");
  //   }, 3000);
  // }

  static newGame = () => {
    DOMStrings.fields.forEach(el => (el.innerHTML = ""));
    DOMStrings.symbolMenu.classList.toggle("hidden");
    player.moves = [];
    comp.moves = [];
    board = ["", "", "", "", "", "", "", "", ""];
    gamePlaying = true;
    blockBoard = false;
    DOMStrings.info.innerHTML = `Rozpoczyna ${activePlayer.name}`;
  };

  static whoWin = array => {
    let winner;

    winCombinations.forEach(combination => {
      if (combination.every(index => array.indexOf(index) > -1)) {
        winner = activePlayer.name;
        if (winner === "Komputer") {
          Swal.fire({
            title: "Przegrałeś!",
            text: "Spróbuj jeszcze raz!",
            imageUrl: "images/sadEmoji.png",
            imageHeight: "50",
            confirmButtonText: "OK!"
          });
        } else {
          Swal.fire({
            title: "Wygrałeś!",
            text: "Gratulacje! Chcesz zagrać ponownie?",
            imageUrl: "images/happyEmoji.png",
            imageHeight: "50",
            confirmButtonText: "OK!"
          });
        }
        DOMStrings.info.innerHTML = `Wygrał ${winner}`;
        gamePlaying = false;
      } else if (!board.includes("") && winner === undefined) {
        Swal.fire({
          title: "Remis!",
          text: "Spróbuj jeszcze raz!",
          confirmButtonText: "OK!"
        });
        gamePlaying = false;
        DOMStrings.info.innerHTML = `Remis`;
      }
    });
    return winner;
  };
}

cntr = new Controller();
cntr.setup();
cntr.makeMove();
