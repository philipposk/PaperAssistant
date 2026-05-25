import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../lib/auth";

export function AuthCallback() {
  const navigate = useNavigate();
  const { loading, isSignedIn } = useAuth();

  useEffect(() => {
    if (loading) return;
    navigate(isSignedIn ? "/" : "/auth", { replace: true });
  }, [loading, isSignedIn, navigate]);

  return (
    <div className="h-full flex items-center justify-center text-sm text-[var(--color-ink-3)]">
      <Loader2 size={16} className="animate-spin mr-2" />
      Signing you in…
    </div>
  );
}
