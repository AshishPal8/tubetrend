import React from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { Button } from "../ui/button";

function OAuth() {
  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="w-full flex items-center justify-center my-5">
      <Button variant="outline" onClick={handleGoogleLogin} className=" w-full">
        <Image src="/google.png" alt="Google" width={25} height={25} /> Continue
        with Google
      </Button>
    </div>
  );
}

export default OAuth;
