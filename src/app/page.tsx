/**
 * Root Home Page
 * 
 * Redirects users to the dashboard/event discovery page.
 */

import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard");
}
