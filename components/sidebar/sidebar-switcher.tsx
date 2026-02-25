import { ContentType } from "@/types"
import { UserRole } from "@/types/user-role"
import {
  IconAdjustmentsHorizontal,
  IconBolt,
  IconBooks,
  IconFile,
  IconMessage,
  IconPencil,
  IconRobotFace,
  IconSparkles
} from "@tabler/icons-react"
import { FC, useContext } from "react"
import { ChatbotUIContext } from "@/context/context"
import { TabsList } from "../ui/tabs"
import { WithTooltip } from "../ui/with-tooltip"
import { ProfileSettings } from "../utility/profile-settings"
import { SidebarSwitchItem } from "./sidebar-switch-item"

export const SIDEBAR_ICON_SIZE = 28

interface SidebarSwitcherProps {
  onContentTypeChange: (contentType: ContentType) => void
}

export const SidebarSwitcher: FC<SidebarSwitcherProps> = ({
  onContentTypeChange
}) => {
  const { profile } = useContext(ChatbotUIContext)
  const isAdmin =
    profile?.role === UserRole.ADMIN || profile?.role === UserRole.SUPER_ADMIN

  return (
    <div className="flex flex-col justify-between border-r-2 pb-5">
      <TabsList className="bg-background grid h-[440px] grid-rows-7">
        <SidebarSwitchItem
          icon={<IconMessage size={SIDEBAR_ICON_SIZE} />}
          contentType="chats"
          onContentTypeChange={onContentTypeChange}
        />

        {isAdmin && (
          <SidebarSwitchItem
            icon={<IconAdjustmentsHorizontal size={SIDEBAR_ICON_SIZE} />}
            contentType="presets"
            onContentTypeChange={onContentTypeChange}
          />
        )}

        <SidebarSwitchItem
          icon={<IconPencil size={SIDEBAR_ICON_SIZE} />}
          contentType="prompts"
          onContentTypeChange={onContentTypeChange}
        />

        {isAdmin && (
          <SidebarSwitchItem
            icon={<IconSparkles size={SIDEBAR_ICON_SIZE} />}
            contentType="models"
            onContentTypeChange={onContentTypeChange}
          />
        )}

        {isAdmin && (
          <SidebarSwitchItem
            icon={<IconFile size={SIDEBAR_ICON_SIZE} />}
            contentType="files"
            onContentTypeChange={onContentTypeChange}
          />
        )}

        {isAdmin && (
          <SidebarSwitchItem
            icon={<IconBooks size={SIDEBAR_ICON_SIZE} />}
            contentType="collections"
            onContentTypeChange={onContentTypeChange}
          />
        )}

        {isAdmin && (
          <SidebarSwitchItem
            icon={<IconRobotFace size={SIDEBAR_ICON_SIZE} />}
            contentType="assistants"
            onContentTypeChange={onContentTypeChange}
          />
        )}

        {isAdmin && (
          <SidebarSwitchItem
            icon={<IconBolt size={SIDEBAR_ICON_SIZE} />}
            contentType="tools"
            onContentTypeChange={onContentTypeChange}
          />
        )}
      </TabsList>

      <div className="flex flex-col items-center space-y-4">
        {/* TODO */}
        {/* <WithTooltip display={<div>Import</div>} trigger={<Import />} /> */}

        {/* TODO */}
        {/* <Alerts /> */}

        <WithTooltip
          display={<div>Profile Settings</div>}
          trigger={<ProfileSettings />}
        />
      </div>
    </div>
  )
}
