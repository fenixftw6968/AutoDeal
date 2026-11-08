export type Role = 'ROLE_CUSTOMER' | 'ROLE_DEALER' | 'ROLE_ADMIN';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  city?: string;
  dealershipName?: string;
  dealershipLicense?: string;
  verifiedDealer?: boolean;
  roles: Role[];
}

export interface AuthResponse {
  token: string;
  type: string;
  id: string;
  email: string;
  fullName: string;
  city?: string;
  dealershipName?: string;
  verifiedDealer?: boolean;
  roles: Role[];
}

export type CampaignStatus = 
  | 'OPEN'
  | 'TARGET_REACHED'
  | 'NEGOTIATING'
  | 'OFFER_AVAILABLE'
  | 'COMPLETED'
  | 'EXPIRED';

export interface ParticipantInfo {
  userId: string;
  fullName: string;
  preferredColor: string;
  joinedAt: string;
}

export interface Campaign {
  id: string;
  title: string;
  brand: string;
  model: string;
  variant: string;
  city: string;
  state?: string;
  targetBuyers: number;
  currentBuyers: number;
  deadline: string;
  status: CampaignStatus;
  creatorId: string;
  creatorName: string;
  carImageUrl?: string;
  estimatedMSRP?: number;
  description?: string;
  participantIds: string[];
  participants: ParticipantInfo[];
  createdAt?: string;
  updatedAt?: string;
}

export type OfferStatus = 'ACTIVE' | 'ACCEPTED' | 'WITHDRAWN' | 'EXPIRED';

export interface DealerOffer {
  id: string;
  campaignId: string;
  dealerId: string;
  dealershipName: string;
  dealershipCity: string;
  verifiedDealer: boolean;
  carVariant: string;
  exShowroomPrice: number;
  groupDiscountAmount: number;
  estimatedOnRoadPrice: number;
  inclusions: string[];
  exclusions: string[];
  validityPeriod: string;
  termsAndConditions: string;
  minimumCommitmentUnits: number;
  status: OfferStatus;
  isDemoData: boolean;
  createdAt?: string;
}

export interface ChatMessage {
  id: string;
  campaignId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  type: 'CHAT' | 'SYSTEM' | 'OFFER_ALERT' | 'MILESTONE';
  timestamp: string;
}

export interface LiveCampaignEvent {
  eventType: 'MEMBER_JOINED' | 'MEMBER_LEFT' | 'TARGET_REACHED' | 'OFFER_SUBMITTED' | 'STATUS_CHANGED';
  campaignId: string;
  currentBuyers: number;
  targetBuyers: number;
  message: string;
  payload?: any;
  timestamp: string;
}

export interface Car {
  id: string;
  brand: string;
  model: string;
  bodyType: string;
  startingMsrp: number;
  imageUrl: string;
  availableVariants: string[];
  popularColors: string[];
}
