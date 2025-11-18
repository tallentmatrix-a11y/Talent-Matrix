import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:3000";

const Login = () => {
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // We send 'Email' and 'Password' (Capitalized) because that matches
        // what the backend expects in req.body
        body: JSON.stringify({ 
          Email: data.Email, 
          Password: data.Password 
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Login failed");
      }

      // ✅ SAVE USER ID for Dashboard
      localStorage.setItem("userId", json.user.id);

      alert("Login Successful!");
      navigate("/dashboard");
      
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message);
    }
  };

  return (
    <div className="w-auto min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#1F3F77] to-[#21427C]">
      <div className="m-5 p-5 bg-[#335288] rounded-xl">
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
          <h2 className="text-md font-thin text-white">Login into your account</h2>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-auto h-auto flex flex-col items-center justify-center m-1 p-1 gap-5"
        >
          <label htmlFor="Email">
            <input
              type="email"
              placeholder="Email"
              {...register("Email", { required: true })}
              className="text-white bg-[#5B749F] rounded-lg px-2 py-1 w-[300px] placeholder-gray-300"
            />
          </label>
          
          <label htmlFor="Password">
            <input
              type="password"
              placeholder="Password"
              // ✅ FIXED: Changed "password" to "Password" to match onSubmit logic
              {...register("Password", { required: true })}
              className="text-white bg-[#5B749F] rounded-lg px-2 py-1 w-[300px] placeholder-gray-300"
            />
          </label>

          <button
            type="submit" 
            className="text-black font-bold bg-gradient-to-r from-[#46B4FE] to-[#0DE6FE] w-[300px] rounded-lg px-2 py-1 mt-2"
          >
            Login
          </button>
          
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </form>

        <div className="mt-4">
            <h2 className="text-white text-center text-md font-semibold">OR</h2>
        </div>
        
        <div className="flex flex-col items-center justify-center gap-3 mt-3">
           <button className="bg-white text-black w-[300px] font-bold rounded-lg px-2 py-1">
             Sign in with Google
           </button>
           <button className="bg-blue-600 text-white w-[300px] font-bold rounded-lg px-2 py-1">
             Sign in with LinkedIn
           </button>
        </div>
        
         <div className="flex flex-col items-center justify-center my-4">
            <h2 className="text-white font-thin text-md">
              Don't have an account?{" "}
              <span
                className="text-[#0DE6FE] font-semibold text-md cursor-pointer hover:underline"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </span>
            </h2>
          </div>
      </div>
    </div>
  );
};

export default Login;