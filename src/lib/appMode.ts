export function isStudyPath(pathname: string | null | undefined) {
  return Boolean(pathname && pathname.startsWith("/study"));
}

