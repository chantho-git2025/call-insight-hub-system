
interface ServiceTypeCategory {
  name: string;
  symptoms: string[];
}

export const serviceTypeCategories: ServiceTypeCategory[] = [
  {
    name: "Care after Installation",
    symptoms: [
      "Customer busy not take survey",
      "Customer no need survey",
      "Not meet user",
      "Rating 1 Star",
      "Rating 2 Stars",
      "Rating 3 Stars",
      "Rating 4 Stars",
      "Rating 5 Stars"
    ]
  },
  {
    name: "Care after Maintenance",
    symptoms: [
      "Customer busy not take survey",
      "Customer no need survey",
      "Not meet user",
      "Rating 1 Star",
      "Rating 2 Stars",
      "Rating 3 Stars",
      "Rating 4 Stars",
      "Rating 5 Stars"
    ]
  },
  {
    name: "Complaint / Support",
    symptoms: [
      "Care Disconnect & Declined",
      "Care Disconnect & No Need Support",
      "Care Disconnect & Satisfied",
      "Configuration",
      "Confuse Number",
      "EDC/City Hall/TC/TRC Cut cable",
      "Equipment Not Working",
      "FO Issues",
      "Foreigner Customer",
      "Internet Not Working",
      "Internet service quality",
      "Internet Slow",
      "Internet Unstable",
      "Others",
      "POP Down",
      "Replace Splitter",
      "Re-Run in House",
      "Services Remind",
      "Test Speed",
      "Unidentified Customer",
      "Unidentified Issue"
    ]
  },
  {
    name: "Request CUS/Farmer",
    symptoms: [
      "Billing Info",
      "Buying/Warranty Equipment",
      "Change location",
      "Change Package",
      "Collect money",
      "Customer want terminate service",
      "Others",
      "Payment Confirmation",
      "Payment Issue",
      "Potential Customer",
      "Promotion",
      "Re-activate Service",
      "Rent IP Public",
      "Request Receipt & Invoice",
      "Request Unlock Service",
      "Return money",
      "Update customer information"
    ]
  },
  {
    name: "Unreachable",
    symptoms: [
      "Call no answer",
      "Cannot Contact"
    ]
  },
  {
    name: "Potential Customer",
    symptoms: [
      "Business Internet & Data Connectivity (DPLC)",
      "Cannot Contact",
      "CC Follow Up",
      "Colocation & VPS (DR, Datacenter, zStack)",
      "Cus. Thinking. Not surveyed yet",
      "Customer Corp",
      "Customer Interested in Service",
      "Domain, Email/Web Hosting & Development",
      "Fail",
      "Other Value Added Services (Hotspot, SaaS)",
      "PBX and Call Center (Voice)",
      "SIM Survey",
      "SMS, OTP, MDA & Messaging",
      "Won"
    ]
  }
];
