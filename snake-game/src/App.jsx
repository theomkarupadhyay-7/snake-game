import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase/config";
import "./App.css";
import Register from "./register";
import Login from "./login";


const GRID_SIZE = 20;

function getRandomFood() {
  return {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  };
}

function App() {
  const [snake, setSnake] = useState([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ]);

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authScreen, setAuthScreen] = useState("login");


  const [direction, setDirection] = useState({ x: 1, y: 0 });

  const [food, setFood] = useState(getRandomFood());

  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const foodRef = useRef(food);
  const previousSnakeLength = useRef(snake.length);


  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
    setAuthLoading(false);
  });

  return () => unsubscribe();
}, []);

  // Keep foodRef updated
  useEffect(() => {
    foodRef.current = food;
  }, [food]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowUp" && direction.y === 0) {
        setDirection({ x: 0, y: -1 });
      }

      if (event.key === "ArrowDown" && direction.y === 0) {
        setDirection({ x: 0, y: 1 });
      }

      if (event.key === "ArrowLeft" && direction.x === 0) {
        setDirection({ x: -1, y: 0 });
      }

      if (event.key === "ArrowRight" && direction.x === 0) {
        setDirection({ x: 1, y: 0 });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [direction]);

  // Game loop
  useEffect(() => {
    if (gameOver) return;

    const gameLoop = setInterval(() => {
      setSnake((currentSnake) => {
        const head = currentSnake[0];

        const newHead = {
          x: head.x + direction.x,
          y: head.y + direction.y,
        };

        // Wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setGameOver(true);
          return currentSnake;
        }

        // Self collision
        const hitSelf = currentSnake.some(
          (part) =>
            part.x === newHead.x &&
            part.y === newHead.y
        );

        if (hitSelf) {
          setGameOver(true);
          return currentSnake;
        }

        // Check food
        const ateFood =
          newHead.x === foodRef.current.x &&
          newHead.y === foodRef.current.y;

        if (ateFood) {
          return [newHead, ...currentSnake];
        }

        return [newHead, ...currentSnake.slice(0, -1)];
      });
    }, 150);

    return () => clearInterval(gameLoop);
  }, [direction, gameOver]);

  // Detect when snake grows
  useEffect(() => {
    if (snake.length > previousSnakeLength.current) {
      setScore((currentScore) => currentScore + 1);
      setFood(getRandomFood());
    }

    previousSnakeLength.current = snake.length;
  }, [snake.length]);
     
      const restartGame = () => {
  setSnake([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ]);

  setDirection({ x: 1, y: 0 });

  const newFood = getRandomFood();

  setFood(newFood);
  foodRef.current = newFood;

  setScore(0);
  setGameOver(false);

  previousSnakeLength.current = 3;
};




if (authLoading) {
  return <h2>Loading...</h2>;
}

if (!user) {
  if (authScreen === "register") {
    return (
      <Register
        onRegister={() => setAuthScreen("login")}
      />
    );
  }

  return (
    <Login
     onLogin={(loggedInUser) => {
      console.log("APP RECEIVED USER:", loggedInUser);
        setUser(loggedInUser);
     }}
      onRegister={() => setAuthScreen("register")}
    />
  );
}

    

  return (
    <div className="game-container">
      <h1>🐍 Snake Game</h1>

      <h2>Score: {score}</h2>

      <div className="game-board">
        {snake.map((part, index) => (
          <div
            key={index}
            className={`snake-part ${
              index === 0 ? "snake-head" : ""
            }`}
            style={{
              left: `${part.x * 20}px`,
              top: `${part.y * 20}px`,
            }}
          />
        ))}

        <div
          className="food"
          style={{
            left: `${food.x * 20}px`,
            top: `${food.y * 20}px`,
          }}
        />
      </div>

      {gameOver && (
        <div className="game-over">
          <h2>💀 Game Over</h2>

          <p>Final Score: {score}</p>

          <button onClick={restartGame}>
             Restart
          </button>
        </div>
      )}

      <p>Use the arrow keys to move</p>

      <h3>Made by Omkar Upadhyay</h3>
      <button
  onClick={() => signOut(auth)}
  className="logout-button"
>
  Logout
</button>
    </div>
  );
  
}

export default App;