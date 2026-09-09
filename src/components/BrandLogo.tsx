import { useTheme } from "../context/ThemeContext";

interface BrandLogoProps {
    size?: "sm" | "md";
    showName?: boolean;
}

export default function BrandLogo({ size = "md", showName = true }: BrandLogoProps) {
    const { theme } = useTheme();
    const circleSize = size === "sm" ? "h-6 w-6 text-sm" : "h-8 w-8 text-lg";

    return (
        <div className="flex items-center gap-2">
            <span
                className={`flex ${circleSize} items-center justify-center rounded-full`}
                style={{ background: "#9b7af5", color: theme === "light" ? "#ffffff" : "#100c18" }}
                aria-hidden="true"
            >
                ♪
            </span>
            {showName && <span className="font-display text-lg font-bold tracking-tight">Musity</span>}
        </div>
    );
}
