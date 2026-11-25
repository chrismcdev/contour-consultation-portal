import { redirect } from "next/navigation";

const ProtectedPage = (): never => redirect("/dashboard");

export default ProtectedPage;
