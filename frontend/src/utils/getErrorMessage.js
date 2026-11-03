export function getErrorMessage(error) {
  if (!error.response) {
    return "Сервер недоступен. Проверьте, что бэкенд запущен";
  }
  const detail = error.response.data?.detail;
  if (typeof detail === "string") {
    return detail;
  }
  return "Что-то пошло не так. Попробуйте ещё раз";
}
