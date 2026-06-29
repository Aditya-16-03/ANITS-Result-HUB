
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

type Theme = "light" | "dark" | "system"

export function ThemeToggle() {
    const [theme, setThemeState] = React.useState<Theme>("system")
    const { toast } = useToast()

    React.useEffect(() => {
        const storedTheme = localStorage.getItem("theme") as Theme | null;
        if (storedTheme) {
        setThemeState(storedTheme);
        }
    }, [])

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        if (newTheme === "system") {
            localStorage.removeItem("theme")
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            document.documentElement.classList.remove("light", "dark");
            document.documentElement.classList.add(systemTheme);
        } else {
            localStorage.setItem("theme", newTheme)
            document.documentElement.classList.remove("light", "dark");
            document.documentElement.classList.add(newTheme);
        }
        toast({
            title: `Theme changed to ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)}`,
        });
    }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
