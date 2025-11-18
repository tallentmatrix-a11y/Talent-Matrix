import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:3000";

const PlacementForm = () => {
  const navigate = useNavigate();
  
  // --- FIX: LOAD DATA FROM LOCAL STORAGE ---
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("signupData");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUserData(parsed);
    } else {
      // If no data found, force them back to signup
      alert("User data missing. Please sign up first.");
      navigate("/signup");
    }
  }, [navigate]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    // We use a simpler approach for default values to avoid sync issues
  });

  // Prefill Name once userData is loaded
  useEffect(() => {
    if (userData && userData.FullName) {
      setValue("FullName", userData.FullName);
    }
  }, [userData, setValue]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ... (Dynamic logic for Semesters is unchanged) ...
  const watchedYear = watch("Year");
  const watchedSemester = watch("Semester");

  const getSemesters = (year) => {
    if (year === "1") return ["1", "2"];
    if (year === "2") return ["3", "4"];
    if (year === "3") return ["5", "6"];
    if (year === "4") return ["7", "8"];
    return [];
  };

  const currentSemesters = getSemesters(watchedYear);
  const semToShow = parseInt(watchedSemester || "0", 10);

  useEffect(() => {
    setValue("Semester", "");
    for (let i = 1; i <= 8; i++) setValue(`gpa_sem_${i}`, "");
  }, [watchedYear, setValue]);

  useEffect(() => {
    const sem = parseInt(watchedSemester || "0", 10);
    if (sem) {
      for (let i = sem + 1; i <= 8; i++) setValue(`gpa_sem_${i}`, "");
    }
  }, [watchedSemester, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);

    try {
      const fd = new FormData();

      // --- FIX: ROBUST ID CHECK ---
      // We check multiple places where the ID might be hiding
      // 1. userData._id (Standard Mongo)
      // 2. userData.id (Standard SQL)
      // 3. userData.user._id (If backend wraps response in { user: ... })
      // 4. userData.newUser._id (Common in some tutorials)
      
      const userId = userData?._id || userData?.id || userData?.user?._id || userData?.user?.id || userData?.newUser?._id;

      if (!userId) {
        console.log("Debug User Data:", userData); // Check console if this fails!
        throw new Error("User ID missing. Please sign up again.");
      }
      
      fd.append("userId", userId);
      fd.append("FullName", data.FullName);
      fd.append("RollNumber", data.RollNumber);
      fd.append("Year", data.Year);
      fd.append("Semester", data.Semester);

      for (let i = 1; i <= 8; i++) {
        const key = `gpa_sem_${i}`;
        if (data[key]) fd.append(key, data[key]);
      }

      if (data.imageUpload && data.imageUpload[0]) {
        fd.append("imageUpload", data.imageUpload[0]);
      }
      if (data.resumeUpload && data.resumeUpload[0]) {
        fd.append("resumeUpload", data.resumeUpload[0]);
      }

      const res = await fetch(`${API_BASE}/api/placement`, {
        method: "POST",
        body: fd,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Placement save failed");

      // Clear temporary data after success
      localStorage.removeItem("signupData");

      alert("Profile completed successfully! Please login.");
      navigate("/login"); 

    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!userData) return <div className="text-white text-center mt-10">Loading user data...</div>;

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#1F3F77] to-[#21427C]">
      <div className="m-5 p-5 bg-[#335288] rounded-xl shadow-lg flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center mb-5">
          <h2 className="text-3xl font-bold text-white">Placement Details</h2>
          <h2 className="text-md font-thin text-white">Complete your Profile</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center gap-5 w-full">
          
          <input
            type="text"
            placeholder="FullName"
            {...register("FullName", { required: true })}
            className="text-white bg-[#5B749F] rounded-lg px-2 py-1 w-[300px]"
          />

          <div className="w-full flex justify-center flex-col items-center">
            <input
              type="text"
              placeholder="RollNumber"
              {...register("RollNumber", { required: "Roll Number is required" })}
              className="text-white bg-[#5B749F] rounded-lg px-2 py-1 w-[300px]"
            />
             {errors.RollNumber && <p className="text-red-400 text-sm mt-1">{errors.RollNumber.message}</p>}
          </div>

          {/* Image Upload */}
          <div className="w-[300px]">
            <label className="text-white text-sm mb-1 block">Profile Photo</label>
            <input
              type="file"
              accept="image/*"
              {...register("imageUpload")}
              className="text-white bg-[#5B749F] rounded-lg px-2 py-1 w-full"
            />
          </div>

          {/* Resume Upload */}
          <div className="w-[300px]">
            <label className="text-white text-sm mb-1 block">Resume (PDF)*</label>
            <input
              type="file"
              accept="application/pdf"
              {...register("resumeUpload", { required: "Resume is required" })}
              className="text-white bg-[#5B749F] rounded-lg px-2 py-1 w-full"
            />
            {errors.resumeUpload && <p className="text-red-400 text-sm mt-1">Resume is required</p>}
          </div>

          <select
            {...register("Year", { required: true })}
            className="text-white bg-[#5B749F] rounded-lg px-2 py-1 w-[300px]"
          >
            <option value="">-- Select Year --</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>

          <select
            {...register("Semester", { required: true })}
            className="text-white bg-[#5B749F] rounded-lg px-2 py-1 w-[300px]"
          >
            <option value="">-- Select Semester --</option>
            {currentSemesters.map((s) => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>

          {semToShow > 0 && (
            <div className="flex flex-col gap-2 w-[300px]">
              <h3 className="text-white text-sm font-bold">Enter GPA for completed semesters:</h3>
              {Array.from({ length: semToShow }, (_, i) => i + 1).map((s) => (
                <div key={s}>
                  <input
                    type="text"
                    placeholder={`Semester ${s} GPA`}
                    {...register(`gpa_sem_${s}`, {
                      required: "Required",
                      pattern: { value: /^\d+(\.\d+)?$/, message: "Invalid Number" },
                    })}
                    className="text-white bg-[#5B749F] rounded-lg px-2 py-1 w-full"
                  />
                  {errors[`gpa_sem_${s}`] && <span className="text-red-400 text-xs">{errors[`gpa_sem_${s}`].message}</span>}
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="text-black font-bold bg-gradient-to-r from-[#46B4FE] to-[#0DE6FE] w-[300px] rounded-lg px-2 py-1 mt-2"
          >
            {loading ? "Saving..." : "Save Details"}
          </button>
          {error && <div className="text-red-400 mt-2">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default PlacementForm;