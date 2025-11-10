import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const Signup = () => {
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);
    const [signupData, setSignupData] = useState(null);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors },
    } = useForm();

    const navigate = useNavigate();

    // watch fields
    const watchedImage = watch("imageUpload");
    const watchedResume = watch("resumeUpload");
    const watchedYear = watch("Year"); // "1","2","3","4"
    const watchedSemester = watch("Semester"); // "1".."8"

    // helper: map year -> semesters
    const semesterOptionsForYear = (year) => {
        if (year === "1") return ["1", "2"];
        if (year === "2") return ["3", "4"];
        if (year === "3") return ["5", "6"];
        if (year === "4") return ["7", "8"];
        return [];
    };

    // When year changes, clear semester and GPA inputs
    useEffect(() => {
        setValue("Semester", "");
        // optional: clear stored sem GPA fields
        for (let i = 1; i <= 8; i++) {
        setValue(`gpa_sem_${i}`, "");
        }
    }, [watchedYear, setValue]);

    // When semester selection reduces, clear higher GPAs
    useEffect(() => {
        const sem = parseInt(watchedSemester || "0", 10);
        if (!sem) return;
        for (let i = sem + 1; i <= 8; i++) {
        setValue(`gpa_sem_${i}`, "");
        }
    }, [watchedSemester, setValue]);

    // For demonstration we won't show previews in UI anymore,
    // but we'll still keep File objects accessible in state/console.

    // First form submit (account creation) - no photo upload here anymore
    const onSignupSubmit = (data) => {
        const partial = {
        FullName: data.FullName,
        Email: data.Email,
        Password: data.Password,
        // no imageUpload from first form
        };

        setSignupData(partial);
        setIsFormSubmitted(true);

        // clear sensitive fields if desired
        reset({
        FullName: partial.FullName,
        Email: partial.Email,
        Password: "",
        });
    };

    // Second form submit (placement details) — append to existing signupData
    const onPlacementSubmit = (data) => {
        // Resolve files chosen in placement form (if any)
        const imageFile = data.imageUpload && data.imageUpload.length > 0 ? data.imageUpload[0] : signupData?.imageUpload || null;
        const resumeFile = data.resumeUpload && data.resumeUpload.length > 0 ? data.resumeUpload[0] : null;

        // Gather semester-wise GPAs from form fields up to the selected semester
        const sem = parseInt(data.Semester || "0", 10);
        const gpas = {};
        if (sem > 0) {
        for (let i = 1; i <= sem; i++) {
            // fields named gpa_sem_1 ... gpa_sem_8
            gpas[`sem_${i}`] = data[`gpa_sem_${i}`] ?? "";
        }
        }

        const combined = {
        ...signupData,
        FullName: data.FullName ?? signupData?.FullName,
        RollNumber: data.RollNumber,
        Year: data.Year,
        Semester: data.Semester,
        gpas, // semester-wise GPAs
        imageUpload: imageFile,
        resumeUpload: resumeFile,
        };

        setSignupData(combined);

        // Show combined object in console only (no UI preview)
        // For files, also log their metadata so you can see types
        console.log("=== Combined signup data ===");
        const serializable = {
        ...combined,
        imageUpload: combined.imageUpload ? { name: combined.imageUpload.name, type: combined.imageUpload.type, size: combined.imageUpload.size } : null,
        resumeUpload: combined.resumeUpload ? { name: combined.resumeUpload.name, type: combined.resumeUpload.type, size: combined.resumeUpload.size } : null,
        };
        console.log(serializable);

        // If you want to send to server, build FormData:
        // const fd = new FormData();
        // fd.append("FullName", combined.FullName);
        // fd.append("RollNumber", combined.RollNumber);
        // fd.append("Year", combined.Year);
        // fd.append("Semester", combined.Semester);
        // fd.append("gpas", JSON.stringify(combined.gpas));
        // if (combined.imageUpload) fd.append("imageUpload", combined.imageUpload);
        // if (combined.resumeUpload) fd.append("resumeUpload", combined.resumeUpload);
        // fetch("/api/register", { method: "POST", body: fd })

        // Optionally navigate after saving
        // navigate("/dashboard");
    };

    // semester options for current year (watch)
    const currentSemesterOptions = semesterOptionsForYear(watchedYear);

    // Determine how many GPA inputs to show: based on watchedSemester (if chosen) else none
    const semToShow = parseInt(watchedSemester || "0", 10);

    return (
        <>
        {!isFormSubmitted && (
            <div id="f1" className="w-auto min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-[#1F3F77] to-bg-[#21427C]">
            <div className="m-5 p-5 bg-[#335288] rounded-xl">
                <div className="flex flex-col items-center justify-center">
                <h2 className="text-3xl font-bold text-white">Create Account</h2>
                <h2 className="text-md font-thin text-white">Join the community of Talent Matrix</h2>
                </div>

                <form onSubmit={handleSubmit(onSignupSubmit)} className="w-auto h-auto flex flex-col items-center justify-center m-1 p-1 gap-5">
                <input
                    type="text"
                    placeholder="FullName"
                    {...register("FullName", { required: true })}
                    className="text-white bg-[#5B749F] rounded-lg px-2 py-1 w-[300px]"
                />
                {errors.FullName && <span className="text-red-400">FullName is required</span>}

                <input
                    type="email"
                    placeholder="Email"
                    {...register("Email", { required: true })}
                    className="text-white bg-[#5B749F] rounded-lg px-2 py-1 w-[300px]"
                />
                {errors.Email && <span className="text-red-400">Email is required</span>}

                <input
                    type="password"
                    placeholder="Password"
                    {...register("Password", { required: true })}
                    className="text-white bg-[#5B749F] rounded-lg px-2 py-1 w-[300px]"
                />
                {errors.Password && <span className="text-red-400">Password is required</span>}

                {/* Photo upload removed from first form as requested */}

                <button type="submit" className="text-black font-bold bg-linear-to-r from-[#46B4FE] to-[#0DE6FE] w-[300px] rounded-lg px-2 py-1">
                    Signup
                </button>
                </form>

                <div className="mt-3">
                <h2 className="text-white text-md font-semibold">
                    Already Have an Account{" "}
                    <span className="text-[#0DE6FE] font-semibold text-md cursor-pointer" onClick={() => navigate("/login")}>
                    Login
                    </span>
                </h2>
                </div>
            </div>
            </div>
        )}

        {isFormSubmitted && (
            <div id="f2" className="w-auto min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-[#1F3F77] to-bg-[#21427C]">
            <div className="m-5 p-5 bg-[#335288] rounded-xl">
                <div className="flex flex-col items-center justify-center">
                <h2 className="text-3xl font-bold text-white">Placement Details</h2>
                <h2 className="text-md font-thin text-white">Complete your Profile</h2>
                </div>

                <form onSubmit={handleSubmit(onPlacementSubmit)} className="w-auto h-auto flex flex-col items-center justify-center m-1 p-1 gap-5">
                <input
                    type="text"
                    placeholder="FullName"
                    {...register("FullName", { required: true })}
                    className="text-white bg-[#5B749F] rounded-lg px-2 py-1 w-[300px]"
                    defaultValue={signupData?.FullName || ""}
                />
                {errors.FullName && <span className="text-red-400">FullName is required</span>}

                <input
                    type="text"
                    placeholder="RollNumber"
                    {...register("RollNumber", { required: true })}
                    className="text-white bg-[#5B749F] rounded-lg px-2 py-1 w-[300px]"
                />
                {errors.RollNumber && <span className="text-red-400">RollNumber is required</span>}

                <div>
                    <h3 className="text-white mb-2">Update Photo (optional)</h3>
                    <input type="file" accept="image/*" {...register("imageUpload")} className="text-white bg-[#5B749F] rounded-lg px-2 py-1 w-[300px]" />
                    {/* note: we do not show image preview or metadata in UI per request */}
                </div>

                <div>
                    <h3 className="text-white mb-2">Select Year</h3>
                    <select {...register("Year", { required: true })} className="text-white bg-[#5B749F] rounded-lg px-2 py-1 w-[300px]">
                    <option value="">-- Select Year --</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                    </select>
                </div>
                {errors.Year && <span className="text-red-400">Year is required</span>}

                <div>
                    <h3 className="text-white mb-2">Select Semester</h3>
                    <select {...register("Semester", { required: true })} className="text-white bg-[#5B749F] rounded-lg px-2 py-1 w-[300px]">
                    <option value="">-- Select Semester --</option>
                    {currentSemesterOptions.length === 0 && <option disabled>Choose Year first</option>}
                    {currentSemesterOptions.map((sem) => (
                        <option key={sem} value={sem}>
                        Semester {sem}
                        </option>
                    ))}
                    </select>
                </div>
                {errors.Semester && <span className="text-red-400">Semester is required</span>}

                {/* Show GPA inputs for semesters 1..selectedSemester */}
                <div className="w-full flex flex-col items-center gap-2">
                    <h3 className="text-white mb-2">Semester-wise GPA</h3>
                    {semToShow <= 0 && <div className="text-white text-sm">Choose a Semester to enter GPA fields.</div>}
                    {Array.from({ length: semToShow }, (_, i) => i + 1).map((s) => (
                    <input
                        key={s}
                        type="text"
                        placeholder={`Semester ${s} GPA`}
                        {...register(`gpa_sem_${s}`, {
                        required: true,
                        // optional: basic pattern to allow decimals like 8.5 or 9
                        pattern: { value: /^\d+(\.\d+)?$/, message: "Enter a valid number" },
                        })}
                        className="text-white bg-[#5B749F] rounded-lg px-2 py-1 w-[300px]"
                    />
                    ))}
                    {/* Show errors per GPA field (first error encountered) */}
                    {semToShow > 0 &&
                    Array.from({ length: semToShow }, (_, i) => i + 1).map((s) => {
                        const name = `gpa_sem_${s}`;
                        const e = errors[name];
                        return (
                        e && (
                            <span key={name} className="text-red-400 text-sm">
                            {`Semester ${s} GPA is required and should be a number`}
                            </span>
                        )
                        );
                    })}
                </div>

                <div>
                    <h3 className="text-white mb-2">Upload Resume</h3>
                    <input type="file" id="resumeUpload" accept="application/pdf" {...register("resumeUpload", { required: true })} className="text-white bg-[#5B749F] rounded-lg px-2 py-1 w-[300px]" />
                </div>
                {errors.resumeUpload && <span className="text-red-400">Resume is required</span>}

                <button type="submit" className="text-black font-bold bg-linear-to-r from-[#46B4FE] to-[#0DE6FE] w-[300px] rounded-lg px-2 py-1">
                    Save Details
                </button>
                </form>
            </div>
            </div>
        )}
        </>
    );
    };

export default Signup;
