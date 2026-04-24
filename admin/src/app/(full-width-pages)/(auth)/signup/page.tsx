import { Metadata } from "next";
import SignUpForm from "@/components/auth/SignUpForm";
export const metadata: Metadata = {
  title: "Sign up ",
  description: "Sign up is available for this application.",
};

export default function SignUp() {
  return <SignUpForm />;;
}

