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

      'abilityBonus.zdatnostniBonus': 'abilityBonus.zdatnostniBonus',
      'abilityBonus.inspirace': 'abilityBonus.inspirace',
      'abilityBonus.iniciativa': 'abilityBonus.iniciativa',

      'speedAndHealingDices.lehke': 'speedAndHealingDices.lehke',
      'speedAndHealingDices.stredni': 'speedAndHealingDices.stredni',
      'speedAndHealingDices.tezke': 'speedAndHealingDices.tezke',
      'speedAndHealingDices.pouzitiKostek': 'speedAndHealingDices.pouzitiKostek',
      'speedAndHealingDices.maxPouzitiKostek': 'speedAndHealingDices.maxPouzitiKostek',
      'speedAndHealingDices.smrtUspech1': 'speedAndHealingDices.smrtUspech1',
      'speedAndHealingDices.smrtUspech2': 'speedAndHealingDices.smrtUspech2',
      'speedAndHealingDices.smrtUspech3': 'speedAndHealingDices.smrtUspech3',
      'speedAndHealingDices.smrtNeuspech1': 'speedAndHealingDices.smrtNeuspech1',
      'speedAndHealingDices.smrtNeuspech2': 'speedAndHealingDices.smrtNeuspech2',
      'speedAndHealingDices.smrtNeuspech3': 'speedAndHealingDices.smrtNeuspech3',
      'speedAndHealingDices.maxBoduVydrze': 'speedAndHealingDices.maxBoduVydrze',

      infoAboutCharacter: 'infoAboutCharacter',

      'armorClass.zbroj': 'armorClass.zbroj',
      'armorClass.bezeZbroje': 'armorClass.bezeZbroje',
      'armorClass.jine': 'armorClass.jine',
      'armorClass.zdatnostLehke': 'armorClass.zdatnostLehke',
      'armorClass.zdatnostStredni': 'armorClass.zdatnostStredni',
      'armorClass.zdatnostTezke': 'armorClass.zdatnostTezke',
      'armorClass.zdatnostStity': 'armorClass.zdatnostStity',

      'savingThrowsForm.silaZdatnost': 'savingThrowsForm.silaZdatnost',
      'savingThrowsForm.sila': 'savingThrowsForm.sila',
      'savingThrowsForm.obratnostZdatnost': 'savingThrowsForm.obratnostZdatnost',
      'savingThrowsForm.obratnost': 'savingThrowsForm.obratnost',
      'savingThrowsForm.odolnostZdatnost': 'savingThrowsForm.odolnostZdatnost',
      'savingThrowsForm.odolnost': 'savingThrowsForm.odolnost',
      'savingThrowsForm.inteligenceZdatnost': 'savingThrowsForm.inteligenceZdatnost',
      'savingThrowsForm.inteligence': 'savingThrowsForm.inteligence',
      'savingThrowsForm.moudrostZdatnost': 'savingThrowsForm.moudrostZdatnost',
      'savingThrowsForm.moudrost': 'savingThrowsForm.moudrost',
      'savingThrowsForm.charismaZdatnost': 'savingThrowsForm.charismaZdatnost',
      'savingThrowsForm.charisma': 'savingThrowsForm.charisma', // these two lines problematic

      'passiveSkillsForm.atletikaZdatnost': 'passiveSkillsForm.atletikaZdatnost',
      'passiveSkillsForm.atletika': 'passiveSkillsForm.atletika',
      'passiveSkillsForm.akrobacieZdatnost': 'passiveSkillsForm.akrobacieZdatnost',
      'passiveSkillsForm.akrobacie': 'passiveSkillsForm.akrobacie',
      'passiveSkillsForm.nenapadnostZdatnost': 'passiveSkillsForm.nenapadnostZdatnost',
      'passiveSkillsForm.nenapadnost': 'passiveSkillsForm.nenapadnost',
      'passiveSkillsForm.vhledZdatnost': 'passiveSkillsForm.vhledZdatnost',
      'passiveSkillsForm.vhled': 'passiveSkillsForm.vhled',
      'passiveSkillsForm.vnimaniZdatnost': 'passiveSkillsForm.vnimaniZdatnost',
      'passiveSkillsForm.vnimani': 'passiveSkillsForm.vnimani',
      'passiveSkillsForm.jineZdatnost': 'passiveSkillsForm.jineZdatnost',
      'passiveSkillsForm.jineNazev': 'passiveSkillsForm.jineNazev',
      'passiveSkillsForm.jine': 'passiveSkillsForm.jine',

      // todo: spell slots and alchemist chest
      'spellsAndAlchemistChestForm.vlastnost': 'spellsAndAlchemistChestForm.vlastnost',
      'spellsAndAlchemistChestForm.utBonus': 'spellsAndAlchemistChestForm.utBonus',
      'spellsAndAlchemistChestForm.soZachrany': 'spellsAndAlchemistChestForm.soZachrany',
    },
  };
}
