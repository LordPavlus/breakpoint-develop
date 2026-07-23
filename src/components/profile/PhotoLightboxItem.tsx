"use client"

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

export function PhotoLightboxItem({ url, className }: { url: string; className?: string }) {
  return (
    <Dialog>
      <DialogTrigger render={<button type="button" className={className} />}>
        {/* eslint-disable-next-line @next/next/no-img-element -- прямая ссылка на R2 */}
        <img src={url} alt="" className="size-full object-cover" />
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        {/* eslint-disable-next-line @next/next/no-img-element -- прямая ссылка на R2 */}
        <img src={url} alt="" className="max-h-[80vh] w-full rounded-lg object-contain" />
      </DialogContent>
    </Dialog>
  )
}
