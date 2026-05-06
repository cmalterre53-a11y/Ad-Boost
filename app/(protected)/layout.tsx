import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import HeaderNav from "./header-nav";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-white">
      <HeaderNav email={user.email ?? ""} />
      {children}
    </div>
  );
}
