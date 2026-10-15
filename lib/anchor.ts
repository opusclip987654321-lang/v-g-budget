// Ancre d'un intertitre : « Où acheter en circuit court ? » → « ou-acheter-en-circuit-court ».
export const anchor = (title: string) => title.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\*\*|\[|\]\([^)]*\)/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
