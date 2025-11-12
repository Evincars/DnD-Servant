import { FormMapper } from '@dn-d-servant/util';
import { CharacterSheetApiModel, CharacterSheetFormData } from '../../../util/src/lib/character-sheet-form';

export class CharacterSheetFormModelMappers {
  static characterSheetFormToApiMapper: FormMapper<CharacterSheetFormData, CharacterSheetApiModel> = {
    twoWayBindings: {
      'topInfo.rasa': 'topInfo.rasa',
      'topInfo.povolani': 'topInfo.povolani',
      'topInfo.zazemi': 'topInfo.zazemi',
      'topInfo.presvedceni': 'topInfo.presvedceni',
      'topInfo.jmenoPostavy': 'topInfo.jmenoPostavy',
      'topInfo.uroven': 'topInfo.uroven',
      'topInfo.zkusenosti': 'topInfo.zkusenosti',
      'topInfo.hrac': 'topInfo.hrac',
    },
  };
}
