import { useClerk } from "@clerk/nextjs";
import Button from "@/components/ui/button";
import { LogOut } from "lucide-react";

export const SignOutButton = () => {
    const { signOut } = useClerk();

    return (
        <Button 
            onClick={() => signOut({ redirectUrl: '/' })}
            className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200 px-4 py-2 rounded-xl transition-all"
        >
            <LogOut className="h-4 w-4" />
            Sign Out
        </Button>
    )
}
