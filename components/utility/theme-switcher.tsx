import {
  IconMoon,
  IconSun,
  IconHeart,
  IconHeartBroken
} from "@tabler/icons-react"
import { useTheme } from "next-themes"
import { FC } from "react"
import { SIDEBAR_ICON_SIZE } from "../sidebar/sidebar-switcher"
import { Button } from "../ui/button"

interface ThemeSwitcherProps {}

export const ThemeSwitcher: FC<ThemeSwitcherProps> = () => {
  const { setTheme, theme } = useTheme()

  const handleChange = (
    newTheme: "light" | "dark" | "yana-light" | "yana-dark"
  ) => {
    localStorage.setItem("theme", newTheme)
    setTheme(newTheme)
  }

  const getNextTheme = (): "light" | "dark" | "yana-light" | "yana-dark" => {
    if (theme === "light") return "dark"
    if (theme === "dark") return "yana-light"
    if (theme === "yana-light") return "yana-dark"
    if (theme === "yana-dark") return "light"
    return "yana-light"
  }

  const getThemeIcon = () => {
    switch (theme) {
      case "dark":
        return <IconMoon size={SIDEBAR_ICON_SIZE} />
      case "yana-dark":
        return <IconMoon size={SIDEBAR_ICON_SIZE} className="text-[#E87A4F]" />
      case "yana-light":
        return <IconSun size={SIDEBAR_ICON_SIZE} className="text-[#E87A4F]" />
      default:
        return <IconSun size={SIDEBAR_ICON_SIZE} />
    }
  }

  return (
    <Button
      className="flex cursor-pointer space-x-2"
      variant="ghost"
      size="icon"
      onClick={() => handleChange(getNextTheme())}
      title={`Current theme: ${theme || "yana-light"}`}
    >
      {getThemeIcon()}
    </Button>
  )
}
