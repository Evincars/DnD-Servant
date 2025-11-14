import { Get, Paths, SetOptional } from 'type-fest';
import { FormFieldToModelMapper } from './form-field-to-model-mapper';

export type FormMapper<TForm, TModel, TRequestModel = undefined> = {
  // applied first
  twoWayBindings?: FormToModelMapper<TForm, TModel>;
  formToModelCustomMapper?: (form: TForm, model: TModel) => TModel;
  modelToFormCustomMapper?: (model: TModel, form: TForm) => TForm;
  errorPathPrefix?: Paths<TRequestModel>;
};

export type FormToModelMapper<Form, Model> = {
  [FormPath in Paths<Form, { bracketNotation: false; maxRecursionDepth: 3 }>]?: Paths<Model> extends infer ModelPath
    ? FormPath extends string
      ? ModelPath extends string
        ? Get<Model, ModelPath> extends Get<Form, FormPath>
          ?
              | ModelPath
              | SetOptional<
                  FormFieldToModelMapper<Get<Form, FormPath>, Get<Model, ModelPath>, ModelPath>,
                  'formToModelValueConverter' | 'modelToFormValueConverter'
                >
          :
              | FormFieldToModelMapper<Get<Form, FormPath>, Get<Model, ModelPath>, ModelPath>
              | FormFieldToModelMapper<Get<Form, FormPath>, Get<Model, ModelPath>, ModelPath>[]
        : never
      : never
    : never;
};
