const isNotEmpty = (str: string): boolean => str !== ''

const isBoolean = (boolean: any): boolean => typeof boolean === 'boolean'

const removeQuotes = (str: string = ''): string => str.replace(/"/g, '')

const makeMap = (string: string, expectLowerCase?: boolean): {
  (val: string): boolean
} => {
  const map = Object.create(null)
  const list = string.split(',')
  list.map(item => (map[item] = true))

  return expectLowerCase ? val => map[val.toLowerCase()] : val => map[val]
}

const isUnaryTag = makeMap(
  'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
    'link,meta,param,source,track,wbr'
)

module.exports = {
  isNotEmpty,
  makeMap,
  isUnaryTag,
  removeQuotes,
  isBoolean
}
