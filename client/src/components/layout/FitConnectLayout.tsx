import React, { ReactNode } from "react";
import { TopNavbar } from "./TopNavbar";

interface FitConnectLayoutProps {
  children: ReactNode;
}

export const FitConnectLayout: React.FC<FitConnectLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNavbar />
      <main className="flex-1 overflow-auto pb-4">
        {children}
      </main>
    </div>
  );
};