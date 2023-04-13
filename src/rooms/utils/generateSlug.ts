const pairs = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'j',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'kh',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ь: '',
  ы: 'y',
  ъ: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
};
const re = new RegExp(Object.keys(pairs).join('|'), 'gi');

const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(re, function (matched) {
      return pairs[matched];
    })
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');

export default generateSlug;
