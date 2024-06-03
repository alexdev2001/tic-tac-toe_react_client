import  { useEffect, useState } from "react";
import { io } from 'socket.io-client';
import './App.css'

const socket = io('http://localhost:3009');

const App = () => {
    const [game, setGame] = useState({
        board: Array(9).fill(null),
        currentPlayer: 'X',
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [playerTurn, setPlayerTurn] = useState('Player A');

    useEffect(() => {
        
        socket.on('moveMade', (data) => {
            setGame(data.updatedGame);
            setPlayerTurn(data.updatedGame.currentPlayer);
            setErrorMessage("");
        });

        socket.on("resetGame", (newGame) => {
            setGame(newGame);
            setPlayerTurn('Player A');
            setErrorMessage("");
        });

        socket.on("connect_error", (error) => {
            console.error('there was a problem', error.message);
        });

        socket.on("disconnect", () => {
            console.log('A user had been disconnected');
        });

        return () => {
            socket.off("moveMade");
            socket.off("resetGame");
            socket.off("connect_error");
            socket.off("disconnect");
        }

    }, []);

    const calculateWinner = (squares) => {
        let lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];

        for (let i = 0; i <  lines.length; i++) {
            const [a, b, c] = lines[i];

            if(squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }

        }

        return null;
    };

    const makeMove = (index) => {
        const squares = [...game.board];

        if (calculateWinner(squares) || squares[index]) {
            setErrorMessage("Invalid move please try again");
            return;
        }

        squares[index] = game.currentPlayer;

        const updatedGame = {
            ...game,
            board: squares,
            currentPlayer: game.currentPlayer === 'X' ? 'O': 'X'
        }

        socket.emit('makeMove', { index, updatedGame});

    };

    const resetGame = () =>  {
        const newGame ={
            board: Array(9).fill(null),
            currentPlayer: "X"
        }

        socket.emit('resetGame',newGame)
    };

    const winner =calculateWinner(game.board);

    return (
        <div className="app-container">
          <h1>Welcome to Tic Tac Toe Game</h1>
          <div>
            <div className="board">
              {game.board.map((cell, index) => (
                <div
                  key={index}
                  className={`cell ${winner && winner === cell ? "winner" : ""}`}
                  onClick={() => makeMove(index)}
                >
                  {cell}
                </div>
              ))}
            </div>
            <p className="current-player">
              {winner
                ? `Player ${winner} wins!`
                : `Current Player: ${playerTurn}`}
            </p>
            <button className="reset-button" onClick={resetGame}>
              Reset Game
            </button>
          </div>
          {errorMessage && (
            <p className="error-message">{errorMessage}</p>
          )}
        </div>
      );
}

export default App;


