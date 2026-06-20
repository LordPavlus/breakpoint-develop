import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { dateFormatter } from "@/app/trainings/components/TrainingSlotCard"
import { UserRoleSelect } from "./UserRoleSelect"

export default async function AdminUsersPage() {
  const session = await auth()
  const currentUserId = session?.user?.id

  if (!currentUserId) {
    redirect("/login")
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Имя</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Регистрация</TableHead>
          <TableHead>Роль</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium text-foreground">
              {user.name ?? "—"}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {user.email ?? "—"}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {dateFormatter.format(user.createdAt)}
            </TableCell>
            <TableCell>
              <UserRoleSelect
                userId={user.id}
                role={user.role}
                disabled={user.id === currentUserId}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
