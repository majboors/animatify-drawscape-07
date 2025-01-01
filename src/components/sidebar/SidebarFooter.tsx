import { ReactNode } from "react";

interface SidebarFooterProps {
  children: ReactNode;
}

export const SidebarFooter = ({ children }: SidebarFooterProps) => {
  return (
    <div className="border-t p-4">
      {children}
    </div>
  );
};