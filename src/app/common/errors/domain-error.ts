export class DomainError extends Error {
  constructor(
    public readonly message: string,
    public readonly code: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'DomainError';
  }
}
