import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type StandingRow = {
  id: string
  played: number
  wins: number
  losses: number
  setsWon: number
  setsLost: number
  points: number
  player: { name: string | null }
}

export type GroupWithStandings = {
  id: string
  name: string
  standings: StandingRow[]
}

function compareStandings(a: StandingRow, b: StandingRow) {
  if (b.points !== a.points) return b.points - a.points
  const diffA = a.setsWon - a.setsLost
  const diffB = b.setsWon - b.setsLost
  if (diffB !== diffA) return diffB - diffA
  return b.setsWon - a.setsWon
}

export function GroupStandingsTable({ groups }: { groups: GroupWithStandings[] }) {
  return (
    <div className="space-y-6">
      {groups.map((group) => {
        const standings = [...group.standings].sort(compareStandings)

        return (
          <Card key={group.id}>
            <CardHeader>
              <CardTitle className="text-base">{group.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Игрок</TableHead>
                    <TableHead className="text-center">И</TableHead>
                    <TableHead className="text-center">В</TableHead>
                    <TableHead className="text-center">П</TableHead>
                    <TableHead className="text-center">Сеты</TableHead>
                    <TableHead className="text-center">Очки</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {standings.map((standing) => (
                    <TableRow key={standing.id}>
                      <TableCell className="font-medium text-foreground">
                        {standing.player.name ?? "Без имени"}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {standing.played}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {standing.wins}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {standing.losses}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {standing.setsWon}–{standing.setsLost}
                      </TableCell>
                      <TableCell className="text-center font-semibold text-foreground">
                        {standing.points}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
