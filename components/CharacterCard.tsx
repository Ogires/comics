import Image from 'next/image'
import Link from 'next/link'
import type { CharacterSummary } from '@/types'

interface Props {
  character: CharacterSummary
}

export default function CharacterCard({ character }: Props) {
  return (
    <Link
      href={`/character/${character.id}`}
      className="block bg-slate-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-red-500 transition-all"
    >
      <div className="relative aspect-square">
        <Image
          src={character.image.medium_url || '/placeholder.png'}
          alt={character.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 230px"
          className="object-cover"
        />
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-slate-100 truncate">{character.name}</h3>
      </div>
    </Link>
  )
}
