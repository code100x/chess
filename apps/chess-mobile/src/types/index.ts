type ApiResponse = {
  id: string,
  name: string,
  token:string,
}

type AuthState<T> = [boolean, T | null];