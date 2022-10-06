export function truncateMiddle(fullStr, strLen, separator) {
  const realStrLength = strLen + separator.length

  if (fullStr.length <= realStrLength) return fullStr

  separator = separator || "..."

  const sepLen = separator.length,
    charsToShow = realStrLength - sepLen,
    frontChars = Math.ceil(charsToShow / 2),
    backChars = Math.floor(charsToShow / 2)

  return fullStr.substring(0, frontChars) +
    separator +
    fullStr.substring(fullStr.length - backChars)
}

export const addressFormat = (address, length = "lg") => (
  address?.substring(0, length === "lg" ? 6 : 4) + " ... " + address?.substring(address.length - 4, address.length)
)

export const truncate = (str, start, startEnd, endStart, end, separator) => (
  str.substring(start, startEnd) + separator + str.substring(endStart, end)
)

export const randomStr = (length) => {
  let result = ""
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength))
  }

  return result
}
