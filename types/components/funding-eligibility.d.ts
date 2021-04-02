export type getFundingSources = () => string[];
export type isFundingEligible = (fundingSource: string) => boolean;
export type rememberFunding = (fundingSource: string[]) => void;
