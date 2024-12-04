import { createInterface } from 'node:readline/promises';
import ANSI from "./ANSI.mjs";

const BOARD_SIZE = 3;
let brett = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
const spiller1 = 1;
const spiller2 = -1;
let resultatAvSpill = "";
let spiller = spiller1;
let isGameOver = false;
let player1Name = "";
let player2Name = "";
let vinner;

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
});

async function getPlayerNames() {
    player1Name = await rl.question("Enter Player 1 name (X): ");
    player2Name = await rl.question("Enter Player 2 name (O): ");
}

await getPlayerNames();

while (isGameOver === false) {
    console.log(ANSI.CLEAR_SCREEN, ANSI.CURSOR_HOME);
    visBrett(brett);
    console.log(`Det er ${spillerNavn()} sin tur`);

    let pos = await rl.question("Hvor setter du merket ditt? (rad,kolone, or 'r' to restart, 'q' to quit): ");

    //Haandterer r og q input-ene
    if (pos.toLowerCase() === 'r') {
        restartGame();
        continue;
    } else if (pos.toLowerCase() === 'q') {
        console.log("Game Over");
        rl.close();
        process.exit();
    }

    let rad;
    let kolone;
    [rad, kolone] = pos.split(",");

    // Input validering
    if (isNaN(rad) || isNaN(kolone) || rad < 1 || rad > BOARD_SIZE || kolone < 1 || kolone > BOARD_SIZE) {
        console.log("Invalid input. Please enter numbers between 1 and 3, or 'r' to restart, or 'q' to quit.");
        continue;
    }

    rad = parseInt(rad) - 1;
    kolone = parseInt(kolone) - 1;

    //sjekker om sloten er opptatt
    if (brett[rad][kolone] !== 0) {
        console.log("Invalid input. That space is already occupied.");
        continue; 
    }

    brett[rad][kolone] = spiller;

    vinner = harNoenVunnet(brett);
    if (vinner !== 0) {
        isGameOver = true;
        resultatAvSpill = `Vinneren er ${spillerNavn(vinner)}`;
    } else if (erSpilletUavgjort(brett)) {
        resultatAvSpill = "Det ble uavgjort";
        isGameOver = true;
    }
    byttAktivSpiller();
}

console.log(ANSI.CLEAR_SCREEN, ANSI.CURSOR_HOME);
visBrett(brett);
console.log(resultatAvSpill);
console.log("Game Over");
rl.close();

function harNoenVunnet(brett) {
    for (let i = 0; i < BOARD_SIZE; i++) {
        let rowSum = 0;
        let colSum = 0;
        for (let j = 0; j < BOARD_SIZE; j++) {
            rowSum += brett[i][j];
            colSum += brett[j][i];
        }
        if (Math.abs(rowSum) === BOARD_SIZE || Math.abs(colSum) === BOARD_SIZE) {
            return rowSum > 0 ? spiller1 : spiller2;
        }
    }

    let diag1Sum = 0;
    let diag2Sum = 0;
    for (let i = 0; i < BOARD_SIZE; i++) {
        diag1Sum += brett[i][i];
        diag2Sum += brett[i][BOARD_SIZE - 1 - i];
    }
    if (Math.abs(diag1Sum) === BOARD_SIZE || Math.abs(diag2Sum) === BOARD_SIZE) {
        return diag1Sum > 0 ? spiller1 : spiller2;
    }

    return 0;
}

function erSpilletUavgjort(brett) {
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (brett[i][j] === 0) {
                return false;
            }
        }
    }
    return true;
}
// Fancy Brett
function visBrett(brett) {
    const topLine = "╔═══╦═══╦═══╗";
    const midLine = "╠═══╬═══╬═══╣";
    const bottomLine = "╚═══╩═══╩═══╝";
    let boardString = topLine + "\n";

    for (let i = 0; i < BOARD_SIZE; i++) {
        let rowString = "║";
        for (let j = 0; j < BOARD_SIZE; j++) {
            let mark = "   ";
            const value = brett[i][j];
            if (value === spiller1) {
                mark = ANSI.COLOR.GREEN + " X " + ANSI.COLOR_RESET;
            } else if (value === spiller2) {
                mark = ANSI.COLOR.RED + " O " + ANSI.COLOR_RESET;
            }
            rowString += mark + "║";
        }
        boardString += rowString + "\n";
        if (i < BOARD_SIZE - 1) {
            boardString += midLine + "\n";
        }
    }
    boardString += bottomLine;
    console.log(boardString);
    console.log("  1   2   3");
}

function spillerNavn(sp = spiller) {
    let piece = (sp === spiller1) ? " (X)" : " (O)";
    let name = (sp === spiller1) ? ANSI.COLOR.GREEN + player1Name + ANSI.COLOR_RESET : ANSI.COLOR.RED + player2Name + ANSI.COLOR_RESET;
    return `Spiller ${sp === spiller1 ? 1 : 2} ${name}${piece}`;
}

function byttAktivSpiller() {
    spiller *= -1;
}

function restartGame() {
    brett = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
    spiller = spiller1;
    isGameOver = false;
    console.log("Game restarted!");
}
