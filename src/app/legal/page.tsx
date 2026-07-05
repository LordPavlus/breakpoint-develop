import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const documents = [
  {
    id: "agreement",
    title: "Пользовательское соглашение",
  },
  {
    id: "privacy",
    title: "Политика конфиденциальности",
  },
  {
    id: "offer",
    title: "Публичная оферта",
  },
  {
    id: "consent",
    title: "Согласие на обработку персональных данных",
  },
]

export default function LegalPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        Правовая информация
      </h1>
      <p className="mt-2 text-muted-foreground">
        Документы, регулирующие использование платформы Break Point. Актуальные
        версии будут опубликованы здесь до начала приёма платежей.
      </p>

      <div className="mt-8 space-y-8">
        {documents.map((document, index) => (
          <div key={document.id}>
            {index > 0 && <Separator className="mb-8" />}
            <section id={document.id} className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold text-foreground">
                  {document.title}
                </h2>
                <Badge variant="secondary">Готовится</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Документ находится в разработке и будет опубликован здесь до
                начала приёма платежей на платформе.
              </p>
            </section>
          </div>
        ))}
      </div>
    </div>
  )
}
