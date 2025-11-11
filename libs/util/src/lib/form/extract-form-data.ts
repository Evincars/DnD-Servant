import { FormArray, FormControl, FormGroup, FormRecord } from '@angular/forms';

export type ExtractFormData<TForm> = TForm extends FormControl<infer FormControlData>
  ? FormControlData
  : TForm extends FormGroup<infer TFormGroupControls>
  ? { [FormGroupKey in keyof TFormGroupControls]: ExtractFormData<TFormGroupControls[FormGroupKey]> }
  : TForm extends FormArray<infer TFormArrayGroup>
  ? Array<ExtractFormData<TFormArrayGroup>>
  : TForm extends FormRecord<infer TFormRecordGroup>
  ? Record<string, ExtractFormData<TFormRecordGroup>>
  : { [TFormKey in keyof TForm]: ExtractFormData<TForm[TFormKey]> };
