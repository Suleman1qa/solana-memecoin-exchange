// This script logs API errors for debugging login issues

export function logApiError(error) {
  if (error.response) {
    console.log('API Error:', error.response.status, error.response.data);
  } else if (error.request) {
    console.log('API No Response:', error.request);
  } else {
    console.log('API Error:', error.message);
  }
}
