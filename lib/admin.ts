const ADMIN_EMAILS = ["pablo@pxsol.com", "sofia@pxsol.com", "nw@racimo.tech", "camila@pxsol.com"]

export function isAdmin(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase())
}
