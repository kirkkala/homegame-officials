import { LoginClient } from "./login-client"

export default function LoginPage() {
  const adminEmail = process.env.ADMIN_EMAIL ?? ""
  return <LoginClient adminEmail={adminEmail} />
}
