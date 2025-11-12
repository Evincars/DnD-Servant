import { AbstractControl, FormGroup } from '@angular/forms';
import { ObjectUtil } from './object-util';
import { FormMapper } from './form/form-to-model-mapper';
import { FormFieldToModelMapper } from './form/form-field-to-model-mapper';

type ControlKeys<T extends AbstractControl> = T extends FormGroup<infer Controls> ? Extract<keyof Controls, string> : never;

export class FormUtil {
  static convertFormToModel<TFormData extends object, TModel extends object, TRequestModel>(
    cpForm: TFormData,
    mapper: FormMapper<TFormData, TModel, TRequestModel>,
    existingModel?: TModel, // useful for http put
  ): TModel {
    let model: TModel = existingModel ?? ({} as TModel);

    if (mapper.twoWayBindings) {
      Object.entries(mapper.twoWayBindings).forEach(([formPath, modelPathOrFieldMapper]) => {
        const formValue = ObjectUtil.getPropertyValueByPath(cpForm, formPath);
        let modelPath = '';

        if (typeof modelPathOrFieldMapper === 'string') {
          modelPath = modelPathOrFieldMapper;
        } else {
          const fieldMapper = modelPathOrFieldMapper as FormFieldToModelMapper<unknown, unknown, string>;
          modelPath = fieldMapper.modelPath;
        }

        const formToModelValueConverter = (modelPathOrFieldMapper as FormFieldToModelMapper<unknown, unknown, unknown>)
          .formToModelValueConverter;
        const modelValue = formToModelValueConverter ? formToModelValueConverter(formValue) : formValue;
        ObjectUtil.setPropertyValueByPath(model, modelPath, modelValue);
      });
    }

    if (mapper.formToModelCustomMapper) {
      model = mapper.formToModelCustomMapper(cpForm, model);
    }

    return ObjectUtil.cleanupEmptyProperties(model);
  }

  static convertModelToForm<TFormData extends object, TModel extends object>(
    cpModel: TModel,
    mapper: FormMapper<TFormData, TModel>,
  ): TFormData {
    const form: TFormData = {} as TFormData;

    if (mapper.twoWayBindings) {
      Object.entries(mapper.twoWayBindings).forEach(([formPath, modelPathOrFieldMapper]) => {
        const modelPath =
          typeof modelPathOrFieldMapper === 'string'
            ? modelPathOrFieldMapper
            : ((modelPathOrFieldMapper as FormFieldToModelMapper<unknown, unknown, unknown>).modelPath as string);
        const modelValue = ObjectUtil.getPropertyValueByPath(cpModel, modelPath);
        const modelToFormValueConverter = (modelPathOrFieldMapper as FormFieldToModelMapper<unknown, unknown, unknown>)
          .modelToFormValueConverter;
        const formValue = modelToFormValueConverter ? modelToFormValueConverter(modelValue) : modelValue;
        ObjectUtil.setPropertyValueByPath(form, formPath, formValue);
      });
    }

    if (mapper.modelToFormCustomMapper) {
      mapper.modelToFormCustomMapper(cpModel, form);
    }

    return ObjectUtil.cleanupEmptyProperties(form);
  }
}
