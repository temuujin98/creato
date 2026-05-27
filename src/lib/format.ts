export function formatCurrency(value: number) {
  return new Intl.NumberFormat("mn-MN").format(value) + "₮";
}
