/* ============================================================
   format-price.js — centralized Persian number/price formatting
   ============================================================ */
const faNumber = new Intl.NumberFormat('fa-IR');

export const formatNumber = (value) => faNumber.format(Number(value) || 0);

/** «۲,۸۹۰,۰۰۰ تومان» */
export const formatPrice = (value, { unit = true } = {}) =>
  `${faNumber.format(Number(value) || 0)}${unit ? ' تومان' : ''}`;

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

/** Convert latin digits in any string to Persian digits */
export const toFaDigits = (input) =>
  String(input).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);

/** Normalize Persian/Arabic digits to latin for parsing user input */
export const toLatinDigits = (input) =>
  String(input)
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

/** Discount percentage label e.g. «۲۰٪» */
export const formatDiscount = (price, originalPrice) => {
  if (!originalPrice || originalPrice <= price) return null;
  return formatNumber(Math.round(((originalPrice - price) / originalPrice) * 100)) + '٪';
};
