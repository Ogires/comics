import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import type { CharacterSummary } from '@/types'

interface Props {
  character: CharacterSummary
}

export default function CharacterCard({ character }: Props) {
  return (
    <Link href={`/character/${character.id}`}>
      <Card className="overflow-hidden hover:ring-2 hover:ring-red-500 transition-all py-0 gap-0">
        <div className="relative aspect-square">
          <Image
            src={character.image.medium_url || '/placeholder.png'}
            alt={character.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 230px"
            className="object-cover"
          />
        </div>
        <CardContent className="p-3">
          <h3 className="font-semibold text-slate-100 truncate">{character.name}</h3>
        </CardContent>
      </Card>
    </Link>
  )
}
