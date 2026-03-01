import { IconMoon, IconSun } from "@tabler/icons-react"
import { useTheme } from "next-themes"
import { FC } from "react"
import { SIDEBAR_ICON_SIZE } from "../sidebar/sidebar-switcher"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../ui/dropdown-menu"

interface ThemeSwitcherProps {}

export const ThemeSwitcher: FC<ThemeSwitcherProps> = () => {
  const { setTheme, theme } = useTheme()

  const handleChange = (newTheme: string) => {
    localStorage.setItem("theme", newTheme)
    setTheme(newTheme)
  }

  const getThemeIcon = () => {
    switch (theme) {
      case "dark":
      case "yana-dark":
      case "yana-clay-dark":
      case "yana-neutral-dark":
      case "yana-sage-dark":
        return <IconMoon size={SIDEBAR_ICON_SIZE} className="text-[#E87A4F]" />
      case "yana-light":
      case "yana-clay-light":
      case "yana-neutral-light":
      case "yana-sage-light":
        return <IconSun size={SIDEBAR_ICON_SIZE} className="text-[#E87A4F]" />
      case "liven-dark":
      case "liven-dark2":
        return <IconMoon size={SIDEBAR_ICON_SIZE} className="text-[#388A5A]" />
      case "liven-light":
      case "liven-light2":
        return <IconSun size={SIDEBAR_ICON_SIZE} className="text-[#388A5A]" />
      case "yana-sepia":
        return <IconSun size={SIDEBAR_ICON_SIZE} className="text-[#A05C3A]" /> // A browner/terracota tint for the icon
      default:
        return <IconSun size={SIDEBAR_ICON_SIZE} />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="flex cursor-pointer space-x-2"
          variant="ghost"
          size="icon"
          title={`Current theme: ${theme || "yana-clay-light"}`}
        >
          {getThemeIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleChange("light")}>
          <IconSun size={16} className="mr-2" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleChange("dark")}>
          <IconMoon size={16} className="mr-2" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleChange("yana-light")}>
          <IconSun size={16} className="mr-2 text-[#E87A4F]" /> Yana Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleChange("yana-dark")}>
          <IconMoon size={16} className="mr-2 text-[#E87A4F]" /> Yana Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleChange("yana-sepia")}>
          <IconSun size={16} className="mr-2 text-[#A05C3A]" /> Yana Sepia
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleChange("yana-clay-light")}>
          <IconSun size={16} className="mr-2 text-[#E87A4F]" /> Clay Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleChange("yana-clay-dark")}>
          <IconMoon size={16} className="mr-2 text-[#E87A4F]" /> Clay Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleChange("yana-neutral-light")}>
          <IconSun size={16} className="mr-2 text-[#E87A4F]" /> Neutral Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleChange("yana-neutral-dark")}>
          <IconMoon size={16} className="mr-2 text-[#E87A4F]" /> Neutral Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleChange("yana-sage-light")}>
          <IconSun size={16} className="mr-2 text-[#E87A4F]" /> Sage Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleChange("yana-sage-dark")}>
          <IconMoon size={16} className="mr-2 text-[#E87A4F]" /> Sage Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleChange("liven-light")}>
          <IconSun size={16} className="mr-2 text-[#388A5A]" /> Liven Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleChange("liven-dark")}>
          <IconMoon size={16} className="mr-2 text-[#388A5A]" /> Liven Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleChange("liven-light2")}>
          <IconSun size={16} className="mr-2 text-[#388A5A]" /> Liven Light 2
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleChange("liven-dark2")}>
          <IconMoon size={16} className="mr-2 text-[#388A5A]" /> Liven Dark 2
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
