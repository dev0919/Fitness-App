import * as React from "react";
import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function ChatPage() {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  
  // Redirect to the combined friends & chat page
  useEffect(() => {
    if (id) {
      navigate(`/friends/${id}`);
    } else {
      navigate('/friends');
    }
  }, [id, navigate]);
  
  return (
    <div className="p-8 flex justify-center items-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
      <span>Redirecting to Friends & Chat page...</span>
    </div>
  );
}