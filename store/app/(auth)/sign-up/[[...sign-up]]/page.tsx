import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen py-20 bg-luxury-emerald">
        <SignUp />
    </div>
  );
}
