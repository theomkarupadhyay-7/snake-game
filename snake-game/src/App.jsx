import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "./firebase/config";

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

  const [gameStarted, setGameStarted] = useState(false);
  const [direction, setDirection] = useState({ x: 1, y: 0 });

  const [food, setFood] = useState(getRandomFood());

  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
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

const changeDirection = (newDirection) => {
  if (newDirection.x === -direction.x &&
      newDirection.y === -direction.y) {
    return;
  }

  setDirection(newDirection);
};

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
    if (gameOver || !gameStarted) return;

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
  }, [direction, gameOver, gameStarted]);

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
  setGameStarted(true);

  previousSnakeLength.current = 3;
};

useEffect(() => {
  if (!user) return;

  const loadBestScore = async () => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setBestScore(userSnap.data().bestScore || 0);
      }
    } catch (error) {
      console.error("Error loading high score:", error);
    }
  };

  loadBestScore();
}, [user]);


useEffect(() => {
  if (!gameOver || !user) return;

  if (score > bestScore) {
    const saveBestScore = async () => {
      try {
        const userRef = doc(db, "users", user.uid);

        await setDoc(
          userRef,
          {
            bestScore: score,
          },
          { merge: true }
        );

        setBestScore(score);
      } catch (error) {
        console.error("Error saving high score:", error);
      }
    };

    saveBestScore();
  }
}, [gameOver, score, bestScore, user]);


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

      {(!gameStarted || gameOver) && (
  <div className="game-over">
    {gameOver && (
      <>
        <h2>💀 Game Over</h2>
        <p>Final Score: {score}</p>
      </>
    )}

    <div className="score-container">
    <h2>Score: {score}</h2>
    <h2>🏆 Best: {bestScore}</h2>
    </div>

    <button onClick={restartGame}>
      {gameOver ? "🔄 Restart" : "▶ Start Game"}
    </button>
  </div>
)}
          <div className="mobile-controls">
  <button  onTouchStart={(e) => { e.preventDefault(); changeDirection({ x: 0, y: -1 })}}>
    ▲
  </button>

  <div className="horizontal-controls"
  onTouchMove={(e) => e.preventDefault()}>
    <button onTouchStart={(e) => { e.preventDefault(); changeDirection({ x: -1, y: 0 })}}>
      ◀
    </button>

    <button onTouchStart={(e) => { e.preventDefault(); changeDirection({ x: 0, y: 1 })}}>
      ▼
    </button>

    <button onTouchStart={(e) => { e.preventDefault(); changeDirection({ x: 1, y: 0 })}}>
      ▶
    </button>
  </div>
</div>

<p>Use the arrow keys or buttons to move</p>
    
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