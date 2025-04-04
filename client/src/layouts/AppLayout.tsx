import { ReactNode } from "react";
import { TopNavbar } from "@/components/layout/TopNavbar";

type AppLayoutProps = {
  children: ReactNode;
};

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNavbar />
      
      <main className="flex-1 overflow-auto pb-4">
        {children}
      </main>
    </div>
  );
};
