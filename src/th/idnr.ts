/**
 * IDNR (Thai identity card)
 *
 * The Thai identity card (Thai: บัตรประจำตัวประชาชนไทย)
 * is an official identity document issued to Thai nationals between the age of 7 and 70 years.
 *
 * Source
 *   https://en.wikipedia.org/wiki/Thai_identity_card
 *
 * PERSON
 */

import * as exceptions from '../exceptions';
import { strings } from '../util';
import { Validator, ValidateReturn } from '../types';
import { weightedSum } from '../util/checksum';

function clean(input: string): ReturnType<typeof strings.cleanUnicode> {
  return strings.cleanUnicode(input, ' -');
}

const impl: Validator = {
  name: 'Thai National Identity Card Number',
  localName: 'บัตรประจำตัวประชาชนไทย',
  abbreviation: 'IDNR',
  compact(input: string): string {
    const [value, err] = clean(input);

    if (err) {
      throw err;
    }

    return value;
  },

  format(input: string): string {
    const [value] = clean(input);

    return strings.splitAt(value, 1, 5, 10, 12).join('-');
  },

  validate(input: string): ValidateReturn {
    const [value, error] = clean(input);

    if (error) {
      return { isValid: false, error };
    }
    if (value.length !== 13) {
      return { isValid: false, error: new exceptions.InvalidLength() };
    }
    if (!strings.isdigits(value)) {
      return { isValid: false, error: new exceptions.InvalidFormat() };
    }

    const [front, check] = strings.splitAt(value, 12);

    const sum = weightedSum(front, {
      weights: [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
      modulus: 11,
    });

    if (String((11 - sum) % 11) !== check) {
      return { isValid: false, error: new exceptions.InvalidChecksum() };
    }

    return {
      isValid: true,
      compact: value,
      isIndividual: true,
      isCompany: false,
    };
  },
};

export const {
  name,
  localName,
  abbreviation,
  validate,
  format,
  compact,
} = impl;
