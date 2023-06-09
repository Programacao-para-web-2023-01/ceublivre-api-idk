export function modelError(field: string, type: string) {
  return {
    required_error: `O campo '${field}' é obrigatório`,
    invalid_type_error: `O tipo do campo '${field}' deve ser '${type}'`,
  };
}
