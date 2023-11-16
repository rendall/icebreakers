export const toSlug = (str: string):string => str
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/_/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/-$/, "")
    .replace(/^-/, "")

export const isSlugMatch = (slug: string, question: string) => slug === toSlug(question);

export const reverseSlug = (slug: string, questions: string[]) => questions.find((question) => isSlugMatch(slug, question));