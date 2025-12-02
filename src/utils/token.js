export function saveToken(token) {
    localStorage.setItem("aguiar_token", token);
  }
  
  export function getToken() {
    return localStorage.getItem("aguiar_token");
  }
  
  export function clearToken() {
    localStorage.removeItem("aguiar_token");
  }
  