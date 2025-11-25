import React, { useState } from "react";
import SignupForm from "./SignupForm";
import PlacementForm from "./PlacementForm";

const Signup = () => {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState(null);

  const handleSignupSuccess = (data) => {
    setUserData(data);
    setStep(2); // Switches to the next form
  };

  return (
    // Note: 'bg-gradient-to-b' is the standard Tailwind class
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#1F3F77] to-[#21427C]">
      <div className="m-5 p-5 bg-[#335288] rounded-xl shadow-lg">
        {step === 1 && <SignupForm onSuccess={handleSignupSuccess} />}
        {step === 2 && <PlacementForm userData={userData} />}
      </div>
    </div>
  );
};

export default Signup;