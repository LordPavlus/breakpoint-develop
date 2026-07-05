import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { prisma } from "@/lib/prisma"
import { promoScopeLabels } from "@/lib/promo"
import { PromoCodeForm } from "./PromoCodeForm"
import { PromoCodeActiveSelect } from "./PromoCodeActiveSelect"

const expiryFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
})

export default async function AdminPromoCodesPage() {
  const promoCodes = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
    include: { owner: true },
  })

  return (
    <div className="space-y-8">
      <PromoCodeForm />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Код</TableHead>
            <TableHead>Скидка</TableHead>
            <TableHead>Область</TableHead>
            <TableHead>Использований</TableHead>
            <TableHead>Действует до</TableHead>
            <TableHead>Владелец</TableHead>
            <TableHead>Статус</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {promoCodes.map((promo) => (
            <TableRow key={promo.id}>
              <TableCell className="font-mono font-medium text-foreground">
                {promo.code}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {promo.discountValue.toString()}
                {promo.discountType === "PERCENT" ? "%" : " ₽"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {promoScopeLabels[promo.scope]}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {promo.usedCount}
                {promo.maxUses != null ? ` / ${promo.maxUses}` : ""}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {promo.expiresAt ? expiryFormatter.format(promo.expiresAt) : "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {promo.owner ? promo.owner.name ?? promo.owner.email ?? "—" : "Все пользователи"}
              </TableCell>
              <TableCell>
                <PromoCodeActiveSelect id={promo.id} active={promo.active} />
              </TableCell>
            </TableRow>
          ))}
          {promoCodes.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                Промокодов пока нет
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
