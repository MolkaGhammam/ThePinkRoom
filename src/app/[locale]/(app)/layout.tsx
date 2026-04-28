import { getCurrentUser } from "@/lib/auth";
import { UserProvider } from "@/components/UserProvider";
import { AppBottomTabBar } from "@/components/AppBottomTabBar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <UserProvider user={user}>
      {children}
      <AppBottomTabBar />
    </UserProvider>
  );
}
