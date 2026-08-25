import { useState } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
   GithubAuthProvider,
} from "firebase/auth";
import { auth } from "./firebase/config";

function Login({  onLogin, onRegister  }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();

       const result = await signInWithPopup(auth, provider);


      console.log("Google sign-in successful");
      console.log("USER:", result.user);
          onLogin(result.user);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleGithubLogin = async () => {
  try {
    const provider = new GithubAuthProvider();

    await signInWithPopup(auth, provider);

    console.log("GitHub sign-in successful");
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🐍 Snake Game</h1>
        <h2>Welcome Back</h2>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <button type="submit">
            Login
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button
          type="button"
          className="google-button"
          onClick={handleGoogleLogin}
        >
          🔵 Continue with Google
        </button>

        <button
  type="button"
  className="github-button"
  onClick={handleGithubLogin}
>
  🐙 Continue with GitHub
</button>

        <p>
          Don't have an account?{" "}
          <button type="button" onClick={onRegister}>
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;