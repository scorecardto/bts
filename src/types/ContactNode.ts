type ContactNode = {
  name?: string;
  phoneNumber: string;
  hasAccount?: boolean;
  uid?: string;
  score?: number;
  gender?: "MALE" | "FEMALE" | null;
  contactLink?: any;
};

export default ContactNode;
