const digits = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX']

export const roman = (number: number) => {
  const tens = Math.floor(number / 10)
  return 'X'.repeat(tens) + (digits[number % 10 - 1] ?? '')
}
