import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:3000";

const SignupForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json?.error || "Signup failed");

      // --- FIX: SAVE TO LOCAL STORAGE ---
      // We save the response so it persists even if the page refreshes
      localStorage.setItem("signupData", JSON.stringify(json));
      
      navigate("/placementform");
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ... (Rest of your UI code remains exactly the same) ...
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#1F3F77] to-[#21427C]">
       {/* ... your existing JSX ... */}
       {/* Just ensure the form tag uses onSubmit={handleSubmit(onSubmit)} */}
       <div className="m-5 p-5 bg-[#335288] rounded-xl shadow-lg flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center mb-5">
          <h2 className="text-3xl font-bold text-white">Create Account</h2>
           {/* ... header text ... */}
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center gap-5">
           {/* ... Inputs for FullName, Email, Password ... */}
           {/* This part of your code was fine, no need to change UI */}
           <div className="w-full">
            <input
              type="text"
              placeholder="FullName"
              {...register("FullName", { required: "FullName is required" })}
              className="text-white bg-[#5B749F] rounded-lg px-2 py-1 w-[300px] placeholder-gray-300"
            />
           </div>
           <div className="w-full">
            <input
              type="email"
              placeholder="Email"
              {...register("Email", { required: "Email is required" })}
              className="text-white bg-[#5B749F] rounded-lg px-2 py-1 w-[300px] placeholder-gray-300"
            />
           </div>
           <div className="w-full">
             <input
              type="password"
              placeholder="Password"
              {...register("Password", { required: "Password is required" })}
              className="text-white bg-[#5B749F] rounded-lg px-2 py-1 w-[300px] placeholder-gray-300"
            />
           </div>

          <button
            type="submit"
            disabled={loading}
            className="text-black font-bold bg-gradient-to-r from-[#46B4FE] to-[#0DE6FE] w-[300px] rounded-lg px-2 py-1 mt-2"
          >
            {loading ? "Signing up..." : "Signup"}
          </button>
          {error && <div className="text-red-400 text-center">{error}</div>}
        </form>
         {/* ... Login link ... */}
      </div>
    </div>
  );
};

export default SignupForm;