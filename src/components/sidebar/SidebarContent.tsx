import { ReactNode } from "react";
import { ScrollArea } from "../ui/scroll-area";

interface SidebarContentProps {
  children: ReactNode;
}

export const SidebarContent = ({ children }: SidebarContentProps) => {
  return (
    <ScrollArea className="flex-1 p-4">
      {children}
    </ScrollArea>
  );
};