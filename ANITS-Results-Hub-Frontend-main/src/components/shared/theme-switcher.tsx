
"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(systemTheme);
      localStorage.removeItem("theme");
    } else {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(theme);
      localStorage.setItem("theme", theme);
    }
  }, [theme]);


  return (
    <div className="space-y-4">
      <Label>Theme</Label>
      <div className="flex items-center space-x-2 rounded-lg bg-secondary p-1">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full justify-center",
            theme === "light" && "bg-background text-foreground shadow-sm"
          )}
          onClick={() => setTheme("light")}
        >
          <Sun className="mr-2 h-4 w-4" />
          Light
        </Button>
        <Button
          variant="ghost"
          size="sm"
           className={cn(
            "w-full justify-center",
            theme === "dark" && "bg-background text-foreground shadow-sm"
          )}
          onClick={() => setTheme("dark")}
        >
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </Button>
        <Button
          variant="ghost"
          size="sm"
           className={cn(
            "w-full justify-center",
            theme === "system" && "bg-background text-foreground shadow-sm"
          )}
          onClick={() => setTheme("system")}
        >
          <Monitor className="mr-2 h-4 w-4" />
          System
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Select the theme for the application. System will match your OS settings.
      </p>
    </div>
  );
}
