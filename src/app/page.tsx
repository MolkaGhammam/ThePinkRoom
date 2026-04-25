import { redirect } from "next/navigation";

// The root path redirects to the default locale. Middleware handles all
// subsequent locale-aware routing.
export default function RootPage() {
  redirect("/fr");
}
