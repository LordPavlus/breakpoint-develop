import Link from "next/link"
import {
  Award,
  CalendarCheck,
  Dumbbell,
  Gift,
  Repeat,
  Star,
  Ticket,
  Trophy,
  UserPlus,
  Users,
  Video,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { REFERRAL_DISCOUNT_PERCENT, REFERRAL_REWARD_PERCENT } from "@/lib/promo"

const heroPoints = [
  {
    icon: Trophy,
    text: "Призы и атмосфера настоящего турнира",
  },
  {
    icon: Users,
    text: "Новые знакомства в комьюнити игроков",
  },
  {
    icon: Repeat,
    text: "Тренировки и турниры каждую неделю",
  },
]

const features = [
  {
    icon: CalendarCheck,
    title: "Тренировки",
    description:
      "Гибкое расписание свободных слотов от тренеров — выбирайте удобное время, корт и записывайтесь в один клик.",
  },
  {
    icon: Trophy,
    title: "Турниры",
    description:
      "Соревнуйтесь с игроками своего уровня NTRP: групповой этап и сетка плей-офф с турнирной таблицей.",
  },
  {
    icon: Star,
    title: "Рейтинг тренеров",
    description:
      "Оценки и отзывы других игроков помогут выбрать тренера, который подходит именно вам.",
  },
]

const steps = [
  {
    icon: UserPlus,
    title: "Зарегистрируйтесь",
    description:
      "Создайте аккаунт по email, укажите удобный район и время для тренировок и игр.",
  },
  {
    icon: Video,
    title: "Подтвердите уровень NTRP",
    description:
      "Пришлите видео тренировки или матча — мы определим ваш уровень NTRP, чтобы подбирать тренеров, соперников и группу в турнире по силам.",
  },
  {
    icon: Award,
    title: "Играйте и побеждайте",
    description:
      "Записывайтесь на тренировки к проверенным тренерам и участвуйте в турнирах: групповой этап по уровню NTRP, затем плей-офф за призы.",
  },
]

const prizes = [
  {
    icon: Gift,
    title: "Фирменный мерч Break Point",
  },
  {
    icon: Dumbbell,
    title: "Мячи и теннисный инвентарь",
  },
  {
    icon: Ticket,
    title: "Сертификаты на тренировки",
  },
]

export default function Home() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
        <Badge variant="secondary" className="mb-4">
          Теннис в Москве
        </Badge>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Найдите тренера и турнир по своему уровню
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Break Point — платформа для теннисистов-любителей в Москве:
          бронируйте тренировки с проверенными тренерами и участвуйте в
          турнирах, подобранных по вашему уровню NTRP.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" render={<Link href="/trainings" />} nativeButton={false}>
            Найти тренировку
          </Button>
          <Button
            size="lg"
            variant="outline"
            render={<Link href="/tournaments" />}
            nativeButton={false}
          >
            Турниры
          </Button>
        </div>
        <ul className="mt-10 flex flex-col items-center justify-center gap-4 text-sm text-muted-foreground sm:flex-row sm:gap-8">
          {heroPoints.map((point) => (
            <li key={point.text} className="flex items-center gap-2">
              <point.icon className="size-4 text-primary" />
              {point.text}
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:pb-28">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            Сложно найти соперника своего уровня и тренера, который подходит
            именно вам?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Break Point — платформа для регулярных тренировок и честных
            соревнований: находите тренеров и соперников по уровню NTRP,
            играйте в турнирах формата «группы + плей-офф» и получайте призы
            за победы.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <div className="mb-2 inline-flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <feature.icon className="size-5" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">
              Как играть
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              3 шага — и вы в игре
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((step, index) => (
              <Card key={step.title}>
                <CardHeader>
                  <div className="mb-2 flex items-center gap-3">
                    <div className="inline-flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <step.icon className="size-5" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Шаг {index + 1}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-muted-foreground">
            Сначала — групповой этап по уровню NTRP. Лучшие выходят в
            плей-офф, где уровни смешиваются, и начинается настоящая борьба
            за финал и призы.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            Выигрывайте призы
          </h2>
          <p className="mt-3 text-muted-foreground">
            За победы в турнирах и активность на платформе — мерч от Break
            Point, сертификаты на тренировки и подарки от партнёров.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {prizes.map((prize) => (
            <Card key={prize.title}>
              <CardHeader className="items-center text-center">
                <div className="mb-2 inline-flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <prize.icon className="size-6" />
                </div>
                <CardTitle className="text-base">{prize.title}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <Badge variant="secondary" className="mb-2 w-fit">
                  Новое
                </Badge>
                <CardTitle className="text-lg">
                  Реферальная программа
                </CardTitle>
                <CardDescription>
                  Приглашайте друзей в Break Point — друг получит скидку{" "}
                  {REFERRAL_DISCOUNT_PERCENT}% на первую тренировку или
                  турнир, а вы — бонусный промокод на{" "}
                  {REFERRAL_REWARD_PERCENT}%. Свой код — в личном кабинете.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Badge variant="secondary" className="mb-2 w-fit">
                  В разработке
                </Badge>
                <CardTitle className="text-lg">
                  Мобильное приложение
                </CardTitle>
                <CardDescription>
                  Турнирная сетка, поиск соперников и live-счёт матчей —
                  скоро в приложении Break Point.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
    </>
  )
}
