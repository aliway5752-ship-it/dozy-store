import { cn } from "@/lib/utils";
import { MouseEventHandler } from "react";

interface IconButtonProps {
    onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
    icon: React.ReactElement;
    className?: string;
    disabled?: boolean;
}

const IconButton: React.FC<IconButtonProps> = ({ onClick, className, icon, disabled }) => {
    return ( 
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn("rounded-full flex items-center justify-center bg-white border shadow-md p-2 hover:scale-110 transition disabled:cursor-not-allowed disabled:opacity-50", className)}>
                {icon}
        </button>
     );
}
 
export default IconButton;