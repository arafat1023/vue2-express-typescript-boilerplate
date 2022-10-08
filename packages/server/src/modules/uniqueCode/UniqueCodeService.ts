import { customAlphabet } from 'nanoid';
import * as UniqueCodeModel from './UniqueCodeModel';

export default class UniqueCodeService {
  /**
   * This is essentially the base64 map without the last two values
   */
  private static map = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K',
    'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
    'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k',
    'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x',
    'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  private static alphabets = UniqueCodeService.map.join('');

  /**
   * get a unique code
   * The last two values of base64 mapping is + and / which might cause problem when used in URL.
   * Thus we implement a base62 mapping that utilizes only alpha-num characters
   */
  private static async _get(kind: 'user', length = 3) {
    let numericCode = await UniqueCodeModel.getCode(kind);
    const codeParts = [];
    while (numericCode) {
      const remainder = numericCode % 62;
      codeParts.unshift(UniqueCodeService.map[remainder]);
      numericCode = Math.floor(numericCode / 62);
    }

    return codeParts.join('').padStart(length, UniqueCodeService.map[0]);
  }

  private static _getNanoId(length = 10) {
    const nanoId = customAlphabet(this.alphabets, length);
    return nanoId();
  }

  static getForUser(): string {
    return UniqueCodeService._getNanoId();
  }
}
