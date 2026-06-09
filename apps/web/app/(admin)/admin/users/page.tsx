import { redirect } from "next/navigation";
import { Filter } from "lucide-react";
import { USER_ROLES } from "@/lib/schemas";
import { getSession } from "@/lib/auth";
import { AdminUserActions } from "@/components/admin/admin-user-actions";
import { AppShell } from "@/components/layout/app-shell-server";
import { EmptyState } from "@/components/layout/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/requests";
import { formatRole, getAdminUsers } from "@/lib/admin";

type AdminUsersPageProps = {
  searchParams: Promise<{
    role?: string;
    isActive?: string;
    search?: string;
  }>;
};

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const filters = await searchParams;
  const users = await getAdminUsers(session.apiToken, filters);

  return (
    <AppShell title="User Management" role="admin">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_180px_180px_auto] xl:items-end">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                name="search"
                type="search"
                placeholder="Name or email"
                defaultValue={filters.search ?? ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                name="role"
                defaultValue={filters.role ?? ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">All roles</option>
                {USER_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {formatRole(role)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="isActive">Status</Label>
              <select
                id="isActive"
                name="isActive"
                defaultValue={filters.isActive ?? ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">All statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <Button type="submit" className="gap-2">
              <Filter className="h-4 w-4" />
              Apply
            </Button>
          </form>
        </CardContent>
      </Card>

      {users.length > 0 ? (
        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="space-y-5 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold tracking-normal">{user.name}</h2>
                      <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{formatRole(user.role)}</Badge>
                      <Badge variant={user.isActive ? "outline" : "muted"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>

                  <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                    <span>Joined: {formatDate(user.createdAt)}</span>
                    <span>Submitted: {user._count.requests}</span>
                    <span>Assigned: {user._count.assigned}</span>
                  </div>
                </div>

                <AdminUserActions apiToken={session.apiToken} user={user} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No matching users" description="Try changing the filters or search term." />
      )}
    </AppShell>
  );
}
