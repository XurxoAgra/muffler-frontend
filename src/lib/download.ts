/** Revoking the object URL right after click() can abort the download in Firefox and Safari. */
const REVOKE_DELAY_MS = 10_000

/** Saves a blob as a file through a temporary <a download>, for files that need an authenticated fetch. */
export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS)
}
