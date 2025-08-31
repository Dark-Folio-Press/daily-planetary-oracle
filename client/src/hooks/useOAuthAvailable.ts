import { useQuery } from "@tanstack/react-query";

export function useOAuthAvailable() {
  const { data: oauthStatus } = useQuery({
    queryKey: ["/api/auth/oauth-status"],
    retry: false,
    staleTime: 300000, // 5 minutes
  });

  return {
    googleAvailable: (oauthStatus as any)?.google || false,
    discordAvailable: (oauthStatus as any)?.discord || false,
  };
}