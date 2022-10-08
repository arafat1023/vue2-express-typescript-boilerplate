import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'sortByStructure', async: false })
export class SortByStructure implements ValidatorConstraintInterface {
  // eslint-disable-next-line class-methods-use-this
  validate(value: unknown, validationArguments?: ValidationArguments): boolean {
    if (!(value instanceof Object)) {
      return false;
    }

    return Object.entries(value)
      .every(([key, value]) => typeof value === 'number'
          && [1, -1].includes(value)
          && validationArguments?.constraints.includes(key));
  }
}
