export const feesStructure = {
  title: 'Transparent Fee Structure',
  description: 'Clear and flexible payment options for all our programs',
  programs: [
    {
      name: 'Toddlers',
      ageGroup: 'Ages 2-3',
      fees: [
        { period: 'Monthly', amount: 8000, description: 'Per month' },
        { period: 'Quarterly', amount: 23000, description: 'Per 3 months (save 4%)' },
        { period: 'Half Yearly', amount: 45000, description: 'Per 6 months (save 6%)' },
        { period: 'Annually', amount: 88000, description: 'Per year (save 8%)' }
      ],
      highlights: ['5 days a week', 'Morning & Afternoon batches', 'Flexible timings']
    },
    {
      name: 'Nursery',
      ageGroup: 'Ages 3-4',
      fees: [
        { period: 'Monthly', amount: 9500, description: 'Per month' },
        { period: 'Quarterly', amount: 27300, description: 'Per 3 months (save 4%)' },
        { period: 'Half Yearly', amount: 53400, description: 'Per 6 months (save 6%)' },
        { period: 'Annually', amount: 104400, description: 'Per year (save 8%)' }
      ],
      highlights: ['5 days a week', 'Structured curriculum', 'Play-based learning']
    },
    {
      name: 'Pre-K',
      ageGroup: 'Ages 4-5',
      fees: [
        { period: 'Monthly', amount: 11000, description: 'Per month' },
        { period: 'Quarterly', amount: 31680, description: 'Per 3 months (save 4%)' },
        { period: 'Half Yearly', amount: 61920, description: 'Per 6 months (save 6%)' },
        { period: 'Annually', amount: 121440, description: 'Per year (save 8%)' }
      ],
      highlights: ['5 days a week', 'Pre-academics focus', 'School readiness']
    },
    {
      name: 'Kindergarten',
      ageGroup: 'Ages 5-6',
      fees: [
        { period: 'Monthly', amount: 12500, description: 'Per month' },
        { period: 'Quarterly', amount: 36000, description: 'Per 3 months (save 4%)' },
        { period: 'Half Yearly', amount: 70200, description: 'Per 6 months (save 6%)' },
        { period: 'Annually', amount: 137800, description: 'Per year (save 8%)' }
      ],
      highlights: ['5 days a week', 'Full academics', 'School transition ready']
    }
  ],
  additionalCharges: [
    { name: 'Admission Fee', amount: 5000, description: 'One-time registration', frequency: 'One time' },
    { name: 'Annual Fee', amount: 2000, description: 'Per academic year', frequency: 'Yearly' },
    { name: 'Activity Fee', amount: 1500, description: 'Art, music, sports', frequency: 'Monthly' },
    { name: 'Transport (Optional)', amount: 3000, description: 'Pick & drop facility', frequency: 'Monthly' }
  ],
  discounts: [
    { type: 'Sibling Discount', value: '10%', description: 'For 2nd and subsequent children' },
    { type: 'Annual Payment Discount', value: '8%', description: 'Pay full year in advance' },
    { type: 'Quarterly Discount', value: '4%', description: 'Pay 3 months in advance' }
  ],
  paymentMethods: [
    'Cash',
    'Cheque',
    'Bank Transfer',
    'Online Payment (Credit/Debit Card)',
    'Digital Wallets'
  ],
  policies: [
    'Fees are due by 5th of every month',
    'Late payment fee: Rs. 500 after 10th of the month',
    'Admission fee is non-refundable',
    'Fees are non-refundable; however, transfer to another month is allowed',
    'Annual fee must be paid every academic year (April onwards)',
    'EMI options available on request for annual fees'
  ]
};
