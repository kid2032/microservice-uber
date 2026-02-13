import { Outlet } from "react-router";
import { redirect } from "react-router";
import { checkAuth } from "../../services/auth";

export async function loader() {
  const { isAuth, user } = await checkAuth();

  if (!isAuth) {
    throw redirect("/login");
  }

  return { user };
}

export default function ProtectedLayout() {
  return <Outlet />;
}
