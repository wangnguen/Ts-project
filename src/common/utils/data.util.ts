import { pick } from 'lodash'

export const getInfoData = <T extends object, K extends keyof T>({
  fields,
  object
}: {
  fields: K[]
  object: T
}): Pick<T, K> => {
  return pick(object, fields) as Pick<T, K>
}
