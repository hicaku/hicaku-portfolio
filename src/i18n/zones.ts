import { t, tx } from './index'

interface Named {
  id: string
  name: string
  tag: string
  kind: string
}

/** The display name of a zone, translated when a translation exists. */
export const zname = (z: Pick<Named, 'id' | 'name'>): string => tx(`zone.${z.id}.name`, z.name)

/** The small caption under a zone name. Tour tags keep their English landmark but translate the country. */
export function ztag(z: Named): string {
  if (z.kind === 'gem') return t('zone.hidden.tag')
  if (z.kind === 'landmark') return t('zone.landmark.tag')
  if (z.kind === 'tour') {
    const [country, ...rest] = z.tag.split(' · ')
    return [tx(`zone.country.${country}`, country), ...rest].join(' · ')
  }
  return tx(`zone.${z.id}.tag`, z.tag)
}

export const zcountry = (country: string): string => tx(`zone.country.${country}`, country)