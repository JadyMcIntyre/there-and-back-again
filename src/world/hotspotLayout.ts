type ScreenPoint = { x: number, y: number }
export type LabelBox = { left: number, right: number, y: number }

export function placeHotspotLabel(point: ScreenPoint, text: string, viewportWidth: number) {
  const width = Math.min(177, text.length * 6 + 18)
  const flip = point.x + width + 17 > viewportWidth
  const left = flip ? point.x - width - 14 : point.x + 14
  return { flip, box: { left, right: left + width, y: point.y } }
}

export function labelHasRoom(box: LabelBox, dots: ScreenPoint[], labels: LabelBox[]) {
  return labels.every(label => Math.abs(label.y - box.y) > 23 || label.right < box.left || label.left > box.right)
    && dots.every(point => Math.abs(point.y - box.y) > 17 || point.x < box.left - 10 || point.x > box.right + 10)
}
