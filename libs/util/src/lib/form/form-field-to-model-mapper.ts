export type FormFieldToModelMapper<FormValueType, ModelValueType, Path> = {
  modelPath: Path;
  formToModelValueConverter: (value: FormValueType) => ModelValueType;
  modelToFormValueConverter: (value: ModelValueType) => FormValueType;
};
