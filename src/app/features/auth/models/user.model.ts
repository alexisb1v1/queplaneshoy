export interface UserModel {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  avatarUrl?: string;
  role: string;
  isOrganizer?: boolean;
  organizerName?: string | null;
  organizerDocumentType?: string | null;
  organizerDocumentNumber?: string | null;
  organizerPhone?: string | null;
  organizerLogoUrl?: string | null;
  organizerVerifiedAt?: string | Date | null;
  emailVerifiedAt?: string | Date | null;
  createdAt?: string | Date;
}
