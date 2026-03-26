import { Metadata } from "next";
import SignUpForm from "@/components/auth/SignUpForm";
export const metadata: Metadata = {
  title: "Sign up disabled",
  description: "Sign up is currently disabled for this application.",
};

export default function SignUp() {
  return <SignUpForm />;;
}

