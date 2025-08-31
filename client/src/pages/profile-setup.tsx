import { useAuth } from "@/hooks/useAuth";
import ConstellationOnboarding from "@/components/constellation-onboarding";

export default function ProfileSetupPage() {
  const { user, isLoading } = useAuth();

  const handleComplete = () => {
    window.location.href = "/";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <ConstellationOnboarding 
      onComplete={handleComplete}
      user={user}
    />
  );
}