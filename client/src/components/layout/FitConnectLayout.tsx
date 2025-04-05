import React, { ReactNode } from "react";
import { TopNavbar } from "./TopNavbar";

interface FitConnectLayoutProps {
  children: ReactNode;
}

export const FitConnectLayout: React.FC<FitConnectLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col max-w-full">
      <TopNavbar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto pb-4 w-full">
        {children}
      </main>
    </div>
  );
};